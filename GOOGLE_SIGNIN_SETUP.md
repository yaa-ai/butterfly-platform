# Google Sign-In Setup Guide (Expo Auth Session)

This guide will help you set up Google Sign-In for your Butterfly Platform app using Expo's `expo-auth-session` for cross-platform compatibility.

## Prerequisites

- Google Cloud Console account
- Expo project (works with Expo Go and development builds)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Sign-In API

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Butterfly Platform"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users if needed

## Step 3: Create OAuth 2.0 Client IDs

### For Web Application
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:8081` (for development)
   - `http://localhost:19006` (for Expo web)
   - Your production domain
5. Add authorized redirect URIs:
   - `http://localhost:8081/auth`
   - `http://localhost:19006/auth`
   - `butterflyplatform://auth` (for mobile)
6. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your-client-secret
```

## Step 5: Update app.json (if needed)

The app.json is already configured correctly. The scheme `butterflyplatform` is used for deep linking.

## Step 6: Test the Implementation

1. Start your development server:
   ```bash
   npx expo start
   ```

2. Test on different platforms:
   - **Web**: Press `w` to open in web browser
   - **iOS**: Press `i` to open in iOS simulator
   - **Android**: Press `a` to open in Android emulator

## How It Works

This implementation uses Expo's `expo-auth-session` which:

- ✅ **Works on all platforms** (iOS, Android, Web)
- ✅ **No native code required** - works with Expo Go
- ✅ **Secure OAuth 2.0 flow** with PKCE
- ✅ **Automatic token management**
- ✅ **Cross-platform compatibility**

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Make sure your redirect URIs in Google Cloud Console match exactly
   - Check that the scheme in app.json matches your redirect URI

2. **"Client ID not found"**
   - Verify your environment variables are set correctly
   - Check that the client ID is for a "Web application" type

3. **"Authentication failed"**
   - Ensure your OAuth consent screen is properly configured
   - Check that the required scopes are added

### Debug Tips:

- Check the console logs for detailed error messages
- Verify your environment variables are loaded correctly
- Test the redirect URIs in your browser

## Security Notes

- Never commit your client secret to version control
- Use environment variables for sensitive configuration
- Regularly rotate your OAuth client secrets
- Follow Google's security best practices

## Platform-Specific Notes

### Web
- Works seamlessly in browsers
- Uses standard OAuth 2.0 flow
- No additional configuration needed

### iOS
- Uses ASWebAuthenticationSession
- Automatic deep linking back to app
- Works with Expo Go

### Android
- Uses Chrome Custom Tabs
- Automatic deep linking back to app
- Works with Expo Go

## Additional Resources

- [Expo Auth Session Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo Web Browser Documentation](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
