import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Firebase Admin
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) {
  console.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set. Firebase admin not initialized.');
} else {
  let cred;
  try {
    cred = JSON.parse(serviceAccountJson);
  } catch (err) {
    // If it's a path, require it
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      cred = require(serviceAccountJson);
    } catch (err2) {
      console.error('Unable to parse FIREBASE_SERVICE_ACCOUNT_JSON', err2);
    }
  }
  if (cred) {
    admin.initializeApp({
      credential: admin.credential.cert(cred as admin.ServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
}

app.use('/auth', authRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Auth backend listening on ${port}`));
