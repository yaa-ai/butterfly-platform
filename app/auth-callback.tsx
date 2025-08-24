import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function AuthCallbackAlt() {
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    // Add a small delay to ensure router is ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    handleAuthCallback();
  }, [isReady]);

  const handleAuthCallback = async () => {
    try {
      setStatus('Reading authentication tokens...');
      
      // Get the URL hash parameters
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      
      // Check if we have an access token
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      console.log('Auth callback - tokens found:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      
      if (accessToken && refreshToken) {
        setStatus('Setting up your session...');
        
        // Set the session manually
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Error setting session:', error);
          setStatus('Authentication failed. Redirecting to login...');
          setTimeout(async () => {
            try {
              await router.replace('/login');
            } catch (navError) {
              console.error('Navigation error:', navError);
            }
          }, 2000);
          return;
        }

        if (data.session) {
          // Successfully authenticated, ensure user profile exists
          console.log('Authentication successful, ensuring user profile exists...');
          setStatus('Setting up your profile...');
          
          await ensureUserProfile(data.session.user);
          
          console.log('Profile setup complete, redirecting to dashboard');
          setStatus('Welcome! Redirecting to dashboard...');
          setTimeout(async () => {
            try {
              await router.replace('/(tabs)/dashboard');
            } catch (navError) {
              console.error('Navigation error:', navError);
            }
          }, 1000);
        } else {
          // No session, redirect to login
          console.log('No session found, redirecting to login');
          setStatus('No session found. Redirecting to login...');
          setTimeout(async () => {
            try {
              await router.replace('/login');
            } catch (navError) {
              console.error('Navigation error:', navError);
            }
          }, 2000);
        }
      } else {
        setStatus('Checking existing session...');
        
        // Check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('User already authenticated, ensuring profile exists...');
          setStatus('Setting up your profile...');
          
          await ensureUserProfile(session.user);
          
          console.log('Profile setup complete, redirecting to dashboard');
          setStatus('Already logged in! Redirecting to dashboard...');
          setTimeout(async () => {
            try {
              await router.replace('/(tabs)/dashboard');
            } catch (navError) {
              console.error('Navigation error:', navError);
            }
          }, 1000);
        } else {
          // No tokens found, redirect to login
          console.log('No tokens found, redirecting to login');
          setStatus('No authentication found. Redirecting to login...');
          setTimeout(async () => {
            try {
              await router.replace('/login');
            } catch (navError) {
              console.error('Navigation error:', navError);
            }
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus('An error occurred. Redirecting to login...');
      setTimeout(async () => {
        try {
          await router.replace('/login');
        } catch (navError) {
          console.error('Navigation error:', navError);
        }
      }, 2000);
    }
  };

  // Function to ensure user profile and settings exist
  const ensureUserProfile = async (user: any) => {
    try {
      console.log('Ensuring user profile exists for:', user.id);
      
      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating user profile...');
        const { error: insertProfileError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          });
        
        if (insertProfileError) {
          console.error('Error creating user profile:', insertProfileError);
        } else {
          console.log('User profile created successfully');
        }
      } else if (profileError) {
        console.error('Error checking user profile:', profileError);
      } else {
        console.log('User profile already exists');
      }
      
      // Check if user settings exist
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (settingsError && settingsError.code === 'PGRST116') {
        // Settings don't exist, create them
        console.log('Creating user settings...');
        const { error: insertSettingsError } = await supabase
          .from('user_settings')
          .insert({ id: user.id });
        
        if (insertSettingsError) {
          console.error('Error creating user settings:', insertSettingsError);
        } else {
          console.log('User settings created successfully');
        }
      } else if (settingsError) {
        console.error('Error checking user settings:', settingsError);
      } else {
        console.log('User settings already exist');
      }
      
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🦋</Text>
        </View>
        <ActivityIndicator size="large" color="#8B5CF6" style={styles.spinner} />
        <Text style={styles.statusText}>{status}</Text>
        <Text style={styles.subtitleText}>Please wait while we complete your sign in...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  content: {
    alignItems: 'center',
    padding: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 40,
  },
  spinner: {
    marginBottom: 24,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
