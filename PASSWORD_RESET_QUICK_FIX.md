# Password Reset Functionality - Quick Fix Guide

## Problem
The forgot password functionality is not working. Users are not receiving password reset emails.

## Root Cause Analysis

The most common reasons for password reset failures:

1. **Email Service Not Configured** (90% of cases)
   - Missing or invalid SendGrid API key
   - Missing Gmail app password
   - SMTP settings incorrect

2. **Environment Variables Not Set**
   - CLIENT_URL not pointing to correct frontend URL
   - Email credentials not set in production

3. **Database Table Missing**
   - password_reset_tokens table not created

4. **Email Deliverability Issues**
   - Emails going to spam
   - Email provider blocking
   - Domain not verified

## Quick Diagnosis

### Step 1: Check if Table Exists

Run this in your database (Supabase/PostgreSQL):

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'password_reset_tokens'
);
```

If it returns `false`, run the migration:

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```

### Step 2: Check Environment Variables

On **Render** (or your hosting platform), verify these are set:

```env
# Required
CLIENT_URL=https://trucklogistics.netlify.app
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxx...

# Or if using Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional but recommended
EMAIL_FROM=noreply@trucklogistics.com
EMAIL_FROM_NAME=TruckLogistics
```

### Step 3: Test the Backend

Run this command on your server:

```bash
cd server
node test-password-reset.js user@example.com
```

This will:
- ✅ Verify the user exists
- ✅ Create a reset token
- ✅ Generate the reset URL
- ✅ Attempt to send the email
- ✅ Show you the reset URL even if email fails

### Step 4: Manual Password Reset (Temporary Solution)

If email isn't working, you can manually generate a reset link:

1. SSH into your server or use Render shell
2. Run:
```bash
cd server
node test-password-reset.js user@example.com
```
3. Copy the generated URL and send it to the user via another method

## Permanent Fix

### Option 1: Use SendGrid (Recommended)

1. **Create SendGrid Account** (Free tier available):
   - Go to https://sendgrid.com/
   - Sign up for free account
   - Verify your email

2. **Get API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it "TruckLogistics"
   - Choose "Full Access" or "Mail Send"
   - Copy the key (shown only once!)

3. **Configure Sender Identity**:
   - Go to Settings → Sender Authentication
   - Choose "Single Sender Verification"
   - Add and verify noreply@trucklogistics.com (or your domain)

4. **Update Environment Variables** on Render:
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.xxx...
   EMAIL_FROM=noreply@trucklogistics.com
   EMAIL_FROM_NAME=TruckLogistics
   ```

5. **Restart your server** on Render

### Option 2: Use Gmail

1. **Enable 2-Step Verification**:
   - Go to Google Account → Security
   - Turn on 2-Step Verification

2. **Create App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll to "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Name it "TruckLogistics"
   - Copy the 16-character password

3. **Update Environment Variables** on Render:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=TruckLogistics
   ```

4. **Restart your server** on Render

### Option 3: Use Custom SMTP

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=smtp-username
EMAIL_PASSWORD=smtp-password
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME=TruckLogistics
```

## Testing After Fix

1. **Go to Frontend**:
   ```
   https://trucklogistics.netlify.app/forgot-password
   ```

2. **Enter Email Address** of a test user

3. **Check Multiple Places**:
   - Email inbox
   - Spam/Junk folder
   - Render logs for confirmation

4. **Check Server Logs** on Render:
   - Should see: "Password reset email sent to: user@example.com"
   - Should see: "Password reset token created for user [id]"

5. **Click Reset Link** and set new password

6. **Try Login** with new password

## Troubleshooting

### Email Not Arriving

**Check 1: Is email service initialized?**
```
Look in Render logs for:
✅ "Email service initialized successfully"
✅ "SendGrid email service configured"
```

**Check 2: Is email being sent?**
```
Look in Render logs after forgot password request:
✅ "Password reset email sent to: user@example.com"
```

**Check 3: SendGrid Dashboard**
- Go to https://app.sendgrid.com/
- Click "Activity"
- Check if emails are being processed
- Check for any delivery failures

### "Invalid or Expired Token" Error

**Cause**: Token has expired (1 hour) or already used

**Solution**: Request a new password reset

### "Service Not Available" Error

**Cause**: Email service not configured or database connection issue

**Solution**: 
1. Check environment variables
2. Check Render logs for errors
3. Verify database connection

### CORS Errors

**Cause**: API URL mismatch

**Solution**: Verify in client/src/utils/apiClient.js:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://trucklogistics-api.onrender.com/api';
```

## Environment Variables Checklist

Copy this and fill in your values, then add to Render:

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d

# Email (Choose SendGrid OR Gmail)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxx...

# OR for Gmail:
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password

# Email Details
EMAIL_FROM=noreply@trucklogistics.com
EMAIL_FROM_NAME=TruckLogistics

# URLs
CLIENT_URL=https://trucklogistics.netlify.app
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## FAQ

**Q: Can users reset password without email?**
A: For now, no. Email is the only method. However, you can manually generate a reset link using the test script.

**Q: How long do reset links last?**
A: 1 hour (60 minutes). After that, users need to request a new one.

**Q: Can I use my custom domain for emails?**
A: Yes! Set up SPF, DKIM, and DMARC records for your domain, then verify it in SendGrid.

**Q: Why are emails going to spam?**
A: Common reasons:
- Sender domain not verified
- No SPF/DKIM records
- Using a free email service (Gmail) for bulk sending
- Solution: Use SendGrid with verified domain

**Q: Can I change the email template?**
A: Yes! Edit `server/src/services/emailService.js` → `sendPasswordResetEmail()`

**Q: How do I track email deliveries?**
A: Check SendGrid Activity Feed at https://app.sendgrid.com/activity

## Support Commands

```bash
# Test password reset (server side)
cd server
node test-password-reset.js user@example.com

# Check server logs (Render)
# Go to: https://dashboard.render.com → Your Service → Logs

# Clear expired tokens (cleanup)
# Run this in database:
DELETE FROM password_reset_tokens 
WHERE expires_at < CURRENT_TIMESTAMP OR used_at IS NOT NULL;

# Check pending reset tokens
SELECT 
  prt.*,
  u.email,
  u.first_name,
  u.last_name
FROM password_reset_tokens prt
JOIN users u ON prt.user_id = u.id
WHERE prt.used_at IS NULL 
  AND prt.expires_at > CURRENT_TIMESTAMP
ORDER BY prt.created_at DESC;
```

## Quick Setup Script (Run Once)

Add this to your .env and restart:

```bash
# Copy this entire block and add to Render Environment Variables

EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=[GET-FROM-SENDGRID]
EMAIL_FROM=noreply@trucklogistics.com
EMAIL_FROM_NAME=TruckLogistics
CLIENT_URL=https://trucklogistics.netlify.app
```

Then restart your server on Render!

---

**Still not working?** Check Render logs and SendGrid Activity Feed for specific error messages.
