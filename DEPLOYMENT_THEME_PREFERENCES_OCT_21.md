# Deployment Guide - User-Specific Theme Preferences
**Date:** October 21, 2025  
**Commit:** `6f54eed`  
**Status:** ⏳ Awaiting Database Migration

---

## ⚠️ IMPORTANT: Database Migration Required

**This deployment requires a database migration before the backend can work properly!**

---

## Deployment Steps (In Order)

### Step 1: Run Database Migration (FIRST!)

**Connect to Supabase:**
1. Go to https://supabase.com/dashboard
2. Select your project: **TruckLogistics-MVP**
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**

**Run this migration:**

```sql
-- Migration: Add theme preference to users table
-- Date: October 21, 2025

-- Add theme_preference column with default 'light'
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) 
DEFAULT 'light' 
CHECK (theme_preference IN ('light', 'dark'));

-- Add comment for documentation
COMMENT ON COLUMN users.theme_preference IS 'User UI theme preference: light or dark mode';

-- Update existing users to have 'light' theme if null
UPDATE users 
SET theme_preference = 'light' 
WHERE theme_preference IS NULL;

-- Verify the column was added
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

**If you see this output, the migration succeeded! ✅**

---

### Step 2: Backend Deployment (Automatic)

**Render will automatically deploy:**
- ✅ Code already pushed to GitHub
- ✅ Render will detect changes
- ✅ Auto-deploy in ~3-5 minutes

**Monitor deployment:**
1. Go to https://dashboard.render.com
2. Select your backend service
3. Watch the **Events** tab for deployment progress

**Verify backend:**
```bash
# Test the new endpoint (after migration + deployment)
curl -X GET https://your-backend-url.onrender.com/api/users/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: `{"success": true, "data": {"theme": "light", ...}}`

---

### Step 3: Frontend Deployment (Automatic)

**Vercel will automatically deploy:**
- ✅ Code already pushed to GitHub
- ✅ Vercel will detect changes
- ✅ Auto-deploy in ~2-3 minutes

**Monitor deployment:**
1. Go to https://vercel.com/dashboard
2. Select **truck-logistics-mvp**
3. Watch deployment progress

**Verify frontend:**
1. Open https://truck-logistics-mvp.vercel.app/
2. Login with your account
3. Go to Settings
4. Change theme → Save
5. Logout → Login → Theme should persist!

---

## Testing After Deployment

### Critical Tests

**1. Database Column Exists**
```sql
-- Run in Supabase SQL Editor
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'theme_preference';
```

Should return one row with `theme_preference` column.

**2. API Endpoints Work**

Test in browser console (after login):
```javascript
// Get preferences
fetch('/api/users/preferences', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(console.log);

// Update theme
fetch('/api/users/preferences/theme', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ theme: 'dark' })
})
.then(r => r.json())
.then(console.log);
```

**3. User Flow Test**

**Test A: Single User**
1. Login as User A
2. Go to Settings → Change to dark → Save
3. Logout → Theme resets to light ✅
4. Login again → Dark theme loads ✅

**Test B: Multi-User**
1. Login as User A → Set dark theme → Save → Logout
2. Login as User B → Should see light (default) ✅
3. User B sets dark theme → Save → Logout
4. Login as User A again → Should see User A's theme ✅
5. Login as User B again → Should see User B's theme ✅

**Test C: Multi-Device**
1. Login on Desktop → Set dark → Save
2. Login on Mobile → Should see dark ✅
3. Change to light on Mobile → Save
4. Go back to Desktop → Refresh → Should see light ✅

---

## Rollback Plan

**If issues occur:**

### Option 1: Rollback Code Only (Keep Migration)
```bash
git revert 6f54eed
git push origin main
```

This reverts to localStorage-only themes. Database column stays (harmless).

### Option 2: Rollback Everything (Including Migration)
```sql
-- Run in Supabase SQL Editor (ONLY IF NECESSARY)
ALTER TABLE users DROP COLUMN IF EXISTS theme_preference;
```

⚠️ **Warning:** This deletes all user theme preferences!

---

## Troubleshooting

### Issue: "column theme_preference does not exist"
**Solution:** Run the database migration (Step 1 above)

### Issue: API returns 500 error
**Solution:** 
1. Check Render logs for errors
2. Verify migration ran successfully
3. Restart backend service on Render

### Issue: Theme not saving
**Solution:**
1. Check browser console for errors
2. Verify API endpoints are working
3. Check network tab for failed requests

### Issue: Theme not loading on login
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear localStorage and login again
3. Check if API call succeeds in network tab

---

## What Changed

### Backend
- ✅ New column: `users.theme_preference`
- ✅ New endpoint: `GET /api/users/preferences`
- ✅ New endpoint: `PUT /api/users/preferences/theme`
- ✅ Updated: User model includes theme methods

### Frontend
- ✅ Settings saves theme to backend
- ✅ Login loads theme from backend
- ✅ Logout resets theme to light
- ✅ localStorage still used as fallback

### Database
- ✅ Migration adds `theme_preference` column
- ✅ Default value: `'light'`
- ✅ Constraint: Only 'light' or 'dark'

---

## Success Criteria

✅ **Database migration completed**  
✅ **Backend deployed successfully**  
✅ **Frontend deployed successfully**  
✅ **API endpoints working**  
✅ **Single user test passed**  
✅ **Multi-user test passed**  
✅ **Multi-device test passed**  
✅ **No console errors**  
✅ **No backend errors in logs**

---

## Timeline

| Step | Status | Time |
|------|--------|------|
| Code pushed to GitHub | ✅ Complete | Now |
| Database migration | ⏳ Pending | Manual step |
| Render backend deploy | 🔄 Auto | ~3-5 min |
| Vercel frontend deploy | 🔄 Auto | ~2-3 min |
| Testing | ⏳ Pending | After deployment |

---

## Next Steps

1. **NOW:** Run database migration in Supabase SQL Editor
2. **Wait:** For Render backend to deploy (~5 minutes)
3. **Wait:** For Vercel frontend to deploy (~3 minutes)
4. **Test:** Follow testing checklist above
5. **Verify:** All users can save/load themes
6. **Monitor:** Check logs for any errors

---

## Documentation

- `USER_SPECIFIC_THEME_PREFERENCES.md` - Complete technical documentation
- `add-theme-preference-migration.sql` - Database migration file
- API documentation included in technical docs

---

## Support

**If you encounter issues:**
1. Check the troubleshooting section above
2. Review Render and Vercel logs
3. Verify database migration completed
4. Test API endpoints manually

---

*Deployment initiated: October 21, 2025*  
*Status: ⚠️ Database migration required before testing*  
*Commit: 6f54eed*
