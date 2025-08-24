import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function IndexScreen() {
  const { user, session } = useAuth();
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

    const checkAuthAndRedirect = async () => {
      try {
        // Check if user is authenticated
        if (user && session) {
          console.log('User authenticated, redirecting to dashboard');
          // User is logged in, redirect to dashboard
          await router.replace('/(tabs)/dashboard');
        } else {
          console.log('User not authenticated, redirecting to login');
          // User is not logged in, redirect to login
          await router.replace('/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // On error, redirect to login
        try {
          await router.replace('/login');
        } catch (navError) {
          console.error('Navigation error:', navError);
        }
      }
    };

    checkAuthAndRedirect();
  }, [user, session, isReady]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B5CF6" />
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
});
