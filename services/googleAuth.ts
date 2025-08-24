import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'your-web-client-id.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || 'your-client-secret';

// Google OAuth discovery document
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// Create the auth request
const createGoogleAuthRequest = () => {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'butterflyplatform',
    path: 'auth',
  });

  console.log('Redirect URI:', redirectUri);

  return new AuthSession.AuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    extraParams: {
      access_type: 'offline',
    },
    // Use discovery document for endpoints
    discovery: GOOGLE_DISCOVERY,
    // Enable PKCE for web security
    codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
  });
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google Sign-In...');
    const request = createGoogleAuthRequest();
    
    console.log('Request created, making auth URL...');
    // Get the authorization URL
    const authUrl = await request.makeAuthUrlAsync();
    console.log('Auth URL created:', authUrl);
    
    // Perform the authentication
    const result = await AuthSession.startAsync({
      authUrl,
      returnUrl: request.redirectUri,
    });

    console.log('Auth result:', result);

    if (result.type === 'success' && result.params.code) {
      console.log('Auth successful, exchanging code for tokens...');
      // Exchange the authorization code for tokens
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          code: result.params.code,
          redirectUri: request.redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        },
        {
          tokenEndpoint: GOOGLE_DISCOVERY.tokenEndpoint,
        }
      );

      console.log('Token exchange successful, fetching user info...');
      // Get user info using the access token
      const userInfo = await fetchUserInfo(tokenResult.accessToken);
      
      return {
        success: true,
        user: userInfo,
        accessToken: tokenResult.accessToken,
        refreshToken: tokenResult.refreshToken,
      };
    } else if (result.type === 'cancel') {
      return {
        success: false,
        error: 'Sign-in was cancelled',
      };
    } else {
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during Google Sign-In',
    };
  }
};

// Fetch user information from Google
const fetchUserInfo = async (accessToken: string) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await response.json();
    
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      photo: userData.picture,
      familyName: userData.family_name,
      givenName: userData.given_name,
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

// Sign out from Google (for web, we just clear local storage)
export const signOutFromGoogle = async () => {
  try {
    // For web, we can redirect to Google's logout URL
    if (Platform.OS === 'web') {
      const logoutUrl = `https://accounts.google.com/logout`;
      window.open(logoutUrl, '_blank');
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to sign out from Google',
    };
  }
};

// Check if user is signed in (using AsyncStorage)
export const isSignedIn = async () => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const userData = await AsyncStorage.default.getItem('user');
    return !!userData;
  } catch (error) {
    console.error('Error checking sign-in status:', error);
    return false;
  }
};

// Get current user (using AsyncStorage)
export const getCurrentUser = async () => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const userData = await AsyncStorage.default.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Configure Google Sign-In (no-op for this implementation)
export const configureGoogleSignIn = () => {
  console.log('Google Sign-In configured for cross-platform use');
  console.log('Client ID:', GOOGLE_CLIENT_ID);
  console.log('Discovery:', GOOGLE_DISCOVERY);
};
