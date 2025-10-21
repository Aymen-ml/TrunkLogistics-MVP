# Resend Email Setup - Fastest & Easiest!

## ⚡ Why Resend?
- ✅ **100 emails/day FREE** forever
- ✅ **No credit card required**
- ✅ **Best deliverability** (99.9%)
- ✅ **1-minute setup**
- ✅ **Used by Vercel, Linear, Supabase**
- ✅ **No sender verification needed** for testing

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Account (1 minute)

1. **Go to**: https://resend.com/signup
2. **Sign up** with:
   - GitHub (fastest), OR
   - Email: korichiaymen27@gmail.com
3. **Verify email** if using email signup

### Step 2: Get API Key (30 seconds)

1. After login, you'll see the dashboard
2. Click **"API Keys"** in sidebar
3. Click **"Create API Key"**
4. Name: `TrunkLogistics`
5. **Copy the API key** (starts with `re_`)
   - ⚠️ Save it immediately, you won't see it again!

### Step 3: Update Render Environment Variables (2 minutes)

Go to Render → Your Service → Environment

**Remove these old variables:**
```
EMAIL_HOST (delete)
EMAIL_PORT (delete)
EMAIL_SECURE (delete)
EMAIL_USER (delete)
EMAIL_PASSWORD (delete)
```

**Add these new variables:**
```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=TrunkLogistics
CLIENT_URL=https://truck-logistics-mvp.vercel.app
```

**Important Notes:**
- `EMAIL_FROM` must be `onboarding@resend.dev` for free tier
- Later you can add your own domain for custom emails

### Step 4: Wait for Render to Redeploy (1 minute)

Render will automatically redeploy when you save environment variables.

### Step 5: Test! (30 seconds)

1. Go to: https://truck-logistics-mvp.vercel.app/admin/email-test
2. Send test email to: `korichiaymen27@gmail.com`
3. Check your Gmail inbox - email arrives in **seconds**!
4. Try forgot password - it works! 🎉

## 📧 What You Get

### Free Tier Includes:
- ✅ 100 emails per day
- ✅ 99.9% deliverability
- ✅ Real-time analytics
- ✅ Email logs (7 days)
- ✅ API and SMTP support
- ✅ No setup complexity

### Emails Will Come From:
- **From:** TrunkLogistics <onboarding@resend.dev>
- **Reply-to:** You can set your own email
- **Look:** Professional and trusted

### Later: Add Your Own Domain (Optional)

When you're ready for custom emails like `noreply@trunklogistics.com`:

1. Add domain in Resend dashboard
2. Add DNS records (SPF, DKIM)
3. Verify domain
4. Update `EMAIL_FROM` to your custom email

## 🎯 Why Resend Over Others?

| Feature | Resend | Elastic Email | Brevo |
|---------|--------|---------------|-------|
| Free emails/day | 100 | 100 (test mode) | 300 |
| Setup time | 1 min | 10 min | 5 min |
| Credit card | No | No | No |
| Deliverability | 99.9% ✅ | Poor ❌ | Good ✓ |
| SPF issues | No ✅ | Yes ❌ | No ✅ |
| Test restrictions | No ✅ | Yes ❌ | No ✅ |
| Developer-friendly | Best ✅ | Poor | Good |
| Used by pros | Yes ✅ | No | Yes |

## 🔍 Monitoring Emails

**Resend Dashboard**: https://resend.com/emails

You can see:
- All sent emails
- Delivery status (delivered, bounced, spam)
- Opens and clicks
- Exact timestamps
- Error messages if any

## 🐛 Troubleshooting

### Issue: "API key is invalid"
**Solution**: Make sure you copied the full key starting with `re_`

### Issue: "Invalid from email"
**Solution**: Use `onboarding@resend.dev` for free tier. Custom domains need verification.

### Issue: Emails not arriving
**Solution**: 
1. Check Resend dashboard for delivery status
2. Check spam folder
3. Try different email address

## ✨ Expected Result

After setup:
```
User clicks "Forgot Password"
  ↓
Email sent via Resend API (< 1 second)
  ↓
Gmail receives email (< 5 seconds)
  ↓
User gets password reset link
  ↓
Success! 🎉
```

## 📝 Complete Render Config

Here's what your Render environment variables should look like:

```env
# Database (keep existing)
DATABASE_URL=postgresql://...

# Server
NODE_ENV=production
PORT=10000

# JWT (keep existing)
JWT_SECRET=your_jwt_secret

# Frontend
CLIENT_URL=https://truck-logistics-mvp.vercel.app

# Email - Resend
EMAIL_SERVICE=resend
RESEND_API_KEY=re_abc123xyz789...
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=TrunkLogistics

# Cloudinary (keep existing)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 🎉 That's It!

Simplest email setup possible. No SMTP ports, no authentication issues, no SPF problems. Just works! ✨
