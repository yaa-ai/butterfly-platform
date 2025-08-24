import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { LogOut, Settings, Sparkles, User } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Helper functions to extract user information
  const getUserFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserFullName = () => {
    return user?.user_metadata?.full_name || 
           user?.user_metadata?.name || 
           user?.email || 
           'User';
  };

  const getUserAvatar = () => {
    const avatarUrl = user?.user_metadata?.avatar_url || 
                     user?.user_metadata?.picture || 
                     null;
    
    // Add CORS-friendly headers for Google profile images
    if (avatarUrl && avatarUrl.includes('googleusercontent.com')) {
      return avatarUrl;
    }
    
    return avatarUrl;
  };

  const getUserInitial = () => {
    const fullName = getUserFullName();
    return fullName.charAt(0).toUpperCase();
  };

  const wittyQuotes = [
    "Social media: where you can be anyone you want, except yourself.",
    "LinkedIn: where your professional life gets more likes than your personal one.",
    "Posting on social media is like talking to yourself, but with better lighting.",
    "Your network is your net worth, but your WiFi is your lifeline.",
    "Social media: making FOMO a lifestyle since 2004.",
    "LinkedIn: where everyone is a 'thought leader' until they need a job.",
    "Posting content is like throwing a message in a bottle, but the ocean is made of algorithms.",
    "Social media: where your best life is just a filter away from reality.",
  ];

  const randomQuote = wittyQuotes[Math.floor(Math.random() * wittyQuotes.length)];

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {getUserAvatar() && !imageError ? (
                  <Image 
                    source={{ 
                      uri: getUserAvatar(),
                      headers: {
                        'Accept': 'image/webp,image/*,*/*;q=0.8',
                      },
                    }} 
                    style={styles.avatarImage}
                    resizeMode="cover"
                    onError={() => {
                      console.log('Failed to load profile image, falling back to initial');
                      setImageError(true);
                    }}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {getUserInitial()}
                  </Text>
                )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.welcomeText}>Hello, {getUserFirstName()}! 👋</Text>
                <Text style={styles.userName}>
                  {getUserFullName()}
                </Text>
                {user?.email && (
                  <Text style={styles.userEmail}>
                    {user.email}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
                <Settings size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => router.push('/debug')}>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>🐛</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconButton, isLoading && styles.disabledButton]} 
                onPress={handleSignOut}
                disabled={isLoading}>
                <LogOut size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Dashboard Content */}
        <View style={styles.content}>
          {/* Quote Section */}
          <View style={styles.quoteContainer}>
            <View style={styles.quoteIcon}>
              <Sparkles size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.quoteText}>"{randomQuote}"</Text>
            <Text style={styles.quoteAuthor}>— Social Media Wisdom</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Your Butterfly Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Posts Created</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Connections Made</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Engagement Rate</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>AI Suggestions</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Sparkles size={20} color="#8B5CF6" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Create AI Post</Text>
                <Text style={styles.actionSubtitle}>Generate engaging content with AI</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <User size={20} color="#8B5CF6" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Connect LinkedIn</Text>
                <Text style={styles.actionSubtitle}>Link your LinkedIn account</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <View style={styles.activityContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No activity yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start by creating your first AI-powered post!
              </Text>
            </View>
          </View>

          {/* Debug Section - Only show if user is authenticated */}
          {user && (
            <View style={styles.debugContainer}>
              <Text style={styles.sectionTitle}>Authentication Status ✅</Text>
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>
                  <Text style={styles.debugLabel}>Provider:</Text> {user.app_metadata?.provider || 'Unknown'}
                </Text>
                <Text style={styles.debugText}>
                  <Text style={styles.debugLabel}>User ID:</Text> {user.id}
                </Text>
                <Text style={styles.debugText}>
                  <Text style={styles.debugLabel}>Email Verified:</Text> {user.email_confirmed_at ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.debugText}>
                  <Text style={styles.debugLabel}>Created:</Text> {new Date(user.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  quoteContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  activityContainer: {
    marginBottom: 24,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  debugContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  debugInfo: {
    gap: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  debugLabel: {
    fontWeight: '600',
    color: '#1E293B',
  },
});
