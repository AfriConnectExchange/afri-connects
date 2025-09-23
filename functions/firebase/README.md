Firebase Auth Backend (scaffold)

This folder contains a small Express + Firebase Admin scaffold implementing core authentication flows required by the product (email registration/verification, phone/OTP, login, password reset, profile updates, roles, and media upload hooks).

Quick start

1. Copy `.env.example` to `.env` and fill the variables.
2. Install dependencies: npm install
3. Run in development: npm run dev
4. Build: npm run build
5. Start: npm start

Notes
- This is a scaffold: email sending and SMS sending functions are placeholders — integrate with your SMTP provider and SMS gateway (e.g., Twilio) and update the implementations in `src/services`.
- Verification links: the scaffold issues signed short-lived tokens (24h validity) and expects the frontend to hit an endpoint to verify and complete password setup.

Notes on providers and persistence
- Email: SendGrid is supported via `SENDGRID_API_KEY` and `SENDGRID_FROM` env vars. If not set, emails are printed to console.
- SMS: Twilio is supported via `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM`. If not set, SMS messages are printed to console.
- OTP and login attempt tracking are persisted in Firestore collections `otpCodes` and `loginAttempts`.
