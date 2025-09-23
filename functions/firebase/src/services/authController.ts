import { Request, Response } from 'express';
import admin from 'firebase-admin';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { createOtp, getOtp, deleteOtp, incrementOtpAttempts } from './otpService';
import { recordFailedLogin, isLocked, resetAttempts } from './loginAttemptService';
import { sendEmail, sendSms } from './messaging';

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
    // Firebase Admin cannot verify password directly; instead this backend should use Firebase Auth REST API or rely on client SDK.
    // For scaffold we'll return instruction to use client-side signInWithEmailAndPassword, or implement REST verify.
    return res.status(501).json({ message: 'Use client SDK for email/password sign-in or implement REST verify in backend.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

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
