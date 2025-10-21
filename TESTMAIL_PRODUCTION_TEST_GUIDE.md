# Testing Production with Testmail.app (No SendGrid)

## Overview

You can use testmail.app's SMTP server to **test your production deployment** without SendGrid. This lets you verify password reset functionality works in production without dealing with sender verification.

## Setup for Production Testing

### Step 1: Get Testmail.app Credentials

1. Go to: https://testmail.app/
2. Sign up for free account
3. Get your credentials:
   - **Namespace**: e.g., `trucklogistics`
   - **API Key**: Found in dashboard
   - **SMTP Server**: `smtp.testmail.app`
   - **SMTP Port**: `587`

### Step 2: Update Render Environment Variables

Go to your Render dashboard and update these variables:

```env
# REMOVE SendGrid configuration:
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=SG.xxxxx

# ADD Testmail.app SMTP configuration:
EMAIL_HOST=smtp.testmail.app
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=trucklogistics@testmail.app
EMAIL_PASSWORD=your-testmail-api-key

# Email from address (can be anything)
EMAIL_FROM=noreply@trucklogistics.com
EMAIL_FROM_NAME=TruckLogistics

# Your frontend URL
CLIENT_URL=https://truck-logistics-mvp.vercel.app

# Other required vars
NODE_ENV=production
```

### Step 3: Restart Render Service

After updating environment variables, restart your Render service to apply changes.

### Step 4: Test with Testmail.app Email Addresses

#### Create Test User

1. Go to: https://truck-logistics-mvp.vercel.app/register
2. Sign up with testmail.app email:
   ```
   Email: customer1.trucklogistics@inbox.testmail.app
   Password: TestPass123!
   ```

#### Test Password Reset

1. Go to: https://truck-logistics-mvp.vercel.app/forgot-password
2. Enter: `customer1.trucklogistics@inbox.testmail.app`
3. Click "Send Reset Link"
4. Go to: https://testmail.app/inbox/trucklogistics
5. You'll see the password reset email immediately!
6. Click the reset link
7. Set new password
8. Verify you can login

## How It Works

```
Frontend (Vercel)
    ↓
    Requests password reset
    ↓
Backend (Render)
    ↓
    Uses testmail.app SMTP to send email
    ↓
Testmail.app SMTP Server
    ↓
    Delivers to customer1.trucklogistics@inbox.testmail.app
    ↓
View at: testmail.app/inbox/trucklogistics
```

## Complete Environment Variables for Testing

```env
# Database (keep your existing Supabase config)
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_KEY=...

# JWT (keep existing)
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d

# Testmail.app SMTP (NEW)
EMAIL_HOST=smtp.testmail.app
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=trucklogistics@testmail.app
EMAIL_PASSWORD=tm_xxxxxxxxxxxxxxxxxx

# Email Details
EMAIL_FROM=noreply@trucklogistics.com
EMAIL_FROM_NAME=TruckLogistics

# URLs
CLIENT_URL=https://truck-logistics-mvp.vercel.app
PORT=5000

# Environment
NODE_ENV=production

# File Upload (keep existing)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Test Email Address Format

Testmail.app email addresses follow this pattern:

```
<anything>.<your-namespace>@inbox.testmail.app

Examples:
- customer1.trucklogistics@inbox.testmail.app
- admin.trucklogistics@inbox.testmail.app
- test.trucklogistics@inbox.testmail.app
- provider.trucklogistics@inbox.testmail.app
```

All emails sent to addresses ending with `.trucklogistics@inbox.testmail.app` will appear in your inbox at `https://testmail.app/inbox/trucklogistics`

## Testing Checklist

- [ ] Testmail.app account created
- [ ] Namespace obtained (e.g., `trucklogistics`)
- [ ] API key copied
- [ ] Render environment variables updated with testmail.app SMTP
- [ ] Render service restarted
- [ ] Test user created with testmail.app email
- [ ] Password reset requested from production app
- [ ] Email visible in testmail.app inbox
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can login with new password

## Advantages for Testing

✅ **No sender verification** - Unlike SendGrid, no domain/email verification needed
✅ **Instant setup** - Takes 2-3 minutes
✅ **Immediate email viewing** - See emails in web interface instantly
✅ **Free** - Perfect for testing
✅ **Works exactly like production** - Tests entire email flow
✅ **No code changes** - Your existing code supports generic SMTP
✅ **Multiple test users** - Create unlimited test email addresses

