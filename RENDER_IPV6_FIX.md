# Render IPv6 Connection Fix

## Problem
When deploying to Render, the application failed to connect to Supabase with the following error:
```
❌ Database connection failed: connect ENETUNREACH 2a05:d012:42e:5708:c24c:9d9f:c40f:7781:5432 - Local (:::0)
```

## Root Cause
- Render's infrastructure doesn't support outbound IPv6 connections
- Node.js's `pg` library was resolving the Supabase hostname to an IPv6 address
- This caused `ENETUNREACH` (Network Unreachable) errors

## Solution
Added `family: 4` option to all database configurations to force IPv4 connections:

### Files Modified
1. [server/src/config/database.js](server/src/config/database.js)
2. [server/src/config/database-simple.js](server/src/config/database-simple.js)
3. [server/src/config/database-backup.js](server/src/config/database-backup.js)

### Configuration Change
```javascript
const dbConfig = {
  host: 'db.drqkwioicbcihakxgsoe.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
  family: 4, // ← Forces IPv4 connections
  // ... other settings
};
```

## Deployment Steps
1. Changes have been committed and pushed to `main` branch
2. Render will automatically detect the new commit
3. Trigger a new deployment in Render dashboard (or it will auto-deploy)
4. The connection should now succeed using IPv4

## Verification
Once deployed, check the Render logs. You should see:
```
✅ Database connection established
⏰ Database time: [timestamp]
```

Instead of the previous `ENETUNREACH` errors.

## Additional Notes
- The `family: 4` option is supported by the `pg` library's underlying `net.Socket` implementation
- This fix is compatible with both Render and local development environments
- The migration script ([deploy-migrations-fixed.js](deploy-migrations-fixed.js)) already had this fix applied

## Date Fixed
December 28, 2025
