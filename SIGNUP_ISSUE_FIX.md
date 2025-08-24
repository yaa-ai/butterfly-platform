# Signup Issue Fix Guide

## Issue: "No authentication found" After Signup

Users are getting redirected to login after signing up, even though they should be authenticated.

## Root Cause

The issue is that user profiles and settings aren't being created automatically when users sign up, causing the authentication flow to fail.

## Solution Overview

We've implemented a **dual approach** to fix this:

1. **Fixed the database trigger** to automatically create profiles
2. **Added client-side fallback** to create profiles if the trigger fails
3. **Enhanced error handling** throughout the authentication flow

## Step 1: Fix Database Trigger

### Run the Fix Script

1. **Go to Supabase Dashboard**
2. **Open SQL Editor**
3. **Copy and paste** the entire content of `fix-signup-issue.sql`
4. **Click "Run"**

This script will:
- ✅ Drop and recreate the trigger function with better error handling
- ✅ Create missing profiles for existing users
- ✅ Create missing settings for existing users
- ✅ Verify the trigger is working

### Verify Trigger is Working

After running the script, check if the trigger exists:

```sql
-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

## Step 2: Test the Fix

### Test New User Signup

1. **Sign out** if you're currently logged in
2. **Try signing up** with a new account
3. **Check the console** for profile creation logs
4. **Verify** you're redirected to dashboard

### Test Existing Users

1. **Sign in** with an existing account
2. **Check console** for profile creation logs
3. **Verify** you're redirected to dashboard

## Step 3: Client-Side Fallback

### What We Added

The app now includes **client-side profile creation** as a fallback:

#### **Auth Callback (`app/auth-callback.tsx`)**
- ✅ Checks if user profile exists after authentication
- ✅ Creates profile if it doesn't exist
- ✅ Creates settings if they don't exist
- ✅ Only redirects to dashboard after profile setup

#### **Index Page (`app/index.tsx`)**
- ✅ Same profile creation logic
- ✅ Ensures profiles exist before navigation
- ✅ Handles both new and existing users

### Profile Creation Logic

```javascript
const ensureUserProfile = async (user) => {
  // Check if profile exists
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .single();
  
  // Create profile if it doesn't exist
  if (profileError && profileError.code === 'PGRST116') {
    await supabase.from('user_profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || 'User',
      avatar_url: user.user_metadata?.avatar_url,
    });
  }
  
  // Same logic for user_settings
};
```

## Step 4: Debug the Issue

### Check Console Logs

When you sign up, you should see these logs:

```
✅ Authentication successful, ensuring user profile exists...
✅ Ensuring user profile exists for: [user-id]
✅ User profile created successfully
✅ User settings created successfully
✅ Profile setup complete, redirecting to dashboard
```

### If You See Errors

#### Error: "relation does not exist"
- **Solution**: Tables not created - run the database schema again

#### Error: "permission denied"
- **Solution**: RLS policies not working - check policies

#### Error: "duplicate key value"
- **Solution**: Profile already exists - this is normal

### Manual Profile Creation

If the automatic creation still fails, create profiles manually:

```sql
-- Create profile for specific user (replace with actual user ID)
INSERT INTO user_profiles (id, full_name, avatar_url)
VALUES (
  'your-user-id',
  'Your Name',
  'https://your-avatar-url.com'
);

-- Create settings for specific user
INSERT INTO user_settings (id)
VALUES ('your-user-id');
```

## Step 5: Verify the Fix

### Success Indicators

After the fix, you should see:

✅ **New users** are redirected to dashboard after signup
✅ **Existing users** are redirected to dashboard after login
✅ **Console shows** profile creation logs
✅ **No "no authentication found"** errors
✅ **Settings page** loads without errors
✅ **Dashboard** shows user information correctly

### Test Checklist

- [ ] **New user signup** → Dashboard
- [ ] **Existing user login** → Dashboard
- [ ] **Settings page** loads user data
- [ ] **Logout** works properly
- [ ] **Login again** works after logout

## Step 6: Troubleshooting

### If the Issue Persists

1. **Check Supabase Logs**
   - Go to Supabase Dashboard → Logs
   - Look for authentication errors

2. **Check Browser Console**
   - Look for specific error messages
   - Check network requests to Supabase

3. **Verify Database Tables**
   ```sql
   -- Check if tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('user_profiles', 'user_settings');
   ```

4. **Check RLS Policies**
   ```sql
   -- Check policies
   SELECT * FROM pg_policies 
   WHERE tablename IN ('user_profiles', 'user_settings');
   ```

### Common Issues

#### Issue: Trigger Not Firing
**Solution**: Check if trigger exists and is enabled

#### Issue: RLS Blocking Inserts
**Solution**: Verify policies allow authenticated users to insert

#### Issue: Foreign Key Constraints
**Solution**: Ensure user exists in auth.users table

#### Issue: Network Errors
**Solution**: Check Supabase connection and API keys

## Step 7: Production Deployment

### Environment Variables

Ensure these are set correctly:

```bash
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_AUTH_REDIRECT_URL=your-production-url/auth-callback
```

### Database Migration

For production, run the fix script in your production Supabase instance.

## Success Criteria

✅ Users can sign up and are immediately redirected to dashboard
✅ No "no authentication found" errors
✅ User profiles and settings are created automatically
✅ Settings page works correctly
✅ Logout and re-login work properly
✅ Console shows successful profile creation logs

Once all criteria are met, the signup issue is resolved! 🎉
