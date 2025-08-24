import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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
          console.log('User authenticated, ensuring profile exists...');
          
          // Ensure user profile exists before redirecting
          await ensureUserProfile(user);
          
          console.log('Profile setup complete, redirecting to dashboard');
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
