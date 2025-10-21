# Cloud Storage Implementation Guide

## Current vs Recommended Storage

### ❌ Current (Problematic)
```
Local Filesystem (Ephemeral)
server/uploads/trucks/images/     → Gets deleted on restart
server/uploads/trucks/documents/  → Gets deleted on restart
```

### ✅ Recommended Solutions

## Option 1: AWS S3 (Most Popular)

### Setup
```bash
npm install aws-sdk multer-s3
```

### Environment Variables
```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=trucklogistics-files
```

### File Structure in S3
```
trucklogistics-files/
├── trucks/
│   ├── images/
│   │   ├── 550e8400-e29b-41d4-a716-446655440000.jpg
│   │   └── 6ba7b810-9dad-11d1-80b4-00c04fd430c8.png
│   └── documents/
│       ├── 6ba7b811-9dad-11d1-80b4-00c04fd430c8.pdf
│       └── 550e8401-e29b-41d4-a716-446655440001.pdf
└── temp/
```

### Cost: ~$0.023/GB/month + minimal transfer costs

## Option 2: Cloudinary (Great for Images)

### Setup
```bash
npm install cloudinary multer-storage-cloudinary
```

### Environment Variables
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Features
- Automatic image optimization
- Multiple format support
- Built-in CDN
- Image transformations (resize, crop, etc.)

### Free Tier: 25GB storage, 25GB bandwidth/month

## Option 3: Supabase Storage (Integrated with your DB)

### Setup
```bash
npm install @supabase/storage-js
```

### Environment Variables
```env
SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1
SUPABASE_ANON_KEY=your_anon_key
```

### Benefits
- Integrated with your existing Supabase database
- Built-in authentication
- Automatic backups

## Implementation Priority

### Immediate (Recommended): Cloudinary
- Easy setup
- Great for images
- Good free tier
- Handles both images and documents

### Long-term: AWS S3
- Most scalable
- Industry standard
- Lowest costs at scale
- Maximum flexibility
