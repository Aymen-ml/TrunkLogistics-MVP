# Vercel Deployment Guide for TrunkLogistics Frontend

## Why Vercel?
- **100GB bandwidth/month** (vs Netlify's 100GB)
- **6,000 build minutes/month**
- Unlimited deployments
- Excellent React/Vite support
- Global CDN
- Custom domains included

## Prerequisites
- GitHub account with your TrunkLogistics repository
- Vercel account (free)

## Step 1: Prepare Your Repository

1. Ensure your `client` folder contains your React/Vite app
2. Make sure you have a `package.json` in the client directory
3. Verify your build script works locally:
   ```bash
   cd client
   npm run build
   ```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub account

2. **Import Project**
   - Click "New Project"
   - Select your TrunkLogistics repository
   - Choose the `client` folder as root directory

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables**
   Add these environment variables:
   ```
   VITE_API_URL=https://trunklogistics-api.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Option B: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from client directory**
   ```bash
   cd client
   vercel
   ```

4. **Follow prompts**
   - Link to existing project or create new
   - Set build settings as above

## Step 3: Configure Custom Domain (Optional)

1. Go to your project dashboard on Vercel
2. Click "Domains" tab
3. Add your custom domain
4. Update DNS records as instructed

## Step 4: Update CORS Settings

After deployment, update your backend CORS settings to include the new Vercel domain:

```javascript
// In server/src/middleware/security.js
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL,
  'https://your-vercel-domain.vercel.app',  // Add your new Vercel domain
  'https://trucklogistics.netlify.app',     // Keep old domain if needed
  'https://trunklogistics-mvp.netlify.app'  // Keep old domain if needed
];
```

## Step 5: Test Deployment

1. Visit your new Vercel URL
2. Test login functionality
3. Verify all API calls work
4. Check that all features function correctly

## Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create pull requests

## Vercel vs Netlify Comparison

| Feature | Vercel Free | Netlify Free |
|---------|-------------|--------------|
| Bandwidth | 100GB/month | 100GB/month |
| Build Minutes | 6,000/month | 300/month |
| Deployments | Unlimited | Unlimited |
| Custom Domains | ✅ | ✅ |
| HTTPS | ✅ | ✅ |
| Git Integration | ✅ | ✅ |
| Edge Functions | Limited | Limited |

## Alternative Platforms

If Vercel doesn't meet your needs:

### GitHub Pages
- **Pros**: Completely free, unlimited bandwidth
- **Cons**: Static sites only, no server-side rendering
- **Best for**: Simple React apps

### Firebase Hosting
- **Pros**: Google infrastructure, good integration
- **Cons**: Lower bandwidth limits (360MB/day)
- **Best for**: Apps using other Google services

### Surge.sh
- **Pros**: Unlimited sites, very simple
- **Cons**: Basic features only
- **Best for**: Quick deployments

## Troubleshooting

### Build Fails
- Check that `package.json` is in the correct directory
- Verify build command works locally
- Check for missing dependencies

### API Calls Fail
- Verify VITE_API_URL environment variable
- Update CORS settings on backend
- Check network tab in browser dev tools

### 404 Errors on Refresh
- Add `vercel.json` configuration:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Migration Checklist

- [ ] Deploy to Vercel
- [ ] Test all functionality
- [ ] Update CORS settings
- [ ] Update any hardcoded URLs
- [ ] Configure custom domain (if needed)
- [ ] Update DNS records
- [ ] Monitor for issues
- [ ] Decommission old Netlify site (optional)

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
