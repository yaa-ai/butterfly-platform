import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function AuthCallback() {
  const [isReady, setIsReady] = useState(false);

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
      // Get the URL hash parameters
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      
      // Check if we have an access token
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken && refreshToken) {
        // Set the session manually
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Error setting session:', error);
          await router.replace('/login');
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          console.log('Authentication successful, redirecting to dashboard');
          await router.replace('/(tabs)/dashboard');
        } else {
          // No session, redirect to login
          console.log('No session found, redirecting to login');
          await router.replace('/login');
        }
      } else {
        // Check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('User already authenticated, redirecting to dashboard');
          await router.replace('/(tabs)/dashboard');
        } else {
          // No tokens found, redirect to login
          console.log('No tokens found, redirecting to login');
          await router.replace('/login');
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      try {
        await router.replace('/login');
      } catch (navError) {
        console.error('Navigation error:', navError);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text style={styles.text}>Completing sign in...</Text>
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
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
});
