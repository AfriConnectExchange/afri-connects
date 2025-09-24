import { Request, Response } from 'express';
import admin from 'firebase-admin';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { createOtp, getOtp, deleteOtp, incrementOtpAttempts } from './otpService';
import { recordFailedLogin, isLocked, resetAttempts } from './loginAttemptService';
import { sendEmail, sendSms } from './messaging';
import { getAvatarUploadUrl, removeAvatar } from './profileService';

const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;

async function identityToolkitSignInWithPassword(email: string, password: string) {
  if (!FIREBASE_WEB_API_KEY) throw new Error('FIREBASE_WEB_API_KEY not configured');
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`;
  const resp = await fetch(url, { method: 'POST', body: JSON.stringify({ email, password, returnSecureToken: true }), headers: { 'Content-Type': 'application/json' } });
  return resp.json();
}

// In-memory OTP store (scaffold). Replace with Redis or DB in production.
const otpStore: Record<string, { code: string; expiresAt: number; attempts: number; blockedUntil?: number }> = {};

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Helper: password strength check
function validatePassword(p: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p);
}

export async function registerEmail(req: Request, res: Response) {
  const { email } = req.body;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format. Please use name@domain.com.' });
  }

  try {
    // Check duplicate
    const existing = await admin.auth().getUserByEmail?.(email).catch(() => null);
    if (existing) {
      return res.status(409).json({ message: 'This email is already registered. Please log in or reset your password.' });
    }

    // Create disabled user record with metadata
    const userRecord = await admin.auth().createUser({ email, emailVerified: false, disabled: true });

    // Issue a verification token (store as custom claim or use signed token). We'll use a one-time token in user customClaims.
    const token = generateToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h

    await admin.firestore().collection('emailVerifications').doc(token).set({ uid: userRecord.uid, email, expiresAt });

    // Send verification link (frontend will call /auth/verify-email?token=...)
    const link = `${process.env.FRONTEND_BASE_URL}/auth/verify?token=${token}`;
    await sendEmail(email, 'Verify your AfriConnect account', `<p>Click <a href="${link}">here</a> to verify your email. Link expires in 24 hours.</p>`).catch(err => console.error('sendEmail error', err));

    return res.status(200).json({ message: 'Verification email sent.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function verifyEmailToken(req: Request, res: Response) {
  const { token } = req.query as any;
  if (!token) return res.status(400).json({ message: 'Token required.' });

  const doc = await admin.firestore().collection('emailVerifications').doc(token).get();
  if (!doc.exists) return res.status(410).json({ message: 'Verification link expired. Please request a new link.' });
  const data = doc.data() as any;
  if (Date.now() > data.expiresAt) {
    await doc.ref.delete();
    return res.status(410).json({ message: 'Verification link expired. Please request a new link.' });
  }

  // Valid: respond with uid so frontend can prompt password setup
  return res.status(200).json({ uid: data.uid, email: data.email });
}

export async function finishSetPassword(req: Request, res: Response) {
  const { uid, password } = req.body;
  if (!uid || !password) return res.status(400).json({ message: 'Missing uid or password.' });
  if (!validatePassword(password)) {
    return res.status(400).json({ message: 'Password does not meet security rules.' });
  }

  try {
    await admin.auth().updateUser(uid, { password, disabled: false, emailVerified: true });

    // Start 3-month free access period in Firestore user metadata
    const freeUntil = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString();
    await admin.firestore().collection('users').doc(uid).set({ freeAccessExpiresAt: freeUntil }, { merge: true });

    // Remove any verification docs
    // (In production, associate token with uid and delete by token)

    return res.status(200).json({ message: 'Account activated.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function loginEmailPassword(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password.' });

  try {
    // Check lock
    const locked = await isLocked(email);
    if (locked) return res.status(423).json({ message: 'Account locked. Try later.' });

    const result = await identityToolkitSignInWithPassword(email, password).catch(err => ({ error: err }));
    if (result && (result as any).error) {
      // record failed attempt
      await recordFailedLogin(email);
      // Check if now locked
      const nowLocked = await isLocked(email);
      if (nowLocked) {
        // send email alert if possible
        const user = await admin.auth().getUserByEmail(email).catch(() => null);
        if (user) await sendEmail(email, 'Account locked', `<p>Your account has been locked due to multiple failed sign-in attempts.</p>`).catch(() => null);
        return res.status(423).json({ message: 'Account locked due to multiple failed attempts.' });
      }
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    // Success: reset attempts
    await resetAttempts(email);
    // return idToken and refreshToken to the client
    return res.status(200).json({ idToken: (result as any).idToken, refreshToken: (result as any).refreshToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function changeEmail(req: Request, res: Response) {
  const { idToken, newEmail } = req.body;
  if (!idToken || !newEmail) return res.status(400).json({ message: 'Missing token or new email.' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) return res.status(400).json({ message: 'Invalid email format. Please use name@domain.com.' });
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Create change token stored in firestore
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await admin.firestore().collection('emailChangeRequests').doc(token).set({ uid: decoded.uid, newEmail, expiresAt });
    const link = `${process.env.FRONTEND_BASE_URL}/auth/confirm-change-email?token=${token}`;
    await sendEmail(newEmail, 'Confirm your new email', `<p>Click <a href="${link}">here</a> to confirm your new email address.</p>`).catch(err => console.error(err));
    return res.status(200).json({ message: 'Verification sent to new email.' });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// Re-export profile service handlers for route imports
export { getAvatarUploadUrl, removeAvatar };

export async function requestPasswordReset(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required.' });
  try {
    const user = await admin.auth().getUserByEmail?.(email).catch(() => null);
    if (!user) return res.status(404).json({ message: 'No account found with this email.' });

    const token = generateToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await admin.firestore().collection('passwordResets').doc(token).set({ uid: user.uid, expiresAt });

    const link = `${process.env.FRONTEND_BASE_URL}/auth/reset-password?token=${token}`;
    await sendEmail(email, 'AfriConnect password reset', `<p>Reset your password: <a href="${link}">Reset</a>. Link expires in 24 hours.</p>`).catch(err => console.error('sendEmail error', err));
    return res.status(200).json({ message: 'Password reset link sent.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Missing token or password.' });
  if (!validatePassword(password)) return res.status(400).json({ message: 'Password does not meet security rules.' });

  const doc = await admin.firestore().collection('passwordResets').doc(token).get();
  if (!doc.exists) return res.status(410).json({ message: 'Reset link expired.' });
  const data = doc.data() as any;
  if (Date.now() > data.expiresAt) {
    await doc.ref.delete();
    return res.status(410).json({ message: 'Reset link expired.' });
  }

  try {
    await admin.auth().updateUser(data.uid, { password });
    await doc.ref.delete();
    return res.status(200).json({ message: 'Password updated.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Phone/OTP registration and login
export async function sendOtp(req: Request, res: Response) {
  const { phone } = req.body;
  if (!phone || !/^\+?[1-9]\d{7,14}$/.test(phone)) return res.status(400).json({ message: 'Invalid phone number format.' });
  try {
    const code = await createOtp(phone);
    await sendSms(phone, `Your AfriConnect OTP is ${code}. It expires in 5 minutes.`).catch(err => console.error('sendSms error', err));
    return res.status(200).json({ message: 'OTP sent.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ message: 'Missing phone or code.' });
  const state = await getOtp(phone);
  if (!state) return res.status(410).json({ message: 'OTP is invalid or expired.' });
  if (state.blockedUntil && Date.now() < state.blockedUntil) return res.status(429).json({ message: 'Too many attempts. Try later.' });
  if (Date.now() > state.expiresAt) {
    await deleteOtp(phone);
    return res.status(410).json({ message: 'OTP is invalid or expired.' });
  }
  if (state.code !== code) {
    await incrementOtpAttempts(phone);
    return res.status(401).json({ message: 'OTP is invalid or expired.' });
  }
  // Create or fetch user
  let user = await admin.auth().getUserByPhoneNumber?.(phone).catch(() => null);
  if (!user) {
    user = await admin.auth().createUser({ phoneNumber: phone, disabled: false });
  }

  // Start free access period
  const freeUntil = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString();
  await admin.firestore().collection('users').doc(user.uid).set({ freeAccessExpiresAt: freeUntil }, { merge: true });

  // Successful: clear OTP
  await deleteOtp(phone);
  return res.status(200).json({ message: 'Account created/verified.', uid: user.uid });
}

export async function updateProfile(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
  // Expect Bearer token; verify with Firebase
  try {
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const updates = req.body;

    // Validate fields (example: phone numeric, name present)
    if (updates.phone && !/^\+?[1-9]\d{7,14}$/.test(updates.phone)) {
      return res.status(400).json({ message: 'Invalid phone number format.' });
    }

    await admin.firestore().collection('users').doc(decoded.uid).set(updates, { merge: true });
    return res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (err: any) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
