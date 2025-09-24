import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase'; // Import the initialized app

// Create a single Supabase client instance to avoid multiple GoTrueClient instances
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Export auth after app is initialized
export const auth = getAuth(app);
