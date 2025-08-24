// Logout Test Script
// Run this in your browser console to test logout functionality

async function testLogout() {
  console.log('🔍 Testing Logout Functionality...');
  
  try {
    // Test 1: Check if user is authenticated
    console.log('\n1️⃣ Checking Authentication Status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Authentication Error:', authError);
      return;
    }
    
    if (!user) {
      console.log('ℹ️ No user found - already logged out');
      return;
    }
    
    console.log('✅ User is authenticated:', user.email);
    
    // Test 2: Test signOut function
    console.log('\n2️⃣ Testing Sign Out Function...');
    const { signOut } = await import('@/services/supabaseAuth');
    
    console.log('📞 Calling signOut()...');
    const result = await signOut();
    console.log('📋 Sign out result:', result);
    
    if (result.success) {
      console.log('✅ Sign out successful!');
      
      // Test 3: Verify user is logged out
      console.log('\n3️⃣ Verifying Logout...');
      const { data: { user: userAfterLogout }, error: logoutCheckError } = await supabase.auth.getUser();
      
      if (logoutCheckError) {
        console.error('❌ Error checking logout status:', logoutCheckError);
      } else if (!userAfterLogout) {
        console.log('✅ User successfully logged out!');
      } else {
        console.log('⚠️ User still appears to be logged in:', userAfterLogout.email);
      }
    } else {
      console.error('❌ Sign out failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Test the logout button click
function testLogoutButton() {
  console.log('🔍 Testing Logout Button...');
  
  // Find the logout button
  const logoutButton = document.querySelector('[data-testid="logout-button"]') || 
                      document.querySelector('button[onclick*="handleSignOut"]') ||
                      document.querySelector('button:has(svg[data-lucide="log-out"])');
  
  if (logoutButton) {
    console.log('✅ Found logout button:', logoutButton);
    console.log('🖱️ Clicking logout button...');
    logoutButton.click();
    console.log('✅ Logout button clicked!');
  } else {
    console.log('❌ Could not find logout button');
    console.log('💡 Make sure you are on the dashboard page');
  }
}

// Run the tests
console.log('🚀 Starting Logout Tests...');
testLogout();
// testLogoutButton(); // Uncomment to test button click
