import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function IndexScreen() {
  const { user, session } = useAuth();

  useEffect(() => {
    // Check if user is authenticated
    if (user && session) {
      // User is logged in, redirect to dashboard
      router.replace('/(tabs)/dashboard');
    } else {
      // User is not logged in, redirect to login
      router.replace('/login');
    }
  }, [user, session]);

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
