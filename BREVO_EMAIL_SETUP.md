# Brevo (SendInBlue) Email Setup Guide

## Why Brevo?
- ✅ **300 emails/day FREE** (vs Elastic Email's 100)
- ✅ **No credit card required**
- ✅ **Better deliverability** (no SPF issues)
- ✅ **No test mode restrictions**
- ✅ **Professional templates**

## Step-by-Step Setup

### Step 1: Create Brevo Account

1. **Go to**: https://www.brevo.com/
2. **Click**: "Sign up free"
3. **Fill in**:
   - Email: `korichiaymen27@gmail.com`
   - Password: Create a strong password
   - Company: `TruckLogistics`
4. **Verify** your email (check Gmail)

### Step 2: Get SMTP Credentials

After email verification:

1. **Login to**: https://app.brevo.com/
2. **Go to**: Settings (top right) → SMTP & API
3. **Click**: "SMTP" tab
4. **You'll see**:
   ```
   Server: smtp-relay.brevo.com
   Port: 587
   Login: Your email (korichiaymen27@gmail.com)
   Password: Click "Create a new SMTP key"
   ```

5. **Create SMTP Key**:
   - Click "Create a new SMTP key"
   - Name it: `TruckLogistics-Production`
   - Copy the key immediately (you won't see it again!)

### Step 3: Configure Sender Email

1. **Go to**: Settings → Senders & IP
2. **Click**: "Add a sender"
3. **Enter**: `korichiaymen27@gmail.com`
4. **Verify**: Check Gmail for verification email
5. **Click** verification link
6. **Wait** for approval (usually instant)

### Step 4: Update Render Environment Variables

Go to your Render dashboard and **update** these variables:

```env
# Remove or comment out Elastic Email config
# EMAIL_HOST=smtp.elasticemail.com
# EMAIL_PORT=2525

# Add Brevo SMTP config
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=korichiaymen27@gmail.com
EMAIL_PASSWORD=your-brevo-smtp-key-here
EMAIL_FROM=korichiaymen27@gmail.com
EMAIL_FROM_NAME=TruckLogistics
CLIENT_URL=https://truck-logistics-mvp.vercel.app
```

### Step 5: Test

After Render redeploys:

1. Go to your email test page
2. Send a test email to `korichiaymen27@gmail.com`
3. Check your Gmail inbox (should arrive within seconds!)
4. Try forgot password functionality

## Brevo Advantages

### Free Tier Includes:
- ✅ 300 emails/day
- ✅ SMTP relay
- ✅ Email templates
- ✅ Real-time statistics
- ✅ 99% deliverability rate
- ✅ No SPF/DKIM issues

### Better Than Elastic Email:
- No test mode restrictions
- Better Gmail deliverability
- More daily emails (300 vs 100)
- Professional dashboard
- Better documentation

## Expected Results

After setup:
- ✅ Forgot password emails arrive in Gmail inbox
- ✅ No SPF bounces
- ✅ Fast delivery (under 10 seconds)
- ✅ Professional appearance
- ✅ Works with all email providers

## Troubleshooting

### Issue: Can't create SMTP key
**Solution**: Make sure your email is verified first

### Issue: Emails still bouncing
**Solution**: Make sure sender email is verified in Brevo

### Issue: Emails going to spam
**Solution**: 
- Add sender to Gmail contacts
- Mark as "Not spam" once
- Gmail will learn over time

## Monitoring

**Brevo Dashboard**: https://app.brevo.com/statistics/email
- See all sent emails
- Delivery rates
- Opens and clicks
- Bounce reasons

## Quick Comparison

| Feature | Elastic Email | Brevo |
|---------|--------------|-------|
| Free emails/day | 100 | 300 |
| Credit card required | No | No |
| Test mode limits | Yes ❌ | No ✅ |
| SPF issues | Yes ❌ | No ✅ |
| Gmail delivery | Poor ❌ | Excellent ✅ |
| Setup complexity | Medium | Easy |

## Next Steps

1. Create Brevo account
2. Get SMTP credentials
3. Update Render env vars
4. Test forgot password
5. Enjoy reliable email delivery! 🎉
