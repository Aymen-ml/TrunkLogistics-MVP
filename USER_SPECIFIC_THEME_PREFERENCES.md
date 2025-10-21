# User-Specific Theme Preferences Implementation

## Overview
Implemented user-specific theme preferences so each user has their own dark/light mode setting, stored in the database and loaded on login.

**Date:** October 21, 2025  
**Status:** ✅ Ready for Deployment

---

## Problem Statement

### Before (Browser-Based)
- ❌ Theme stored in browser `localStorage` only
- ❌ Shared across all users on same browser
- ❌ User A sets dark mode → User B sees dark mode
- ❌ Not tied to user accounts

### After (User-Based)
- ✅ Theme stored in user's database profile
- ✅ Each user has their own preference
- ✅ User A sets dark mode → User B has their own theme
- ✅ Theme persists across devices and browsers

---

## Architecture Changes

### 1. Database Layer

**Migration:** `add-theme-preference-migration.sql`

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) 
DEFAULT 'light' 
CHECK (theme_preference IN ('light', 'dark'));
```

**Features:**
- ✅ Column added to `users` table
- ✅ Default value: `'light'`
- ✅ Constraint: Only allows `'light'` or `'dark'`
- ✅ Existing users default to light theme

---

### 2. Backend Layer

#### **User Model** (`server/src/models/User.js`)

**New Methods:**
```javascript
// Update user's theme preference
static async updateThemePreference(userId, theme)

// Get user's theme preference
static async getThemePreference(userId)
```

**Updated Methods:**
```javascript
// findById now includes theme_preference
static async findById(id) {
  // Returns: { ..., theme_preference, ... }
}
```

---

#### **User Controller** (`server/src/controllers/userController.js`)

**New Endpoints:**

1. **PUT /api/users/preferences/theme**
   - Updates user's theme preference
   - Request: `{ "theme": "dark" }`
   - Response: `{ "success": true, "data": { "theme": "dark" } }`
   - Authentication: Required

2. **GET /api/users/preferences**
   - Gets user preferences (theme, email, role)
   - Response: `{ "success": true, "data": { "theme": "light", ... } }`
   - Authentication: Required

**Functions:**
```javascript
export const updateThemePreference = async (req, res) => { ... }
export const getUserPreferences = async (req, res) => { ... }
```

---

#### **Routes** (`server/src/routes/users.js`)

**New Routes:**
```javascript
// GET /api/users/preferences - Get user preferences
router.get('/preferences', authenticate, getUserPreferences);

// PUT /api/users/preferences/theme - Update theme
router.put('/preferences/theme', authenticate, updateThemePreference);
```

---

### 3. Frontend Layer

#### **Settings Component** (`client/src/components/settings/Settings.jsx`)

**Updated:**
```javascript
const handleSaveSettings = async () => {
  // Save theme to backend (user-specific)
  await apiClient.put('/users/preferences/theme', { theme });
  
  // Also save to localStorage (as backup)
  localStorage.setItem('theme', theme);
  
  // Apply immediately
  document.documentElement.classList.toggle('dark', theme === 'dark');
};
```

**Flow:**
1. User changes theme in settings
2. Clicks "Save Settings"
3. API call to backend: `PUT /api/users/preferences/theme`
4. Database updated with user's preference
5. localStorage updated (fallback)
6. Theme applied immediately

---

#### **Auth Context** (`client/src/contexts/AuthContext.jsx`)

**New Function:**
```javascript
const loadUserTheme = async () => {
  const response = await axios.get('/users/preferences');
  const theme = response.data.data.theme || 'light';
  
  // Apply theme
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
  
  return theme;
};
```

**Updated Functions:**

1. **login()** - Load theme after successful login
   ```javascript
   const login = async (email, password) => {
     // ... existing login logic
     
     // Load user's theme preference after login
     setTimeout(() => loadUserTheme(), 100);
     
     return { success: true, user: userData };
   };
   ```

2. **logout()** - Reset theme to light mode
   ```javascript
   const logout = () => {
     // ... existing logout logic
     
     // Reset theme to light mode on logout
     document.documentElement.classList.remove('dark');
     localStorage.setItem('theme', 'light');
   };
   ```

3. **initializeAuth()** - Load theme for already logged-in users
   ```javascript
   const initializeAuth = async () => {
     if (storedToken && storedUser) {
       // ... verify token
       
       // Load user's theme preference
       await loadUserTheme();
     }
   };
   ```

---

## User Flow

### Scenario 1: New User Registration
1. User registers → Default theme: **light**
2. User goes to Settings → Changes to dark
3. Clicks "Save Settings" → Theme saved to database
4. User logs out → Theme resets to light
5. User logs back in → Dark theme loaded automatically

### Scenario 2: Existing User
1. User already has theme preference in database
2. User logs in → Theme loaded from database
3. Theme applied immediately on login

### Scenario 3: Multi-User Same Browser
1. **User A** logs in → Sees their theme (dark)
2. User A logs out → Theme resets to light
3. **User B** logs in → Sees their theme (light)
4. User B logs out → Theme resets to light
5. **User A** logs back in → Sees their theme (dark) again

### Scenario 4: Multi-Device
1. User sets dark theme on **Desktop**
2. User logs in on **Mobile** → Dark theme loads
3. User changes to light on **Mobile**
4. User logs in on **Desktop** → Light theme loads
5. ✅ Theme syncs across all devices!

---

## API Documentation

### 1. Update Theme Preference

**Endpoint:** `PUT /api/users/preferences/theme`  
**Authentication:** Required  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "theme": "dark"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "theme": "dark"
  },
  "message": "Theme preference updated successfully"
}
```

