# Database Debugging Guide

## Issue: Tables Created But Settings Not Saving

The tables exist but settings aren't being saved. Let's debug this systematically.

## Step 1: Check Browser Console

1. **Open your app**
2. **Press F12** to open browser console
3. **Go to Settings page**
4. **Try to save settings**
5. **Look for error messages**

## Step 2: Check User Profile Creation

The most common issue is that user profiles and settings aren't created automatically when users sign up.

### Check if User Profile Exists

Run this in Supabase SQL Editor:

```sql
-- Check if user profile exists for your user
SELECT * FROM user_profiles WHERE id = 'your-user-id';

-- Check if user settings exist
SELECT * FROM user_settings WHERE id = 'your-user-id';
```

**Replace 'your-user-id' with your actual user ID**

### If No Profile Exists, Create Manually

```sql
-- Insert user profile (replace with your user ID)
INSERT INTO user_profiles (id, full_name, avatar_url)
VALUES (
  'your-user-id',
  'Your Name',
  'https://your-avatar-url.com'
);

-- Insert user settings (replace with your user ID)
INSERT INTO user_settings (id)
VALUES ('your-user-id');
```

## Step 3: Check RLS Policies

The policies might not be working correctly.

### Verify Policies Exist

```sql
-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_settings', 'api_keys');
```

### Test RLS Policies

```sql
-- Test if you can access your own data
SELECT auth.uid(); -- Should return your user ID

-- Test user settings access
SELECT * FROM user_settings WHERE id = auth.uid();

-- Test API keys access
SELECT * FROM api_keys WHERE user_id = auth.uid();
```

## Step 4: Check Trigger Function

The automatic profile creation might not be working.

### Check if Trigger Exists

```sql
-- Check if the trigger function exists
SELECT * FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Check if the trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### Recreate Trigger if Missing

```sql
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  
  -- Insert user settings
  INSERT INTO user_settings (id)
  VALUES (NEW.id);
  
  -- Log the signup activity
  INSERT INTO user_activity_log (user_id, action, details)
  VALUES (NEW.id, 'user_signup', jsonb_build_object('provider', NEW.raw_app_meta_data->>'provider'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Step 5: Manual Profile Creation for Existing Users

If you already have users but no profiles, create them manually:

```sql
-- Get all users without profiles
SELECT u.id, u.email 
FROM auth.users u 
LEFT JOIN user_profiles p ON u.id = p.id 
WHERE p.id IS NULL;

-- Create profiles for existing users (run for each user)
INSERT INTO user_profiles (id, full_name, avatar_url)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User'),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture')
FROM auth.users 
WHERE id NOT IN (SELECT id FROM user_profiles);

-- Create settings for existing users
INSERT INTO user_settings (id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT id FROM user_settings);
```

## Step 6: Test Database Operations

### Test API Key Insertion

```sql
-- Test inserting an API key (replace with your user ID)
INSERT INTO api_keys (user_id, service_name, key_name, encrypted_key)
VALUES (
  'your-user-id',
  'openai',
  'default',
  'dGVzdC1rZXk=' -- This is base64 for 'test-key'
);
```

### Test Settings Update

```sql
-- Test updating settings (replace with your user ID)
UPDATE user_settings 
SET theme = 'dark', ai_model_preference = 'gpt-4'
WHERE id = 'your-user-id';
```

## Step 7: Check Application Logs

### Enable Supabase Logs

1. Go to Supabase Dashboard
2. Click on **"Logs"** in the sidebar
3. Look for any errors when you try to save settings

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to save settings
4. Look for failed requests to Supabase

## Step 8: Common Issues and Solutions

### Issue 1: "relation does not exist"
**Solution**: Tables not created properly - re-run the schema

### Issue 2: "permission denied"
**Solution**: RLS policies not working - check policies and user authentication

### Issue 3: "duplicate key value violates unique constraint"
**Solution**: User profile already exists - check for duplicates

### Issue 4: "foreign key constraint fails"
**Solution**: User doesn't exist in auth.users - check authentication

## Step 9: Quick Fix Script

Run this complete script to fix common issues:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create missing profiles for existing users
INSERT INTO user_profiles (id, full_name, avatar_url)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User'),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture')
FROM auth.users 
WHERE id NOT IN (SELECT id FROM user_profiles);

-- Create missing settings for existing users
INSERT INTO user_settings (id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT id FROM user_settings);

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Recreate policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own API keys" ON api_keys;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own API keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own API keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own API keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);
```

## Step 10: Verify Fix

After running the fixes:

1. **Refresh your app**
2. **Go to Settings**
3. **Try saving an API key**
4. **Check browser console** for success messages
5. **Verify in Supabase** that data appears in tables

## Success Indicators

✅ User profile exists in `user_profiles` table
✅ User settings exist in `user_settings` table  
✅ API keys can be saved to `api_keys` table
✅ Console shows successful operations
✅ No permission denied errors
✅ Settings persist between sessions

If you're still having issues, share the specific error messages from the browser console! 🔍
