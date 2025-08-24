import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Key, Linkedin, Save } from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ApiKey {
  openai: string;
  gemini: string;
  linkedin: string;
}

interface ConnectionStatus {
  linkedin: boolean;
  twitter: boolean;
  facebook: boolean;
}

export default function SettingsScreen() {
  const [apiKeys, setApiKeys] = useState<ApiKey>({
    openai: '',
    gemini: '',
    linkedin: '',
  });
  const [showKeys, setShowKeys] = useState(false);
  const [connections, setConnections] = useState<ConnectionStatus>({
    linkedin: false,
    twitter: false,
    facebook: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Here you would save the settings to your backend/database
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectLinkedIn = async () => {
    try {
      // Here you would implement LinkedIn OAuth
      Alert.alert(
        'Connect LinkedIn',
        'This will open LinkedIn to authorize Butterfly Platform to post on your behalf.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: () => {
              // Simulate LinkedIn connection
              setTimeout(() => {
                setConnections(prev => ({ ...prev, linkedin: true }));
                Alert.alert('Success', 'LinkedIn connected successfully!');
              }, 2000);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to connect LinkedIn');
    }
  };

  const handleDisconnectLinkedIn = () => {
    Alert.alert(
      'Disconnect LinkedIn',
      'Are you sure you want to disconnect your LinkedIn account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setConnections(prev => ({ ...prev, linkedin: false }));
            Alert.alert('Success', 'LinkedIn disconnected successfully!');
          },
        },
      ]
    );
  };

  const updateApiKey = (key: keyof ApiKey, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSaveSettings}
            disabled={isLoading}>
            <Save size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* API Keys Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Key size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>API Keys</Text>
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => setShowKeys(!showKeys)}>
                {showKeys ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
              </TouchableOpacity>
            </View>
            
            <View style={styles.apiKeyContainer}>
              <Text style={styles.inputLabel}>OpenAI API Key</Text>
              <TextInput
                style={styles.textInput}
                placeholder="sk-..."
                value={apiKeys.openai}
                onChangeText={(value) => updateApiKey('openai', value)}
                secureTextEntry={!showKeys}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.inputHelp}>
                Used for generating content with GPT models
              </Text>
            </View>

            <View style={styles.apiKeyContainer}>
              <Text style={styles.inputLabel}>Google Gemini API Key</Text>
              <TextInput
                style={styles.textInput}
                placeholder="AIza..."
                value={apiKeys.gemini}
                onChangeText={(value) => updateApiKey('gemini', value)}
                secureTextEntry={!showKeys}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.inputHelp}>
                Used for generating content with Gemini models
              </Text>
            </View>

            <View style={styles.apiKeyContainer}>
              <Text style={styles.inputLabel}>LinkedIn API Key</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your LinkedIn API key"
                value={apiKeys.linkedin}
                onChangeText={(value) => updateApiKey('linkedin', value)}
                secureTextEntry={!showKeys}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.inputHelp}>
                Used for posting directly to LinkedIn via API
              </Text>
            </View>
          </View>

          {/* Social Media Connections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Media Connections</Text>
            
            {/* LinkedIn */}
            <View style={styles.connectionCard}>
              <View style={styles.connectionHeader}>
                <View style={styles.platformInfo}>
                  <Linkedin size={24} color="#0077B5" />
                  <View style={styles.platformDetails}>
                    <Text style={styles.platformName}>LinkedIn</Text>
                    <Text style={styles.platformDescription}>
                      Post content and manage your professional presence
                    </Text>
                  </View>
                </View>
                <View style={styles.connectionStatus}>
                  {connections.linkedin ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <AlertCircle size={20} color="#EF4444" />
                  )}
                </View>
              </View>
              
              <View style={styles.connectionActions}>
                {connections.linkedin ? (
                  <TouchableOpacity 
                    style={styles.disconnectButton}
                    onPress={handleDisconnectLinkedIn}>
                    <Text style={styles.disconnectButtonText}>Disconnect</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.connectButton}
                    onPress={handleConnectLinkedIn}>
                    <Text style={styles.connectButtonText}>Connect</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Twitter (Coming Soon) */}
            <View style={styles.connectionCard}>
              <View style={styles.connectionHeader}>
                <View style={styles.platformInfo}>
                  <View style={styles.comingSoonIcon}>
                    <Text style={styles.comingSoonText}>🐦</Text>
                  </View>
                  <View style={styles.platformDetails}>
                    <Text style={styles.platformName}>Twitter</Text>
                    <Text style={styles.platformDescription}>
                      Share your thoughts and engage with your audience
                    </Text>
                  </View>
                </View>
                <View style={styles.connectionStatus}>
                  <Text style={styles.comingSoonBadge}>Soon</Text>
                </View>
              </View>
              
              <View style={styles.connectionActions}>
                <TouchableOpacity style={styles.disabledButton} disabled>
                  <Text style={styles.disabledButtonText}>Coming Soon</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Facebook (Coming Soon) */}
            <View style={styles.connectionCard}>
              <View style={styles.connectionHeader}>
                <View style={styles.platformInfo}>
                  <View style={styles.comingSoonIcon}>
                    <Text style={styles.comingSoonText}>📘</Text>
                  </View>
                  <View style={styles.platformDetails}>
                    <Text style={styles.platformName}>Facebook</Text>
                    <Text style={styles.platformDescription}>
                      Share content with your friends and followers
                    </Text>
                  </View>
                </View>
                <View style={styles.connectionStatus}>
                  <Text style={styles.comingSoonBadge}>Soon</Text>
                </View>
              </View>
              
              <View style={styles.connectionActions}>
                <TouchableOpacity style={styles.disabledButton} disabled>
                  <Text style={styles.disabledButtonText}>Coming Soon</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceTitle}>Auto-post to LinkedIn</Text>
                <Text style={styles.preferenceDescription}>
                  Automatically post AI-generated content to LinkedIn
                </Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: '#E2E8F0', true: '#8B5CF6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceTitle}>Content Review</Text>
                <Text style={styles.preferenceDescription}>
                  Review content before posting
                </Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#E2E8F0', true: '#8B5CF6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
    flex: 1,
  },
  toggleButton: {
    padding: 4,
  },
  apiKeyContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  inputHelp: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  connectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformDetails: {
    marginLeft: 12,
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  platformDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  connectionStatus: {
    marginLeft: 12,
  },
  connectionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  connectButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  comingSoonIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonText: {
    fontSize: 20,
  },
  comingSoonBadge: {
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#64748B',
  },
});