**Error Responses:**

400 - Invalid theme:
```json
{
  "success": false,
  "error": "Invalid theme. Must be 'light' or 'dark'"
}
```

401 - Unauthorized:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

404 - User not found:
```json
{
  "success": false,
  "error": "User not found"
}
```

---

### 2. Get User Preferences

**Endpoint:** `GET /api/users/preferences`  
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "theme": "light",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

**Error Responses:**

401 - Unauthorized:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

404 - User not found:
```json
{
  "success": false,
  "error": "User not found"
}
```

---

## Database Schema

### users table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  theme_preference VARCHAR(10) DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')), -- NEW
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Deployment Steps

### 1. Database Migration

**Run migration on Supabase:**

```sql
-- Connect to your Supabase database
-- Run the migration
\i add-theme-preference-migration.sql

-- Verify column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'theme_preference';
```

**Expected Output:**
```
column_name      | data_type    | column_default
-----------------+--------------+----------------
theme_preference | varchar(10)  | 'light'
```

---

### 2. Backend Deployment

**Files to deploy:**
- ✅ `server/src/models/User.js` (updated)
- ✅ `server/src/controllers/userController.js` (new functions)
- ✅ `server/src/routes/users.js` (new routes)

**Deploy to Render:**
```bash
git add -A
git commit -m "Add user-specific theme preferences"
git push origin main
```

Render will automatically redeploy the backend.

---

### 3. Frontend Deployment

**Files to deploy:**
- ✅ `client/src/components/settings/Settings.jsx` (API integration)
- ✅ `client/src/contexts/AuthContext.jsx` (theme loading)

**Deploy to Vercel:**
```bash
git add -A
git commit -m "Add user-specific theme preferences"
git push origin main
```

Vercel will automatically redeploy the frontend.

---

## Testing Checklist

### Database Tests
- [ ] Run migration successfully
- [ ] Verify `theme_preference` column exists
- [ ] Check default value is 'light'
- [ ] Verify constraint allows only 'light' and 'dark'
- [ ] Test updating theme_preference manually

### API Tests
- [ ] POST /api/users/preferences/theme with valid theme
- [ ] POST /api/users/preferences/theme with invalid theme (should fail)
- [ ] GET /api/users/preferences returns correct theme
- [ ] Test without authentication (should fail)
- [ ] Test with invalid user ID

### Frontend Tests

**Single User:**
- [ ] Register new user → Default theme is light
- [ ] Change theme to dark → Save → Theme applied
- [ ] Logout → Theme resets to light
- [ ] Login → Dark theme loads automatically
- [ ] Refresh page → Theme persists

**Multi-User Same Browser:**
- [ ] User A logs in → Sets dark theme → Saves
- [ ] User A logs out
- [ ] User B logs in → Should see their own theme (light by default)
- [ ] User B sets light theme explicitly → Saves
- [ ] User B logs out
- [ ] User A logs back in → Should see dark theme again
- [ ] Verify themes don't mix between users

