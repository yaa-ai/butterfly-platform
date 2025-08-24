# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your Butterfly Platform app.

## Prerequisites

- Supabase account (free tier available)
- Expo project

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `butterfly-platform`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (usually 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Enable Google OAuth

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. You'll need to set up Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
   - Choose **Web application**
   - Add authorized JavaScript origins:
     - `http://localhost:8081`
     - `http://localhost:19006`
     - Your Supabase project URL (e.g., `https://your-project-id.supabase.co`)
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**

4. Back in Supabase, enter your Google credentials:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret
   - **Redirect URL**: `https://your-project-id.supabase.co/auth/v1/callback`

5. Click **Save**

## Step 5: Configure Email Authentication (Optional)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Under **Email**, you can configure:
   - **Enable email confirmations**: Recommended for security
   - **Enable email change confirmations**: Recommended
   - **Secure email change**: Recommended

## Step 6: Test the Implementation

1. Start your development server:
   ```bash
   npx expo start
   ```

2. Test authentication:
   - **Web**: Press `w` to open in browser
   - **Mobile**: Use Expo Go app

3. Try signing in with:
   - Email/password registration
   - Email/password login
   - Google OAuth

## Features Included

### ✅ Authentication Methods
- **Email/Password**: Registration and login
- **Google OAuth**: One-click sign-in
- **Password Reset**: Email-based password recovery
- **Session Management**: Automatic token refresh

### ✅ User Management
- **User Profiles**: Store additional user data
- **Session Persistence**: Users stay logged in
- **Real-time Auth State**: Automatic UI updates

### ✅ Security Features
- **JWT Tokens**: Secure authentication
- **Row Level Security**: Database security
- **Email Verification**: Optional email confirmation
- **Password Policies**: Configurable requirements

## Database Schema (Optional)

If you want to store additional user data, you can create a `profiles` table:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**
   - Check your environment variables are correct
   - Ensure you're using the `anon` key, not the `service_role` key

2. **"OAuth provider not configured"**
   - Verify Google OAuth is enabled in Supabase
   - Check your Google OAuth credentials are correct
   - Ensure redirect URIs match exactly

3. **"Email not confirmed"**
   - Check if email confirmation is required
   - Verify email settings in Supabase

### Debug Tips:

- Check the browser console for detailed error messages
- Verify your environment variables are loaded correctly
- Test with Supabase's built-in auth UI first

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Expo with Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

## Security Notes

- Never commit your service role key to version control
- Use environment variables for sensitive configuration
- Enable Row Level Security on your database tables
- Regularly review your OAuth app settings
