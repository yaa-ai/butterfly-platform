# OAuth Redirect Fix for Production Deployment

## Issue Description
The deployed version redirects to localhost after Google OAuth login because the redirect URL is not properly configured for production.

## Root Cause
The OAuth redirect URL was hardcoded to use `window.location.origin` which resolves to localhost in development but needs to be explicitly set for production.

## Solution Implemented

### 1. Updated Supabase Auth Service
Modified `services/supabaseAuth.ts` to use environment variables and fallback logic:

```typescript
export const signInWithGoogle = async () => {
  try {
    // Use environment variable for redirect URL, fallback to dynamic detection
    const redirectUrl = window.location.hostname === 'localhost' 
      ? `${window.location.origin}/auth/callback`
      : (process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL || 'https://butterfly-platform--p421kkcet9.expo.app/auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    // ... rest of the function
  }
};
```

### 2. Created Auth Callback Route
Added `app/auth/callback.tsx` to handle OAuth redirects:

```typescript
export default function AuthCallback() {
  useEffect(() => {
    handleAuthCallback();
  }, []);

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

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          router.replace('/(tabs)/dashboard');
        } else {
          // No session, redirect to login
          router.replace('/login');
        }
      } else {
        // No tokens found, redirect to login
        router.replace('/login');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}
```

### 3. Added Route Configuration
Updated `app/_layout.tsx` to include the auth callback route:

```typescript
<Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="login" options={{ headerShown: false }} />
  <Stack.Screen name="register" options={{ headerShown: false }} />
  <Stack.Screen name="settings" options={{ headerShown: false }} />
  <Stack.Screen name="auth" options={{ headerShown: false }} />
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="+not-found" />
</Stack>
```

### 4. Created Index Route
Added `app/index.tsx` to handle root path redirects:

```typescript
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
```

## Required Supabase Configuration

### 1. Update Google OAuth Redirect URLs
In your Supabase dashboard:

1. Go to **Authentication** → **Providers** → **Google**
2. Add the production redirect URL:
   ```
   https://butterfly-platform--p421kkcet9.expo.app/auth/callback
   ```

### 2. Update Google Cloud Console
In your Google Cloud Console OAuth 2.0 client:

1. Go to **Credentials** → **OAuth 2.0 Client IDs**
2. Add authorized redirect URIs:
   ```
   https://butterfly-platform--p421kkcet9.expo.app/auth/callback
   ```

## Environment Variables

Add to your `.env` file for production deployments:

```bash
# Required for production OAuth redirects (only used when not on localhost)
EXPO_PUBLIC_AUTH_REDIRECT_URL=https://butterfly-platform--p421kkcet9.expo.app/auth/callback
```

**Note**: This environment variable is only used when `window.location.hostname !== 'localhost'`. For local development, the redirect URL is automatically set to `http://localhost:8081/auth/callback`.

## Testing the Fix

### 1. Development Testing
```bash
npx expo start
```
- Navigate to `http://localhost:8081`
- Try Google OAuth login
- Should redirect to `http://localhost:8081/auth/callback`

### 2. Production Testing
- Navigate to `https://butterfly-platform--p421kkcet9.expo.app`
- Try Google OAuth login
- Should redirect to `https://butterfly-platform--p421kkcet9.expo.app/auth/callback`

## Troubleshooting

### Common Issues

1. **Still redirecting to localhost**
   - Check that the environment variable is set correctly
   - Verify Supabase redirect URL configuration
   - Clear browser cache and cookies

2. **Auth callback not working**
   - Check that the auth callback route is properly configured
   - Verify the route is included in the layout
   - Check browser console for errors

3. **Session not persisting**
   - Verify Supabase client configuration
   - Check that session is being set correctly in the callback
   - Ensure proper error handling

### Debug Steps

1. **Check Environment Variables**
   ```javascript
   console.log('Redirect URL:', process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL);
   console.log('Hostname:', window.location.hostname);
   ```

2. **Check OAuth Flow**
   - Open browser developer tools
   - Monitor network requests during OAuth
   - Check for redirect URL in OAuth request

3. **Verify Supabase Configuration**
   - Check Supabase dashboard for correct redirect URLs
   - Verify Google OAuth client configuration
   - Test with Supabase client directly

## Deployment

After making these changes:

1. **Build and Deploy**
   ```bash
   npx expo export --platform web && eas deploy
   ```

2. **Update Supabase Configuration**
   - Add production redirect URL in Supabase dashboard
   - Update Google Cloud Console OAuth settings

3. **Test Production**
   - Visit the deployed URL
   - Test Google OAuth login
   - Verify redirect works correctly

## Security Considerations

1. **HTTPS Only**: Production redirect URLs must use HTTPS
2. **Domain Validation**: Ensure redirect URLs match your deployed domain
3. **Token Security**: Access tokens are handled securely in the callback
4. **Session Management**: Proper session validation and error handling

## Future Improvements

1. **Dynamic Redirect URLs**: Use environment detection for multiple environments
2. **Error Handling**: More robust error handling for OAuth failures
3. **Loading States**: Better UX during OAuth flow
4. **Analytics**: Track OAuth success/failure rates