**Multi-Device:**
- [ ] Login on Device 1 → Set dark theme → Save
- [ ] Login on Device 2 → Should see dark theme
- [ ] Change to light on Device 2 → Save
- [ ] Go back to Device 1 → Refresh → Should see light theme

**Edge Cases:**
- [ ] Network error during save → Should show error message
- [ ] Logout during theme load → Should handle gracefully
- [ ] Invalid token → Should not crash
- [ ] Missing theme_preference in database → Should default to light

---

## Rollback Plan

If issues occur, rollback in this order:

### 1. Frontend Rollback
```bash
git revert <commit-hash>
git push origin main
```

This reverts to localStorage-only theme (browser-based).

### 2. Backend Rollback
```bash
git revert <commit-hash>
git push origin main
```

This removes the API endpoints.

### 3. Database Rollback (if needed)
```sql
ALTER TABLE users DROP COLUMN IF EXISTS theme_preference;
```

**Warning:** This will delete all user theme preferences!

---

## Performance Considerations

### Backend
- **Query Performance:** Simple UPDATE/SELECT on indexed `id` column
- **Load:** Minimal - one extra column in user queries
- **Impact:** 🟢 Negligible

### Frontend
- **API Calls:** One extra GET on login (parallel with profile load)
- **localStorage:** Still used as fallback
- **Load Time:** +50-100ms on login (async, non-blocking)
- **Impact:** 🟢 Not noticeable

### Database
- **Storage:** VARCHAR(10) per user (~10 bytes per user)
- **For 10,000 users:** ~100 KB additional storage
- **Impact:** 🟢 Negligible

---

## Security Considerations

### Authentication
- ✅ All endpoints require authentication
- ✅ User can only update their own theme
- ✅ No admin-only restrictions (all users can set theme)

### Validation
- ✅ Input validation: Only 'light' or 'dark' allowed
- ✅ Database constraint ensures data integrity
- ✅ Controller validates before updating

### Data Privacy
- ✅ Theme preference is personal but not sensitive
- ✅ No PII (Personally Identifiable Information)
- ✅ Safe to log theme changes

---

## Monitoring

### What to Watch
1. **API Errors:** Check logs for theme API failures
2. **Database:** Monitor for constraint violations
3. **User Reports:** Listen for theme not saving/loading
4. **Performance:** Watch API response times

### Logs to Check
```bash
# Backend logs (Render)
- "Theme preference updated for user X: dark"
- "Get user preferences error: ..."

# Frontend logs (Browser console)
- "Failed to load user theme: ..."
- "Error saving settings: ..."
```

---

## Future Enhancements

### Potential Features
1. **More Themes:** Add 'auto' (system preference), 'high-contrast', etc.
2. **Scheduled Themes:** Auto-switch at certain times (e.g., dark at 8 PM)
3. **Theme Customization:** Let users pick accent colors
4. **Admin Dashboard:** View theme usage statistics
5. **Notification Preferences:** Store more user preferences

### API Extensions
```javascript
// Future: Store all preferences in JSON
PUT /api/users/preferences
{
  "theme": "dark",
  "notifications": true,
  "language": "en",
  "timezone": "America/New_York"
}
```

---

## Support Information

### Common Issues

**Issue:** Theme not loading on login
**Solution:** Check browser console for API errors, verify token is valid

**Issue:** Theme resets after logout
**Solution:** This is expected behavior! Theme should reset to light.

**Issue:** Different themes on different browsers
**Solution:** This is correct! Theme is user-based, loads from database each time.

**Issue:** Theme not saving
**Solution:** Check network tab, verify API call succeeds, check backend logs

---

## Related Documentation
- `SETTINGS_ENHANCEMENT.md` - Settings page improvements
- `NOTIFICATION_SETTINGS_FIX.md` - Notification preferences
- Database schema documentation
- API documentation

---

## Summary

✅ **What Changed:**
- Theme preference now stored per user in database
- Each user has their own theme across all devices
- Theme loads automatically on login
- Theme resets to light on logout

✅ **Benefits:**
- Better user experience
- Personalized per user
- Syncs across devices
- Professional app behavior

✅ **Status:** Ready for deployment

---

*Created: October 21, 2025*  
*Last Updated: October 21, 2025*  
*Version: 1.0*
