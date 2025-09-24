import admin from 'firebase-admin';

export async function getAvatarUploadUrl(req: any, res: any) {
  const { filename, contentType } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || admin.storage().bucket().name;
    const bucket = admin.storage().bucket(bucketName);
    const file = bucket.file(`avatars/${decoded.uid}/${Date.now()}_${filename}`);
    const [url] = await file.getSignedUrl({ action: 'write', expires: Date.now() + 15 * 60 * 1000, contentType });
    // Save a placeholder entry in users doc (actual URL will be the public storage path or a separate get URL)
    await admin.firestore().collection('users').doc(decoded.uid).set({ updatingAvatar: true }, { merge: true });
    return res.status(200).json({ uploadUrl: url, storagePath: file.name });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export async function removeAvatar(req: any, res: any) {
  const { storagePath } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || admin.storage().bucket().name;
    const bucket = admin.storage().bucket(bucketName);
    if (!storagePath) {
      // remove existing avatar reference
      await admin.firestore().collection('users').doc(decoded.uid).update({ avatarUrl: admin.firestore.FieldValue.delete() });
      return res.status(200).json({ message: 'Avatar removed.' });
    }
    await bucket.file(storagePath).delete().catch(() => null);
    await admin.firestore().collection('users').doc(decoded.uid).update({ avatarUrl: admin.firestore.FieldValue.delete() });
    return res.status(200).json({ message: 'Avatar removed.' });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
