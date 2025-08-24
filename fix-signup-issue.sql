-- Fix Signup Issue Script
-- This script fixes the "no authentication found" issue after signup

-- Step 1: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 3: Create the trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile with error handling
  BEGIN
    INSERT INTO user_profiles (id, full_name, avatar_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    );
    RAISE NOTICE 'User profile created for user %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error creating user profile for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Insert user settings with error handling
  BEGIN
    INSERT INTO user_settings (id)
    VALUES (NEW.id);
    RAISE NOTICE 'User settings created for user %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error creating user settings for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Log the signup activity with error handling
  BEGIN
    INSERT INTO user_activity_log (user_id, action, details)
    VALUES (NEW.id, 'user_signup', jsonb_build_object('provider', NEW.raw_app_meta_data->>'provider'));
    RAISE NOTICE 'User activity logged for user %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error logging user activity for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 5: Create missing profiles for existing users
INSERT INTO user_profiles (id, full_name, avatar_url)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User'),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture')
FROM auth.users 
WHERE id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Create missing settings for existing users
INSERT INTO user_settings (id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT id FROM user_settings)
ON CONFLICT (id) DO NOTHING;

-- Step 7: Verify the trigger is working
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 8: Test the function manually (optional)
-- Uncomment the line below to test with a specific user ID
-- SELECT handle_new_user() FROM auth.users WHERE id = 'your-user-id' LIMIT 1;
