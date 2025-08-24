# Quick Database Setup Guide

## 🚨 Issue: Tables Don't Exist in Supabase

The save button isn't working because the database tables haven't been created yet. Follow these steps to fix this:

## Step 1: Access Supabase SQL Editor

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

## Step 2: Execute the Database Schema

1. **Copy the Schema**
   - Open the file `database/schema.sql` in your project
   - Copy ALL the content

2. **Paste and Execute**
   - Paste the entire schema into the SQL Editor
   - Click **"Run"** button

## Step 3: Verify Tables Created

After execution, you should see these tables in **Table Editor**:
- ✅ `user_profiles`
- ✅ `user_settings` 
- ✅ `api_keys`
- ✅ `social_connections`
- ✅ `content_posts`
- ✅ `user_activity_log`

## Step 4: Test the Settings Page

1. **Go back to your app**
2. **Navigate to Settings**
3. **Try saving API keys and settings**
4. **Check browser console for any errors**

## Alternative: Manual Table Creation

If the schema doesn't work, create tables manually:

### 1. User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  company TEXT,
  job_title TEXT,
  location TEXT,
  website TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. User Settings Table
```sql
CREATE TABLE user_settings (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  auto_post_to_linkedin BOOLEAN DEFAULT false,
  content_review_required BOOLEAN DEFAULT true,
  ai_model_preference TEXT DEFAULT 'gpt-4' CHECK (ai_model_preference IN ('gpt-4', 'gpt-3.5-turbo', 'gemini-pro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. API Keys Table
```sql
CREATE TABLE api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL CHECK (service_name IN ('openai', 'gemini', 'linkedin')),
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_name, key_name)
);
```

### 4. Social Connections Table
```sql
CREATE TABLE social_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'facebook')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  platform_user_id TEXT,
  platform_username TEXT,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);
```

### 5. Content Posts Table
```sql
CREATE TABLE content_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'facebook')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  ai_model_used TEXT,
  tokens_used INTEGER,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  platform_post_id TEXT,
  engagement_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. User Activity Log Table
```sql
CREATE TABLE user_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 5: Enable RLS and Create Policies

### Enable RLS
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
```

### Create Basic Policies
```sql
-- User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- User Settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = id);

-- API Keys
CREATE POLICY "Users can view own API keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own API keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own API keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own API keys" ON api_keys FOR DELETE USING (auth.uid() = user_id);

-- Social Connections
CREATE POLICY "Users can view own social connections" ON social_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social connections" ON social_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social connections" ON social_connections FOR UPDATE USING (auth.uid() = user_id);

-- Content Posts
CREATE POLICY "Users can view own posts" ON content_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON content_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON content_posts FOR UPDATE USING (auth.uid() = user_id);

-- Activity Log
CREATE POLICY "Users can view own activity" ON user_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step 6: Test the Integration

1. **Refresh your app**
2. **Go to Settings**
3. **Try saving an API key**
4. **Check if it appears in the database**

## Troubleshooting

### If Tables Still Don't Appear:
1. **Check SQL Editor logs** for any errors
2. **Verify you're in the correct project**
3. **Try running each table creation separately**

### If Save Button Still Doesn't Work:
1. **Open browser console** (F12)
2. **Look for error messages**
3. **Check network tab** for failed requests

### Common Errors:
- **"relation does not exist"**: Tables not created
- **"permission denied"**: RLS policies not set up
- **"invalid input syntax"**: Check data types

## Success Indicators

✅ Tables appear in Supabase Table Editor
✅ Save button works without errors
✅ API keys are stored in the database
✅ Settings are persisted between sessions
✅ No console errors

Once you see these indicators, your database is working correctly! 🎉
