# 🚀 TrunkLogistics Deployment Configuration

## 📊 **Your Deployment Details**

### **Database (Supabase)**
- **Host**: `db.drqkwioicbcihakxgsoe.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Connection String**: `postgresql://postgres:[YOUR-PASSWORD]@db.drqkwioicbcihakxgsoe.supabase.co:5432/postgres`

### **JWT Secret (Generated)**
```
bfaa828f8e267b7c29d4f45764b975142d4415640b1979af7b41d22e831044cb
```

---

## 🔧 **Step-by-Step Deployment**

### **1. Run Database Migrations**
```bash
node deploy-migrations.js "postgresql://postgres:[YOUR-PASSWORD]@db.drqkwioicbcihakxgsoe.supabase.co:5432/postgres"
```

### **2. Deploy Backend to Render**
1. Go to [render.com](https://render.com)
2. Create new **Web Service**
3. Connect GitHub repository: `TrunkLogistics-MVP`
4. Configure:
   - **Name**: `trunklogistics-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. **Environment Variables** (copy from `render-env-variables.txt`):
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=db.drqkwioicbcihakxgsoe.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=[YOUR-SUPABASE-PASSWORD]
   DATABASE_URL=postgresql://postgres:[YOUR-SUPABASE-PASSWORD]@db.drqkwioicbcihakxgsoe.supabase.co:5432/postgres
   JWT_SECRET=bfaa828f8e267b7c29d4f45764b975142d4415640b1979af7b41d22e831044cb
   JWT_EXPIRE=30d
   CLIENT_URL=https://[YOUR-NETLIFY-DOMAIN].netlify.app
   FRONTEND_URL=https://[YOUR-NETLIFY-DOMAIN].netlify.app
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5242880
   LOG_LEVEL=info
   ```

### **3. Deploy Frontend to Netlify**
1. Go to [netlify.com](https://netlify.com)
2. **Import from Git** → Select `TrunkLogistics-MVP`
3. Build settings (auto-detected from `netlify.toml`):
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://[YOUR-RENDER-SERVICE].onrender.com/api
   VITE_APP_NAME=TrunkLogistics
   VITE_APP_VERSION=1.0.0
   ```

### **4. Update Cross-References**
After both deployments:
1. Update `CLIENT_URL` and `FRONTEND_URL` in Render with your Netlify URL
2. Update `VITE_API_URL` in Netlify with your Render URL
3. Trigger redeployments

---

## ✅ **Deployment Checklist**

- [ ] Run database migrations on Supabase
- [ ] Deploy backend to Render with environment variables
- [ ] Deploy frontend to Netlify with environment variables
- [ ] Update cross-reference URLs
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Test booking system

---

## 🔗 **Expected URLs**
- **Frontend**: `https://[your-site-name].netlify.app`
- **Backend**: `https://[your-service-name].onrender.com`
- **API Health Check**: `https://[your-service-name].onrender.com/api/health`

---

## 🆘 **Troubleshooting**

### **Database Connection Issues**
- Verify Supabase password is correct
- Check if migrations ran successfully
- Ensure Supabase project is active

### **CORS Errors**
- Update `CLIENT_URL` in Render environment variables
- Redeploy backend after updating URLs

### **Build Failures**
- Check build logs in Render/Netlify dashboards
- Verify environment variables are set correctly
- Ensure Node.js version compatibility (18+)