## Verifying Email Service Configuration

Your code in `server/src/services/emailService.js` already supports this:

```javascript
// When EMAIL_SERVICE is not set (or not 'gmail'/'sendgrid')
// It uses generic SMTP configuration:

this.transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,        // smtp.testmail.app
  port: parseInt(process.env.EMAIL_PORT || '587'),  // 587
  secure: process.env.EMAIL_SECURE === 'true',      // false
  auth: {
    user: process.env.EMAIL_USER,      // trucklogistics@testmail.app
    pass: process.env.EMAIL_PASSWORD   // your API key
  }
});
```

No code changes needed! ✅

## Debugging

### Check Render Logs

If emails aren't sending, check Render logs for:

```bash
# Look for email sending confirmation
Email sent successfully to customer1.trucklogistics@inbox.testmail.app

# Or error messages
Error sending email: ...
```

### Verify Environment Variables

On Render dashboard, verify:
- `EMAIL_HOST` = `smtp.testmail.app`
- `EMAIL_PORT` = `587`
- `EMAIL_USER` = `yournamespace@testmail.app`
- `EMAIL_PASSWORD` = your API key (starts with `tm_`)
- `EMAIL_SERVICE` is NOT set (or removed)

### Test SMTP Connection

You can test the SMTP connection locally:

```javascript
// test-testmail-smtp.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.testmail.app',
  port: 587,
  secure: false,
  auth: {
    user: 'trucklogistics@testmail.app',
    pass: 'your-api-key'
  }
});

transporter.verify()
  .then(() => console.log('✅ SMTP connection successful'))
  .catch(err => console.error('❌ SMTP error:', err));
```

## Common Issues

### Issue: "Authentication failed"

**Cause**: Wrong credentials
**Solution**: 
- Verify `EMAIL_USER` is `yournamespace@testmail.app` (not just the namespace)
- Verify `EMAIL_PASSWORD` is your API key from testmail.app dashboard

### Issue: "Connection timeout"

**Cause**: Network/firewall issue
**Solution**:
- Verify Render allows outbound SMTP connections on port 587
- Check EMAIL_HOST is exactly `smtp.testmail.app`

### Issue: Email not showing in inbox

**Cause**: Wrong namespace or need to refresh
**Solution**:
- Verify inbox URL matches your namespace: `https://testmail.app/inbox/yournamespace`
- Wait a few seconds and refresh the page
- Check Render logs to confirm email was sent

## Switching to Production Email Service Later

When ready for real users, simply update Render environment variables:

### For SendGrid (after verification):
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=verified-email@domain.com

# Remove testmail.app vars:
# EMAIL_HOST=...
# EMAIL_USER=...
# EMAIL_PASSWORD=...
```

### For Gmail:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=korichiaymen27@gmail.com
EMAIL_PASSWORD=gmail-app-password
EMAIL_FROM=korichiaymen27@gmail.com

# Remove testmail.app vars:
# EMAIL_HOST=...
# EMAIL_USER=...
# EMAIL_PASSWORD=...
```

No code changes needed - restart service and it switches!

## API Testing (Optional)

Testmail.app also provides API to check emails programmatically:

```bash
# Get all emails in inbox
curl "https://api.testmail.app/api/json?apikey=YOUR_API_KEY&namespace=trucklogistics"

# Get emails for specific tag (email prefix)
curl "https://api.testmail.app/api/json?apikey=YOUR_API_KEY&namespace=trucklogistics&tag=customer1"
```

## Summary

**Testmail.app is perfect for testing production deployment!**

✅ Use it to verify password reset works in production
✅ No SendGrid verification needed
✅ See emails instantly in web interface
✅ Test complete production email flow
✅ Switch to real email service when ready

**Setup Time**: 2-3 minutes
**Cost**: Free
**Perfect For**: Testing, development, staging environments

---

## Quick Start

1. Sign up at https://testmail.app/
2. Get namespace and API key
3. Update Render env vars (use testmail.app SMTP)
4. Restart Render service
5. Create test user with `name.yournamespace@inbox.testmail.app`
6. Test password reset
7. View email at `https://testmail.app/inbox/yournamespace`
8. Done! ✅

Ready to test? 🚀
