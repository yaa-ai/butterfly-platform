import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Determine the correct redirect URL based on environment
const getRedirectUrl = () => {
  if (typeof window === 'undefined') return undefined;
  
  return window.location.hostname === 'localhost' 
    ? `${window.location.origin}/auth/callback`
    : (process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL || 'https://butterfly-platform--b2qbrpozgk.expo.app/auth/callback');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
