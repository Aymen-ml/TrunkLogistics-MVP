# Netlify Deployment Guide - New Account

## Quick Setup Steps

### 1. Create New Netlify Account
- Go to https://netlify.com
- Sign up with a different email or OAuth provider
- Verify your email if required

### 2. Connect Repository
- Click "Add new site" → "Import an existing project"
- Choose GitHub (or your git provider)
- Select your repository: `TrunkLogistics-MVP`

### 3. Build Settings
```
Base directory: client
Build command: npm run build
Publish directory: dist
```

### 4. Environment Variables
Go to Site settings → Environment variables → Add:
```
VITE_API_URL = https://trunklogistics-api.onrender.com
```

### 5. Deploy
- Click "Deploy site"
- Wait for build to complete
- Your new URL will be generated

## Important Notes

- Your backend API (Render) doesn't need to change
- All your recent updates are already in the GitHub repo
- The new deployment will have all the latest features:
  ✅ Driver information fields
  ✅ Company location details
  ✅ Customer truck details access
  ✅ Business transparency

## Testing Checklist

After deployment, test:
1. Customer login and truck search
2. Click "View Details" on trucks
3. Provider truck creation with driver info
4. All business information visibility

## Free Tier Limits (New Account)
- 100GB bandwidth per month
- 300 build minutes per month
- Should be plenty for testing phase
