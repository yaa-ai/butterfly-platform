# 404 Error Debugging Guide

## Issue: "Failed to load resource: the server responded with a status of 404"

This error indicates that a resource (route, file, or API endpoint) is not being found.

## Step 1: Identify the 404 Source

### Check Browser Console
1. **Open browser console** (F12)
2. **Look for the specific 404 error**
3. **Note the URL** that's returning 404

### Check Network Tab
1. **Go to Network tab** in DevTools
2. **Try to reproduce the error**
3. **Look for failed requests** (red entries)
4. **Check the URL** that's failing

## Step 2: Common 404 Sources

### 1. Auth Callback Route
**URL Pattern**: `/auth-callback` or `/auth/callback`
**Issue**: Route not properly configured

### 2. Static Assets
**URL Pattern**: `/_expo/static/...` or `/assets/...`
**Issue**: Build files missing

### 3. API Endpoints
**URL Pattern**: `/api/...` or Supabase endpoints
**Issue**: API routes not configured

### 4. Navigation Routes
**URL Pattern**: `/dashboard`, `/settings`, etc.
**Issue**: Route not found in app

## Step 3: Debug Auth Callback 404

### Check Route Configuration

1. **Verify route exists**:
   ```bash
   # Check if auth-callback.tsx exists
   ls app/auth-callback.tsx
   ```

2. **Check layout configuration**:
   ```typescript
   // In app/_layout.tsx, ensure this route is included
   <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
   ```

3. **Check file structure**:
   ```
   app/
   ├── auth-callback.tsx  ✅ Should exist
   ├── _layout.tsx        ✅ Should include route
   └── (tabs)/
       └── _layout.tsx
   ```

### Test Auth Callback Route

1. **Try accessing directly**:
   ```
   https://your-domain.com/auth-callback
   ```

2. **Check if it loads** or shows 404

## Step 4: Debug Static Assets 404

### Check Build Files

1. **Verify build completed**:
   ```bash
   # Check if dist folder exists
   ls dist/
   ```

2. **Check for missing files**:
   ```bash
   # Look for missing assets
   find dist/ -name "*.js" -o -name "*.css" | head -10
   ```

### Rebuild the Project

```bash
# Clear cache and rebuild
npx expo export --platform web --clear
```

## Step 5: Debug API Endpoints 404

### Check Supabase Configuration

1. **Verify environment variables**:
   ```bash
   # Check if these are set
   echo $EXPO_PUBLIC_SUPABASE_URL
   echo $EXPO_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Test Supabase connection**:
   ```javascript
   // In browser console
   console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
   console.log('Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
   ```

## Step 6: Quick Fixes

### Fix 1: Rebuild the Project
```bash
# Clear everything and rebuild
rm -rf dist/
rm -rf .expo/
npx expo export --platform web
```

### Fix 2: Check Route Configuration
```typescript
// In app/_layout.tsx, ensure all routes are included
<Stack>
  <Stack.Screen name="index" options={{ headerShown: false }} />
  <Stack.Screen name="login" options={{ headerShown: false }} />
  <Stack.Screen name="register" options={{ headerShown: false }} />
  <Stack.Screen name="settings" options={{ headerShown: false }} />
  <Stack.Screen name="debug" options={{ headerShown: false }} />
  <Stack.Screen name="auth" options={{ headerShown: false }} />
  <Stack.Screen name="auth-callback" options={{ headerShown: false }} /> {/* Make sure this exists */}
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="+not-found" />
</Stack>
```

### Fix 3: Check Environment Variables
```bash
# Create or update .env file
cat > .env << EOF
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_AUTH_REDIRECT_URL=https://your-domain.com/auth-callback
EOF
```

## Step 7: Specific Debugging Steps

### For Auth Callback 404

1. **Check if file exists**:
   ```bash
   ls -la app/auth-callback.tsx
   ```

2. **Check route registration**:
   ```bash
   grep -n "auth-callback" app/_layout.tsx
   ```

3. **Test the route**:
   ```bash
   # Start development server
   npx expo start --web
   # Then try accessing /auth-callback
   ```

### For Static Assets 404

1. **Check build output**:
   ```bash
   ls -la dist/
   ```

2. **Check for missing files**:
   ```bash
   find dist/ -type f -name "*.js" | wc -l
   ```

3. **Rebuild with verbose output**:
   ```bash
   npx expo export --platform web --clear --verbose
   ```

## Step 8: Production vs Development

### Development Environment
- **Check if dev server is running**
- **Verify hot reload is working**
- **Check for TypeScript errors**

### Production Environment
- **Check deployment logs**
- **Verify build artifacts**
- **Check CDN/static hosting**

## Step 9: Common Solutions

### Solution 1: Missing Route
```typescript
// Add missing route to _layout.tsx
<Stack.Screen name="missing-route" options={{ headerShown: false }} />
```

### Solution 2: Wrong URL
```typescript
// Check redirect URLs in Supabase
// Should match your actual domain
```

### Solution 3: Build Issues
```bash
# Clean and rebuild
rm -rf node_modules/
npm install
npx expo export --platform web --clear
```

## Step 10: Get More Information

### Enable Verbose Logging
```bash
# Start with verbose logging
npx expo start --web --verbose
```

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click on "Logs"
3. Look for 404 errors

### Check Browser Network Tab
1. Open DevTools → Network
2. Reproduce the error
3. Look for failed requests

## Success Indicators

✅ **No 404 errors** in console
✅ **All routes** accessible
✅ **Static assets** loading
✅ **API calls** working
✅ **Auth flow** completing successfully

## Next Steps

1. **Identify the specific URL** causing 404
2. **Check if the resource exists**
3. **Verify route configuration**
4. **Rebuild if necessary**
5. **Test the fix**

Share the specific URL that's returning 404, and I can provide more targeted help! 🔍
