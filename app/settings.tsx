import { useAuth } from '@/contexts/AuthContext';
import { DatabaseService } from '@/services/databaseService';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Key, Linkedin, Save } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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

interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  email_notifications: boolean;
  auto_post_to_linkedin: boolean;
  content_review_required: boolean;
  ai_model_preference: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro';
}

export default function SettingsScreen() {
  const { user } = useAuth();
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
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    notifications_enabled: true,
    email_notifications: true,
    auto_post_to_linkedin: false,
    content_review_required: true,
    ai_model_preference: 'gpt-4',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) {
      console.error('No user found for loading data');
      return;
    }

    try {
      console.log('Loading user data for user:', user.id);

      // Load API keys
      console.log('Loading API keys...');
      const apiKeysResponse = await DatabaseService.getApiKeys(user.id);
      console.log('API keys response:', apiKeysResponse);
      
      if (apiKeysResponse.data) {
        const loadedKeys: ApiKey = { openai: '', gemini: '', linkedin: '' };
        
        for (const key of apiKeysResponse.data) {
          const decryptedKey = await DatabaseService.getDecryptedApiKey(user.id, key.service_name, key.key_name);
          if (decryptedKey.data) {
            loadedKeys[key.service_name as keyof ApiKey] = decryptedKey.data;
          }
        }
        
        setApiKeys(loadedKeys);
        console.log('API keys loaded:', loadedKeys);
      } else if (apiKeysResponse.error) {
        console.error('Error loading API keys:', apiKeysResponse.error);
      }

      // Load social connections
      console.log('Loading social connections...');
      const connectionsResponse = await DatabaseService.getSocialConnections(user.id);
      console.log('Social connections response:', connectionsResponse);
      
      if (connectionsResponse.data) {
        const loadedConnections: ConnectionStatus = { linkedin: false, twitter: false, facebook: false };
        
        for (const connection of connectionsResponse.data) {
          if (connection.is_connected) {
            loadedConnections[connection.platform as keyof ConnectionStatus] = true;
          }
        }
        
        setConnections(loadedConnections);
        console.log('Social connections loaded:', loadedConnections);
      } else if (connectionsResponse.error) {
        console.error('Error loading social connections:', connectionsResponse.error);
      }

      // Load user settings
      console.log('Loading user settings...');
      const settingsResponse = await DatabaseService.getUserSettings(user.id);
      console.log('User settings response:', settingsResponse);
      
      if (settingsResponse.data) {
        const loadedSettings = {
          theme: settingsResponse.data.theme,
          notifications_enabled: settingsResponse.data.notifications_enabled,
          email_notifications: settingsResponse.data.email_notifications,
          auto_post_to_linkedin: settingsResponse.data.auto_post_to_linkedin,
          content_review_required: settingsResponse.data.content_review_required,
          ai_model_preference: settingsResponse.data.ai_model_preference,
        };
        setSettings(loadedSettings);
        console.log('User settings loaded:', loadedSettings);
      } else if (settingsResponse.error) {
        console.error('Error loading user settings:', settingsResponse.error);
      }

      setIsInitialized(true);
      console.log('User data loading completed');
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', `Failed to load user settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSaveSettings = async () => {
    if (!user) {
      console.error('No user found');
      Alert.alert('Error', 'No user found');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving settings for user:', user.id);
      console.log('API Keys to save:', apiKeys);
      console.log('Settings to save:', settings);

      // Save API keys
      for (const [service, key] of Object.entries(apiKeys)) {
        if (key.trim()) {
          console.log(`Saving API key for ${service}...`);
          const result = await DatabaseService.saveApiKey(user.id, service, 'default', key);
          if (result.error) {
            console.error(`Error saving ${service} API key:`, result.error);
            throw new Error(`Failed to save ${service} API key: ${result.error.message}`);
          }
          console.log(`${service} API key saved successfully`);
        }
      }

      // Save user settings
      console.log('Saving user settings...');
      const settingsResult = await DatabaseService.updateUserSettings(user.id, settings);
      if (settingsResult.error) {
        console.error('Error saving user settings:', settingsResult.error);
        throw new Error(`Failed to save user settings: ${settingsResult.error.message}`);
      }
      console.log('User settings saved successfully');

      // Log activity
      console.log('Logging activity...');
      const activityResult = await DatabaseService.logActivity(user.id, 'settings_updated', {
        settings_updated: Object.keys(settings),
        api_keys_updated: Object.keys(apiKeys).filter(key => apiKeys[key as keyof ApiKey].trim()),
      });
      if (activityResult.error) {
        console.error('Error logging activity:', activityResult.error);
        // Don't throw error for activity logging failure
      }

      console.log('All settings saved successfully!');
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', `Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectLinkedIn = async () => {
    if (!user) return;

    try {
      Alert.alert(
        'Connect LinkedIn',
        'This will open LinkedIn to authorize Butterfly Platform to post on your behalf.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: async () => {
              try {
                // Simulate LinkedIn connection (replace with actual OAuth)
                const connectionData = {
                  access_token: 'mock_access_token',
                  refresh_token: 'mock_refresh_token',
                  platform_user_id: 'mock_user_id',
                  platform_username: 'mock_username',
                };

                await DatabaseService.saveSocialConnection(user.id, 'linkedin', connectionData);
                setConnections(prev => ({ ...prev, linkedin: true }));
                
                await DatabaseService.logActivity(user.id, 'linkedin_connected');
                Alert.alert('Success', 'LinkedIn connected successfully!');
              } catch (error) {
                console.error('Error connecting LinkedIn:', error);
                Alert.alert('Error', 'Failed to connect LinkedIn');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to connect LinkedIn');
    }
  };

  const handleDisconnectLinkedIn = async () => {
    if (!user) return;

    Alert.alert(
      'Disconnect LinkedIn',
      'Are you sure you want to disconnect your LinkedIn account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.disconnectSocialPlatform(user.id, 'linkedin');
              setConnections(prev => ({ ...prev, linkedin: false }));
              
              await DatabaseService.logActivity(user.id, 'linkedin_disconnected');
              Alert.alert('Success', 'LinkedIn disconnected successfully!');
            } catch (error) {
              console.error('Error disconnecting LinkedIn:', error);
              Alert.alert('Error', 'Failed to disconnect LinkedIn');
            }
          },
        },
      ]
    );
  };

  const updateApiKey = (key: keyof ApiKey, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

          {/* AI Model Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Model Preferences</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Default AI Model</Text>
                <Text style={styles.settingDescription}>
                  Choose your preferred AI model for content generation
                </Text>
              </View>
              <View style={styles.selectContainer}>
                <TouchableOpacity
                  style={[
                    styles.modelOption,
                    settings.ai_model_preference === 'gpt-4' && styles.modelOptionSelected
                  ]}
                  onPress={() => updateSetting('ai_model_preference', 'gpt-4')}>
                  <Text style={[
                    styles.modelOptionText,
                    settings.ai_model_preference === 'gpt-4' && styles.modelOptionTextSelected
                  ]}>GPT-4</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modelOption,
                    settings.ai_model_preference === 'gpt-3.5-turbo' && styles.modelOptionSelected
                  ]}
                  onPress={() => updateSetting('ai_model_preference', 'gpt-3.5-turbo')}>
                  <Text style={[
                    styles.modelOptionText,
                    settings.ai_model_preference === 'gpt-3.5-turbo' && styles.modelOptionTextSelected
                  ]}>GPT-3.5</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modelOption,
                    settings.ai_model_preference === 'gemini-pro' && styles.modelOptionSelected
                  ]}
                  onPress={() => updateSetting('ai_model_preference', 'gemini-pro')}>
                  <Text style={[
                    styles.modelOptionText,
                    settings.ai_model_preference === 'gemini-pro' && styles.modelOptionTextSelected
                  ]}>Gemini</Text>
                </TouchableOpacity>
              </View>
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
                      Post content directly to your LinkedIn profile
                    </Text>
                  </View>
                </View>
                <View style={styles.connectionStatus}>
                  {connections.linkedin ? (
                    <View style={styles.connectedStatus}>
                      <CheckCircle size={20} color="#10B981" />
                      <Text style={styles.connectedText}>Connected</Text>
                    </View>
                  ) : (
                    <View style={styles.disconnectedStatus}>
                      <AlertCircle size={20} color="#EF4444" />
                      <Text style={styles.disconnectedText}>Not Connected</Text>
                    </View>
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
                      Post content to Twitter (Coming Soon)
                    </Text>
                  </View>
                </View>
                <View style={styles.connectionStatus}>
                  <Text style={styles.comingSoonStatus}>Coming Soon</Text>
                </View>
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
                      Post content to Facebook (Coming Soon)
                    </Text>
                  </View>
                </View>
                <View style={styles.connectionStatus}>
                  <Text style={styles.comingSoonStatus}>Coming Soon</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-post to LinkedIn</Text>
                <Text style={styles.settingDescription}>
                  Automatically post generated content to LinkedIn
                </Text>
              </View>
              <Switch
                value={settings.auto_post_to_linkedin}
                onValueChange={(value) => updateSetting('auto_post_to_linkedin', value)}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor={settings.auto_post_to_linkedin ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Content Review Required</Text>
                <Text style={styles.settingDescription}>
                  Require manual review before posting content
                </Text>
              </View>
              <Switch
                value={settings.content_review_required}
                onValueChange={(value) => updateSetting('content_review_required', value)}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor={settings.content_review_required ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive email notifications for important updates
                </Text>
              </View>
              <Switch
                value={settings.email_notifications}
                onValueChange={(value) => updateSetting('email_notifications', value)}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor={settings.email_notifications ? '#FFFFFF' : '#FFFFFF'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
    flex: 1,
  },
  toggleButton: {
    padding: 4,
  },
  apiKeyContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputHelp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  connectionCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  },
  platformDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  connectionStatus: {
    alignItems: 'flex-end',
  },
  connectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '500',
  },
  disconnectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disconnectedText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: '500',
  },
  connectionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  connectButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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
  comingSoonStatus: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  selectContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  modelOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  modelOptionSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  modelOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modelOptionTextSelected: {
    color: '#FFFFFF',
  },
});
