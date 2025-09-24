import admin from 'firebase-admin';

const ATTEMPT_COLLECTION = 'loginAttempts';

export async function recordFailedLogin(emailOrUid: string) {
  const docRef = admin.firestore().collection(ATTEMPT_COLLECTION).doc(emailOrUid);
  await admin.firestore().runTransaction(async tx => {
    const doc = await tx.get(docRef);
    const now = Date.now();
    if (!doc.exists) {
      tx.set(docRef, { attempts: 1, firstAttemptAt: now, lockedUntil: null });
      return;
    }
    const data = doc.data() as any;
    const attempts = (data.attempts || 0) + 1;
    const updates: any = { attempts };
    // if 5 consecutive attempts within window, lock for 15 minutes
    const window = 15 * 60 * 1000; // 15 minutes
    if (attempts >= 5 && now - (data.firstAttemptAt || now) < window) {
      updates.lockedUntil = now + 15 * 60 * 1000;
      updates.attempts = 0; // reset attempts after lock
    }
    tx.update(docRef, updates);
  });
}

export async function isLocked(emailOrUid: string) {
  const doc = await admin.firestore().collection(ATTEMPT_COLLECTION).doc(emailOrUid).get();
  if (!doc.exists) return false;
  const data = doc.data() as any;
  return data.lockedUntil && Date.now() < data.lockedUntil;
}

export async function resetAttempts(emailOrUid: string) {
  await admin.firestore().collection(ATTEMPT_COLLECTION).doc(emailOrUid).set({ attempts: 0, lockedUntil: null, firstAttemptAt: null }, { merge: true });
}
