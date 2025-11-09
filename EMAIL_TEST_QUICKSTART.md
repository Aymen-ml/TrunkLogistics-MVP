# 🚀 Quick Start - Testing noreply@movelinker.com

## Step 1: Update Email Configuration (Choose One Method)

### Method A: Automatic Update (Recommended)
```bash
./update-email-config.sh
```
This interactive script will help you configure your email service.

### Method B: Manual Update
Edit `server/.env` and update:

```bash
# For Resend (Current Setup)
EMAIL_SERVICE=resend
EMAIL_FROM=noreply@movelinker.com
EMAIL_FROM_NAME=TruckLogistics
RESEND_API_KEY=your_api_key_here

# OR for SendGrid
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=noreply@movelinker.com
EMAIL_FROM_NAME=TruckLogistics

# OR for Custom SMTP
EMAIL_SERVICE=smtp
EMAIL_HOST=mail.movelinker.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@movelinker.com
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@movelinker.com
EMAIL_FROM_NAME=TruckLogistics
```

## Step 2: Verify Domain (Important!)

### For Resend:
1. Go to https://resend.com/domains
2. Add domain: `movelinker.com`
3. Add DNS records shown by Resend to your domain
4. Wait for verification (usually 5-10 minutes)

### For SendGrid:
1. Go to https://app.sendgrid.com/settings/sender_auth
2. Verify sender: `noreply@movelinker.com`
3. Or authenticate entire domain (recommended)

### For Custom SMTP:
1. Ensure email account `noreply@movelinker.com` exists
2. Configure SPF, DKIM, DMARC records (see CUSTOM_EMAIL_SETUP.md)

## Step 3: Run Test

```bash
# Test with your email
node test-custom-email.js your-email@example.com

# Or use default
node test-custom-email.js
```

## Expected Output

```
🔧 TruckLogistics - Custom Email Test

========================================
Testing: noreply@movelinker.com
========================================

1️⃣  Checking environment configuration...
✅ Email sender correctly set to noreply@movelinker.com
✅ Email service initialized successfully

2️⃣  Sending test email...
✅ Test email sent successfully!

3️⃣  Additional Email Templates Test...
✅ Password reset email sent
✅ Welcome email sent

🎊 ALL EMAIL TESTS COMPLETED SUCCESSFULLY!
```

## Step 4: Check Your Inbox

You should receive 3 test emails:
1. ✅ Custom Email Test (HTML formatted)
2. 📧 Password Reset Test
3. 👋 Welcome Email Test

## Troubleshooting

### Email not arriving?
1. Check spam folder
2. Verify domain is authenticated
3. Check server logs for errors
4. Run: `grep -i "email" server/logs/*.log`

### Authentication Error?
1. Verify API key is correct
2. Check domain is verified in email service dashboard
3. Ensure FROM email matches verified sender

### Need Help?
See `CUSTOM_EMAIL_SETUP.md` for detailed troubleshooting guide.

## Production Deployment

After testing locally, update production environment variables on your hosting platform (Render/Railway/Vercel):

```bash
EMAIL_SERVICE=resend
EMAIL_FROM=noreply@movelinker.com
EMAIL_FROM_NAME=TruckLogistics
RESEND_API_KEY=re_your_production_key
```

---

**Quick Commands:**
- Update config: `./update-email-config.sh`
- Test email: `node test-custom-email.js your@email.com`
- View guide: `cat CUSTOM_EMAIL_SETUP.md`
