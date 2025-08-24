import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DebugScreen() {
  const debugInfo = {
    // Environment Variables
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '***SET***' : 'NOT SET',
      EXPO_PUBLIC_AUTH_REDIRECT_URL: process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ? '***SET***' : 'NOT SET',
      EXPO_PUBLIC_GOOGLE_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET ? '***SET***' : 'NOT SET',
    },
    
    // Browser Information
    browser: {
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
      origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
      href: typeof window !== 'undefined' ? window.location.href : 'N/A',
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
      port: typeof window !== 'undefined' ? window.location.port : 'N/A',
    },
    
    // Calculated Redirect URL
    redirectUrl: {
      isLocalhost: typeof window !== 'undefined' ? window.location.hostname === 'localhost' : 'N/A',
      calculatedUrl: (() => {
        if (typeof window === 'undefined') return 'N/A';
        return window.location.hostname === 'localhost' 
          ? `${window.location.origin}/auth-callback`
          : (process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL || 'https://butterfly-platform--p421kkcet9.expo.app/auth-callback');
      })(),
      expectedProductionUrl: 'https://butterfly-platform--p421kkcet9.expo.app/auth-callback',
    },
    
    // Build Information
    build: {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    }
  };

  const handleBack = () => {
    router.back();
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const renderSection = (title: string, data: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {Object.entries(data).map(([key, value]) => (
        <View key={key} style={styles.row}>
          <Text style={styles.key}>{key}:</Text>
          <TouchableOpacity 
            style={styles.valueContainer}
            onPress={() => copyToClipboard(String(value))}>
            <Text style={styles.value}>{String(value)}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug Information</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {renderSection('Environment Variables', debugInfo.environment)}
        {renderSection('Browser Information', debugInfo.browser)}
        {renderSection('Redirect URL Logic', debugInfo.redirectUrl)}
        {renderSection('Build Information', debugInfo.build)}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionText}>
            • Tap any value to copy it to clipboard{'\n'}
            • Check if EXPO_PUBLIC_AUTH_REDIRECT_URL is set{'\n'}
            • Verify the calculated redirect URL is correct{'\n'}
            • Ensure Supabase is configured with the right redirect URL
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  key: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    minWidth: 120,
    marginRight: 8,
  },
  valueContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 8,
  },
  value: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'monospace',
  },
  instructionText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});
