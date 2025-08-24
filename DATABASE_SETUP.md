# Database Setup Guide

## Overview

This guide will help you set up the Supabase database for the Butterfly Platform, including user profiles, settings, API keys, and social media connections.

## Prerequisites

1. **Supabase Project**: You should already have a Supabase project set up
2. **Database Access**: Access to your Supabase dashboard
3. **SQL Editor**: Access to the Supabase SQL editor

## Step 1: Create Database Schema

### 1.1 Open SQL Editor

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### 1.2 Execute Schema Script

Copy and paste the entire contents of `database/schema.sql` into the SQL editor and execute it.

This will create:
- **User Profiles Table**: Extended user information
- **User Settings Table**: User preferences and configuration
- **API Keys Table**: Encrypted API keys for services
- **Social Connections Table**: OAuth tokens and platform connections
- **Content Posts Table**: AI-generated content and posting history
- **User Activity Log Table**: User actions and system events

### 1.3 Verify Tables Created

After execution, you should see these tables in your **Table Editor**:
- `user_profiles`
- `user_settings`
- `api_keys`
- `social_connections`
- `content_posts`
- `user_activity_log`

## Step 2: Configure Row Level Security (RLS)

The schema automatically enables RLS and creates policies for each table. Verify that:

1. **RLS is enabled** for all tables
2. **Policies are created** for each table
3. **Users can only access their own data**

### 2.1 Check RLS Status

In the **Table Editor**, each table should show:
- **RLS**: Enabled ✅
- **Policies**: Multiple policies listed

### 2.2 Test RLS Policies

You can test the policies by:
1. Creating a test user
2. Attempting to access data from different user contexts
3. Verifying that users can only see their own data

## Step 3: Verify Triggers and Functions

### 3.1 Check Automatic Profile Creation

The schema includes a trigger that automatically creates user profiles and settings when a new user signs up.

**Test this by:**
1. Creating a new user account
2. Checking that a profile and settings record are automatically created
3. Verifying the user activity log entry

### 3.2 Check Timestamp Updates

All tables have triggers that automatically update the `updated_at` timestamp when records are modified.

## Step 4: Test Database Operations

### 4.1 Test API Key Storage

```sql
-- Test inserting an API key (replace with actual user ID)
INSERT INTO api_keys (user_id, service_name, key_name, encrypted_key)
VALUES ('your-user-id', 'openai', 'default', 'encrypted-key-here');
```

### 4.2 Test User Settings

```sql
-- Test updating user settings
UPDATE user_settings 
SET theme = 'dark', ai_model_preference = 'gpt-4'
WHERE id = 'your-user-id';
```

### 4.3 Test Social Connections

```sql
-- Test social connection
INSERT INTO social_connections (user_id, platform, is_connected, platform_username)
VALUES ('your-user-id', 'linkedin', true, 'test-username');
```

## Step 5: Environment Variables

Ensure your environment variables are properly configured:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OAuth Redirect URL
EXPO_PUBLIC_AUTH_REDIRECT_URL=https://your-domain.com/auth-callback
```

## Step 6: Test Application Integration

### 6.1 Test Settings Page

1. **Load Settings**: Verify that user settings load correctly
2. **Save API Keys**: Test saving and retrieving API keys
3. **Update Preferences**: Test updating user preferences
4. **Social Connections**: Test connecting/disconnecting platforms

### 6.2 Test Dashboard Integration

1. **User Stats**: Verify that dashboard shows correct user statistics
2. **Profile Data**: Check that user profile information displays correctly
3. **Activity Log**: Verify that user actions are logged

## Step 7: Security Considerations

### 7.1 API Key Encryption

**Current Implementation**: Simple base64 encoding
**Production Recommendation**: Use proper encryption

```javascript
// In production, replace the simple encryption with:
import { encrypt, decrypt } from 'crypto-js';

const encryptApiKey = (key: string): string => {
  return encrypt(key, process.env.ENCRYPTION_KEY).toString();
};

const decryptApiKey = (encryptedKey: string): string => {
  return decrypt(encryptedKey, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
};
```

### 7.2 Environment Variables

Add encryption key to your environment:
```bash
ENCRYPTION_KEY=your-secure-encryption-key
```

### 7.3 Database Backups

1. **Enable Point-in-Time Recovery** in Supabase
2. **Set up automated backups**
3. **Test restore procedures**

## Step 8: Monitoring and Maintenance

### 8.1 Database Monitoring

1. **Enable Query Performance Insights**
2. **Monitor RLS policy performance**
3. **Track API key usage**

### 8.2 Regular Maintenance

1. **Clean up old activity logs** (older than 90 days)
2. **Archive old content posts**
3. **Monitor storage usage**

## Troubleshooting

### Common Issues

#### 1. RLS Policies Not Working

**Symptoms**: Users can't access their data
**Solution**: Check that policies are correctly created and user authentication is working

```sql
-- Check if user is authenticated
SELECT auth.uid();

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

#### 2. API Keys Not Saving

**Symptoms**: API keys disappear after saving
**Solution**: Check encryption/decryption functions and database permissions

#### 3. Profile Not Created on Signup

**Symptoms**: New users don't have profiles
**Solution**: Check the trigger function and ensure it's properly created

```sql
-- Check trigger function
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

#### 4. Performance Issues

**Symptoms**: Slow queries or timeouts
**Solution**: 
- Add indexes for frequently queried columns
- Optimize RLS policies
- Consider pagination for large datasets

### Debug Queries

```sql
-- Check user data
SELECT * FROM user_profiles WHERE id = 'user-id';
SELECT * FROM user_settings WHERE id = 'user-id';
SELECT * FROM api_keys WHERE user_id = 'user-id';

-- Check activity log
SELECT * FROM user_activity_log 
WHERE user_id = 'user-id' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check social connections
SELECT * FROM social_connections 
WHERE user_id = 'user-id';
```

## Next Steps

### 1. Production Deployment

1. **Set up production Supabase project**
2. **Configure proper encryption**
3. **Set up monitoring and alerts**
4. **Test all functionality in production**

### 2. Advanced Features

1. **Implement real-time subscriptions** for live updates
2. **Add database functions** for complex operations
3. **Set up automated content scheduling**
4. **Implement analytics and reporting**

### 3. Scaling Considerations

1. **Database connection pooling**
2. **Query optimization**
3. **Caching strategies**
4. **Data archiving policies**

## Support

If you encounter issues:

1. **Check Supabase logs** in the dashboard
2. **Review RLS policies** and permissions
3. **Test with simple queries** first
4. **Consult Supabase documentation**

## Success Criteria

✅ Database schema created successfully
✅ RLS policies working correctly
✅ User profiles created automatically
✅ API keys can be saved and retrieved
✅ Settings page loads and saves data
✅ Social connections work properly
✅ Activity logging functions correctly
✅ Dashboard shows accurate statistics

Once all criteria are met, your database is ready for production use! 🎉
