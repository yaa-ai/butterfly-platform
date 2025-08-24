import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GoogleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
}

export default function GoogleSignInButton({
  onPress,
  disabled = false,
  loading = false,
  title = 'Continue with Google',
}: GoogleSignInButtonProps) {
  const handlePress = () => {
    console.log('Google Sign-In button pressed');
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton]}
      onPress={handlePress}
      disabled={disabled || loading}>
      <View style={styles.buttonContent}>
        <Text style={styles.googleIcon}>G</Text>
        <Text style={[styles.buttonText, disabled && styles.disabledText]}>
          {loading ? 'Signing in...' : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  disabledText: {
    color: '#94A3B8',
  },
});
