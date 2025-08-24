# Logout Troubleshooting Guide

## Issue: Logout Button Not Working

The logout button doesn't seem to do anything when clicked. Let's debug this step by step.

## Step 1: Check Browser Console

1. **Open your app** and go to the dashboard
2. **Press F12** to open browser console
3. **Click the logout button**
4. **Look for any error messages**

## Step 2: Test Logout Functionality

### Run the Test Script

Copy and paste this into your browser console:

```javascript
// Quick logout test
async function quickLogoutTest() {
  console.log('🔍 Testing logout...');
  
  try {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user ? user.email : 'None');
    
    if (!user) {
      console.log('❌ No user to log out');
      return;
    }
    
    // Try to sign out
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Logout error:', error);
    } else {
      console.log('✅ Logout successful');
      
      // Verify logout
      const { data: { user: userAfter } } = await supabase.auth.getUser();
      console.log('User after logout:', userAfter ? userAfter.email : 'None');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

quickLogoutTest();
```

## Step 3: Common Issues and Solutions

### Issue 1: Button Not Responding

**Symptoms**: Clicking the button does nothing
**Possible Causes**:
- Button is disabled
- Event handler not attached
- JavaScript error preventing execution

**Solutions**:
1. **Check if button is disabled**:
   ```javascript
   // In console, check if button is disabled
   const logoutBtn = document.querySelector('[testID="logout-button"]');
   console.log('Button disabled:', logoutBtn?.disabled);
   ```

2. **Check for JavaScript errors** in console

3. **Try clicking programmatically**:
   ```javascript
   // Force click the button
   const logoutBtn = document.querySelector('[testID="logout-button"]');
   if (logoutBtn) {
     logoutBtn.click();
   }
   ```

### Issue 2: Sign Out Fails

**Symptoms**: Button responds but logout doesn't work
**Possible Causes**:
- Supabase connection issue
- Authentication state corrupted
- Network error

**Solutions**:
1. **Check Supabase connection**:
   ```javascript
   // Test Supabase connection
   const { data, error } = await supabase.auth.getUser();
   console.log('Supabase test:', { data, error });
   ```

2. **Force clear session**:
   ```javascript
   // Force clear everything
   await supabase.auth.signOut();
   localStorage.clear();
   sessionStorage.clear();
   window.location.href = '/login';
   ```

### Issue 3: Navigation Fails

**Symptoms**: Logout works but doesn't redirect to login
**Possible Causes**:
- Router navigation issue
- Route not found
- Navigation blocked

**Solutions**:
1. **Check if login route exists**:
   ```javascript
   // Test navigation
   router.push('/login');
   ```

2. **Use window.location as fallback**:
   ```javascript
   // Force redirect
   window.location.href = '/login';
   ```

## Step 4: Enhanced Logout Implementation

If the current logout isn't working, try this enhanced version:

```javascript
const handleSignOut = async () => {
  console.log('🔄 Starting enhanced logout...');
  
  try {
    // Step 1: Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Supabase logout error:', error);
      throw error;
    }
    
    console.log('✅ Supabase logout successful');
    
    // Step 2: Clear local storage
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Local storage cleared');
    } catch (storageError) {
      console.log('⚠️ Storage clear error:', storageError);
    }
    
    // Step 3: Navigate to login
    try {
      await router.replace('/login');
      console.log('✅ Navigation successful');
    } catch (navError) {
      console.error('❌ Navigation error:', navError);
      // Fallback navigation
      window.location.href = '/login';
    }
    
  } catch (error) {
    console.error('❌ Logout failed:', error);
    Alert.alert('Error', `Logout failed: ${error.message}`);
  }
};
```

## Step 5: Debug Steps

### 1. Check Authentication State

```javascript
// Check current auth state
const { data: { user, session } } = await supabase.auth.getUser();
console.log('Auth state:', { user: user?.email, session: !!session });
```

### 2. Check Router State

```javascript
// Check if router is working
console.log('Current route:', window.location.pathname);
```

### 3. Check for Errors

```javascript
// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth change:', event, session?.user?.email);
});
```

## Step 6: Manual Logout

If the button still doesn't work, you can manually log out:

### Option 1: Browser Console
```javascript
// Run this in console
await supabase.auth.signOut();
window.location.href = '/login';
```

### Option 2: Clear Everything
```javascript
// Nuclear option - clear everything
await supabase.auth.signOut();
localStorage.clear();
sessionStorage.clear();
cookies.clear(); // if you have cookies
window.location.href = '/login';
```

## Step 7: Verify Fix

After implementing fixes:

1. **Refresh the page**
2. **Click logout button**
3. **Check console for success messages**
4. **Verify you're redirected to login**
5. **Try logging in again**

## Success Indicators

✅ Logout button responds to clicks
✅ Console shows logout process
✅ User is signed out from Supabase
✅ Redirected to login page
✅ Can log in again successfully
✅ No authentication errors

## Common Error Messages

- **"Cannot read property 'signOut' of undefined"** → Supabase client not initialized
- **"Navigation failed"** → Router issue
- **"Permission denied"** → Authentication state issue
- **"Network error"** → Connection problem

If you're still having issues, share the specific error messages from the console! 🔍
