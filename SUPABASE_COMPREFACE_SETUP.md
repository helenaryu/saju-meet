# 🚀 Supabase + CompreFace Integration Setup

This guide shows you how to use Supabase for data storage while keeping CompreFace for facial analysis.

## 🏗️ Architecture Overview

```
User Uploads Photo → CompreFace (Face Analysis) → Supabase (Store Results) → Your App
```

**What each service does:**
- **CompreFace**: Real-time facial analysis, landmark detection, age/gender estimation
- **Supabase**: User authentication, data storage, analysis history, compatibility matching

## 📋 Prerequisites

- ✅ Supabase project set up
- ✅ CompreFace running locally or on cloud
- ✅ Environment variables configured

## 🔧 Step 1: Set Up Supabase Database

### 1.1 Run the Database Schema

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to SQL Editor**
4. **Copy and paste** the contents of `supabase-facial-analysis-schema.sql`
5. **Click "Run"** to create the tables

### 1.2 Verify Tables Created

You should see these tables:
- `facial_analyses` - Stores facial analysis results
- `compatibility_matches` - Stores compatibility scores
- `user_profiles` - Stores user preferences

## 🔑 Step 2: Configure Environment Variables

### 2.1 Update `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CompreFace Configuration
NEXT_PUBLIC_COMPREFACE_URL=http://localhost:8000
NEXT_PUBLIC_COMPREFACE_API_KEY=00000000-0000-0000-0000-000000000003

# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 2.2 Update Vercel Environment Variables

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**
3. **Go to Settings** → **Environment Variables**
4. **Add all the variables above**

## 🚀 Step 3: Deploy CompreFace to Cloud (Optional)

### Option A: Keep Local CompreFace
- ✅ Already working
- ❌ Only works on your machine
- ❌ Not accessible from production

### Option B: Deploy to Railway (Recommended)

1. **Go to Railway**: https://railway.app/
2. **Deploy from GitHub**: Select your repository
3. **Add PostgreSQL database**
4. **Deploy CompreFace** using the provided Docker files
5. **Get production URL** and update environment variables

### Option C: Deploy to Render

1. **Go to Render**: https://render.com/
2. **Create new Web Service**
3. **Use Docker deployment**
4. **Add PostgreSQL database**

## 🧪 Step 4: Test the Integration

### 4.1 Start Your Application

```bash
npm run dev
```

### 4.2 Test Facial Analysis

1. **Upload a photo** in your app
2. **Check browser console** for:
   - ✅ CompreFace analysis successful
   - ✅ Supabase save successful
3. **Check Supabase Dashboard** → **Table Editor** → **facial_analyses**

## 📊 Step 5: Verify Data Storage

### 5.1 Check Supabase Tables

1. **Go to Supabase Dashboard**
2. **Table Editor** → **facial_analyses**
3. **You should see**:
   - User ID
   - CompreFace data (landmarks, age, gender)
   - Mapped features (Korean physiognomy)
   - Claude analysis
   - Keywords array

### 5.2 Check Analysis History

The integration automatically saves:
- ✅ **Facial analysis results**
- ✅ **User authentication data**
- ✅ **Analysis timestamps**
- ✅ **Keywords for search**

## 🔍 Step 6: Advanced Features

### 6.1 Search by Keywords

```typescript
// Search for users with specific facial features
const results = await supabaseFacialAnalysisService.searchFacialAnalyses([
  '큰', '감성적', '외향적'
]);
```

### 6.2 Compatibility Matching

```typescript
// Find compatible users based on facial analysis
const compatibleUsers = await findCompatibleUsers(userId);
```

### 6.3 Analysis History

```typescript
// Get user's analysis history
const history = await supabaseFacialAnalysisService.getUserFacialAnalyses(userId);
```

## 🚨 Troubleshooting

### Common Issues

**1. Supabase Connection Failed**
```
Error: Supabase not available
```
**Solution**: Check environment variables in `.env.local`

**2. CompreFace Analysis Failed**
```
Error: CompreFace 서버가 사용 불가능합니다
```
**Solution**: Start CompreFace with `docker compose -f docker-compose.compreface.yml up -d`

**3. Database Schema Error**
```
Error: relation "facial_analyses" does not exist
```
**Solution**: Run the SQL schema in Supabase SQL Editor

**4. RLS Policy Error**
```
Error: new row violates row-level security policy
```
**Solution**: Check user authentication and RLS policies

## 📈 Benefits of This Setup

### ✅ **Real Facial Analysis**
- CompreFace provides accurate 68-point landmark detection
- Korean physiognomy analysis based on real data
- No dummy data or fallbacks

### ✅ **Scalable Data Storage**
- Supabase handles user data, authentication, and storage
- Automatic scaling and backups
- Real-time subscriptions

### ✅ **Cost Effective**
- CompreFace is free and open-source
- Supabase has generous free tier
- Only pay for what you use

### ✅ **Production Ready**
- Row Level Security (RLS) for data protection
- Automatic API generation
- Real-time updates

## 🎯 Next Steps

1. **Deploy CompreFace to cloud** (Railway/Render)
2. **Update production environment variables**
3. **Test with real users**
4. **Monitor Supabase usage**
5. **Add compatibility matching features**

---

**Your Supabase + CompreFace integration is now ready for production!** 🚀
