import { Router } from 'express';
import {
  registerEmail,
  verifyEmailToken,
  finishSetPassword,
  loginEmailPassword,
  requestPasswordReset,
  resetPassword,
  sendOtp,
  verifyOtp,
  updateProfile,
  changeEmail,
  getAvatarUploadUrl,
  removeAvatar,
} from '../services/authController';

export const authRouter = Router();

// Email registration: create preliminary user (disabled) and send verification email
authRouter.post('/register/email', registerEmail);
authRouter.get('/verify-email', verifyEmailToken);
authRouter.post('/finish-setup', finishSetPassword);

// Email/password auth
authRouter.post('/login', loginEmailPassword);
authRouter.post('/password/reset-request', requestPasswordReset);
authRouter.post('/password/reset', resetPassword);

// Resend verification and email change flows
authRouter.post('/resend-verification', registerEmail); // reuse registerEmail to send another verification
authRouter.post('/change-email', changeEmail);

// Avatar/profile picture upload (signed URL) and removal
authRouter.post('/profile/avatar-url', getAvatarUploadUrl);
authRouter.post('/profile/remove-avatar', removeAvatar);

// Phone/OTP
authRouter.post('/register/phone/send-otp', sendOtp);
authRouter.post('/register/phone/verify-otp', verifyOtp);

// Profile updates
authRouter.put('/profile', updateProfile);
