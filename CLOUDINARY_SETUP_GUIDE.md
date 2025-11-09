# Cloudinary Setup Guide for TruckLogistics

## Why Cloudinary?

✅ **Perfect for your use case**:
- Handles both images AND documents
- Free tier: 25GB storage + 25GB bandwidth/month
- Built-in CDN for fast loading
- Automatic image optimization
- Easy integration

## Step 1: Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Get your credentials from dashboard:
   - Cloud Name
   - API Key  
   - API Secret

## Step 2: Install Dependencies

```bash
cd server
npm install cloudinary multer-storage-cloudinary
```

## Step 3: Add Environment Variables

Add to your Render environment variables:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## Step 4: File Storage Structure

Your files will be organized in Cloudinary like this:

```
trucklogistics/ (your cloud name)
├── trucks/
│   ├── images/
│   │   ├── truck_image_1695123456789_abc123.jpg
│   │   ├── truck_image_1695123456790_def456.png
│   │   └── truck_image_1695123456791_ghi789.webp
│   └── documents/
│       ├── truck_doc_1695123456792_jkl012.pdf
│       ├── truck_doc_1695123456793_mno345.pdf
│       └── truck_doc_1695123456794_pqr678.docx
```

## Step 5: Implementation Plan

### Phase 1: Setup (30 minutes)
1. ✅ Create Cloudinary account
2. ✅ Add environment variables to Render
3. ✅ Install npm packages

### Phase 2: Update Code (1 hour)
1. Update truck controller to use Cloudinary upload
2. Modify file processing logic
3. Update database to store Cloudinary URLs

### Phase 3: Testing (30 minutes)
1. Test image uploads
2. Test document uploads
3. Verify files persist after deployment

## Benefits After Implementation

### ✅ Persistent Storage
- Files survive server restarts
- Files survive deployments
- Professional file management

### ✅ Performance
- Global CDN delivery
- Automatic image optimization
- Fast loading times worldwide

### ✅ Features
- Automatic format conversion (WebP for modern browsers)
- Image resizing and cropping
- Secure direct uploads from frontend
- Built-in backup and redundancy

### ✅ Cost Effective
- Free tier covers small to medium apps
- Pay only for what you use
- No upfront costs

## File URLs After Implementation

Instead of:
```
❌ https://api.movelinker.com/uploads/trucks/images/file.jpg
```

You'll get:
```
✅ https://res.cloudinary.com/your-cloud/image/upload/v1695123456/trucklogistics/trucks/images/truck_image_abc123.jpg
```

## Migration Strategy

1. **Keep existing local storage as fallback**
2. **New uploads go to Cloudinary**
3. **Gradually migrate existing files**
4. **Update database URLs**

## Next Steps

Would you like me to:
1. **Set up Cloudinary integration** (recommended)
2. **Create migration script** for existing files
3. **Update truck controller** to use cloud storage
4. **Test the implementation**

Let me know and I'll implement the cloud storage solution!
