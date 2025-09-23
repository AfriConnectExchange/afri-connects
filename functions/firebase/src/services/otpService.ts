import admin from 'firebase-admin';

const OTP_COLLECTION = 'otpCodes';

export async function createOtp(phone: string) {
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  const now = Date.now();
  const docRef = admin.firestore().collection(OTP_COLLECTION).doc(phone);
  await docRef.set({ code, phone, createdAt: now, expiresAt: now + 5 * 60 * 1000, attempts: 0 }, { merge: true });
  return code;
}

export async function getOtp(phone: string) {
  const doc = await admin.firestore().collection(OTP_COLLECTION).doc(phone).get();
  return doc.exists ? (doc.data() as any) : null;
}

export async function incrementOtpAttempts(phone: string) {
  const docRef = admin.firestore().collection(OTP_COLLECTION).doc(phone);
  await admin.firestore().runTransaction(async tx => {
    const doc = await tx.get(docRef);
    if (!doc.exists) return;
    const data = doc.data() as any;
    const attempts = (data.attempts || 0) + 1;
    const updates: any = { attempts };
    if (attempts >= 5) {
      updates.blockedUntil = Date.now() + 60 * 60 * 1000; // 1 hour
    }
    tx.update(docRef, updates);
  });
}

export async function deleteOtp(phone: string) {
  await admin.firestore().collection(OTP_COLLECTION).doc(phone).delete();
}
