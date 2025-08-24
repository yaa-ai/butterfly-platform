// Database Test Script
// Run this in your browser console to test database operations

// First, make sure you're logged in and have the supabase client available
// You can run this in the browser console on your app

async function testDatabase() {
  console.log('🔍 Testing Database Operations...');
  
  try {
    // Test 1: Check if user is authenticated
    console.log('\n1️⃣ Testing Authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Authentication Error:', authError);
      return;
    }
    
    if (!user) {
      console.error('❌ No user found - please log in');
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    console.log('📧 User email:', user.email);
    
    // Test 2: Check if user profile exists
    console.log('\n2️⃣ Testing User Profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile Error:', profileError);
      console.log('💡 Profile might not exist - this could be the issue!');
    } else {
      console.log('✅ User profile exists:', profile);
    }
    
    // Test 3: Check if user settings exist
    console.log('\n3️⃣ Testing User Settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (settingsError) {
      console.error('❌ Settings Error:', settingsError);
      console.log('💡 Settings might not exist - this could be the issue!');
    } else {
      console.log('✅ User settings exist:', settings);
    }
    
    // Test 4: Try to insert a test API key
    console.log('\n4️⃣ Testing API Key Insertion...');
    const testKey = btoa('test-api-key-123');
    const { data: apiKey, error: apiKeyError } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        service_name: 'openai',
        key_name: 'test',
        encrypted_key: testKey,
        is_active: true
      })
      .select()
      .single();
    
    if (apiKeyError) {
      console.error('❌ API Key Insertion Error:', apiKeyError);
    } else {
      console.log('✅ API key inserted successfully:', apiKey);
      
      // Clean up - delete the test key
      await supabase
        .from('api_keys')
        .delete()
        .eq('id', apiKey.id);
      console.log('🧹 Test API key cleaned up');
    }
    
    // Test 5: Try to update user settings
    console.log('\n5️⃣ Testing Settings Update...');
    const { data: updatedSettings, error: updateError } = await supabase
      .from('user_settings')
      .update({ theme: 'dark' })
      .eq('id', user.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Settings Update Error:', updateError);
    } else {
      console.log('✅ Settings updated successfully:', updatedSettings);
    }
    
    // Test 6: Check RLS policies
    console.log('\n6️⃣ Testing RLS Policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'user_settings' });
    
    if (policiesError) {
      console.log('ℹ️ Could not check policies directly, but this is normal');
    } else {
      console.log('✅ RLS policies:', policies);
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('- Authentication:', user ? '✅ Working' : '❌ Failed');
    console.log('- User Profile:', profile ? '✅ Exists' : '❌ Missing');
    console.log('- User Settings:', settings ? '✅ Exists' : '❌ Missing');
    console.log('- API Key Insert:', apiKeyError ? '❌ Failed' : '✅ Working');
    console.log('- Settings Update:', updateError ? '❌ Failed' : '✅ Working');
    
    if (!profile || !settings) {
      console.log('\n🚨 ISSUE IDENTIFIED:');
      console.log('User profile or settings are missing!');
      console.log('Run the manual profile creation script in Supabase SQL Editor.');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testDatabase();
