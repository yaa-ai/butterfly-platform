import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Debug logging
    console.log('=== Google Sign-In Debug ===');
    console.log('Hostname:', window.location.hostname);
    console.log('Origin:', window.location.origin);
    console.log('EXPO_PUBLIC_AUTH_REDIRECT_URL:', process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL);
    console.log('Is localhost:', window.location.hostname === 'localhost');
    
    // Use environment variable for redirect URL, fallback to dynamic detection
    const redirectUrl = window.location.hostname === 'localhost' 
      ? `${window.location.origin}/auth-callback`
      : (process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL || 'https://butterfly-platform--p421kkcet9.expo.app/auth-callback');
    
    console.log('Calculated redirect URL:', redirectUrl);

    console.log('Calling Supabase OAuth with redirect URL:', redirectUrl);
    
    // Try to force the redirect URL by using multiple approaches
    const oauthOptions: any = {
      redirectTo: redirectUrl,
    };

    // Add query parameters to force the redirect URL
    if (redirectUrl) {
      oauthOptions.queryParams = {
        redirect_uri: redirectUrl,
      };
    }

    console.log('OAuth options:', oauthOptions);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: oauthOptions,
    });
    
    console.log('Supabase OAuth response:', { data, error });

    if (error) {
      console.error('Google Sign-In error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Check if we got a URL back and log it for debugging
    if (data?.url) {
      console.log('Generated OAuth URL:', data.url);
      
      // Parse the URL to see what redirect_uri is being used
      try {
        const url = new URL(data.url);
        const redirectUri = url.searchParams.get('redirect_uri');
        console.log('Actual redirect_uri in OAuth URL:', redirectUri);
        
        if (redirectUri !== redirectUrl) {
          console.warn('⚠️ Redirect URL mismatch!');
          console.warn('Expected:', redirectUrl);
          console.warn('Actual:', redirectUri);
        }
      } catch (parseError) {
        console.error('Error parsing OAuth URL:', parseError);
      }
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during Google Sign-In',
    };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Email Sign-In error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error: any) {
    console.error('Email Sign-In error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during sign-in',
    };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, userData?: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData, // Additional user metadata
      },
    });

    if (error) {
      console.error('Email Sign-Up error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error: any) {
    console.error('Email Sign-Up error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during sign-up',
    };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during sign-out',
    };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Get current session
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Get current session error:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error('Check authentication error:', error);
    return false;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during password reset',
    };
  }
};
