import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';
import { auth } from '../firebase'; // Import the initialized app

// Create a single Supabase client instance to avoid multiple GoTrueClient instances
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Export auth after app is initialized
export { auth };
