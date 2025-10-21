# Forgot Password - Email Configuration Checklist

## Current Issue
Forgot password not working despite Render email configuration.

## Required Environment Variables on Render

Make sure ALL these variables are set in Render:

```env
# SMTP Configuration (Elastic Email)
EMAIL_HOST=smtp.elasticemail.com
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=korichiaymen27@gmail.com
EMAIL_PASSWORD=your-elastic-email-api-key

# Email Sender Info
EMAIL_FROM=korichiaymen27@gmail.com
EMAIL_FROM_NAME=TrunkLogistics

# Frontend URL (for reset links)
CLIENT_URL=https://truck-logistics-mvp.vercel.app

# Optional but helpful for debugging
NODE_ENV=production
```

## Common Issues & Solutions

### Issue 1: Missing EMAIL_USER
**Symptom:** "Failed to send reset email"
**Solution:** Add `EMAIL_USER=korichiaymen27@gmail.com` to Render

### Issue 2: EMAIL_SECURE incorrectly set
**Symptom:** Connection timeout
**Solution:** Make sure `EMAIL_SECURE=false` (NOT true, Elastic Email uses STARTTLS on port 2525)

### Issue 3: Wrong EMAIL_PASSWORD
**Symptom:** Authentication failed
**Solution:** 
- Go to Elastic Email dashboard
- Settings → SMTP/API
- Copy your API Key (NOT your account password)
- Use the API Key as EMAIL_PASSWORD

### Issue 4: Sender email not verified
**Symptom:** Emails rejected by Elastic Email
**Solution:**
- Go to Elastic Email → Settings → Manage Senders
- Make sure your sender email has a green checkmark ✅

### Issue 5: CLIENT_URL incorrect
**Symptom:** Reset link points to wrong URL
**Solution:** Set `CLIENT_URL=https://truck-logistics-mvp.vercel.app` (no trailing slash)

## How to Debug on Render

1. **Check Render Logs:**
   - Go to your Render dashboard
   - Click on your service
   - Click "Logs" tab
   - Look for these messages:

   **Success:**
   ```
   Initializing email service...
   Default SMTP email service configured
   Email service initialized successfully
   Password reset email sent to: [email]
   ```

   **Failure:**
   ```
   Failed to initialize email service
   Email service not configured, skipping email send
   Failed to send email to [email]
   ```

2. **Test the forgot password endpoint:**
   ```bash
   curl -X POST https://your-render-url.onrender.com/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"korichiaymen27@gmail.com"}'
   ```

   **Expected Response:**
   ```json
   {
     "success": true,
     "message": "If an account with that email exists, we have sent a password reset link."
   }
   ```

## Quick Fix Steps

1. **Go to Render Dashboard**
2. **Click your service** → Environment
3. **Verify these variables exist:**
   - ✅ EMAIL_HOST
   - ✅ EMAIL_PORT
   - ✅ EMAIL_SECURE (set to `false`)
   - ✅ EMAIL_USER (your email)
   - ✅ EMAIL_PASSWORD (your API key)
   - ✅ EMAIL_FROM
   - ✅ CLIENT_URL

4. **If any are missing, add them:**
   - Click "Add Environment Variable"
   - Enter Key and Value
   - Click "Save Changes"

5. **Render will auto-redeploy** (~2 minutes)

6. **Check logs** for "Email service initialized successfully"

7. **Test forgot password** on your frontend

## Verify Elastic Email Account

1. **Login to:** https://elasticemail.com
2. **Check sender status:**
   - Settings → Manage Senders
   - Your email should have ✅ green checkmark
3. **Check API key:**
   - Settings → SMTP/API
   - Make sure your API key has "SMTP" permission
4. **Check quota:**
   - Reports → Should show available emails (100/day free)

## Alternative: Add Better Error Logging

If still not working, we can add more detailed error logging to help debug.

Would you like me to:
1. Add more detailed logging to the email service?
2. Create a test endpoint to verify email configuration?
3. Add email service health check on startup?
