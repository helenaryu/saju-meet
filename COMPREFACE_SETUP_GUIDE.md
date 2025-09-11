# CompreFace 1.2.0 Setup Guide for Saju Meet

This guide will help you set up CompreFace 1.2.0 to enable real facial analysis in your Saju Meet application.

## Prerequisites

### 1. Install Docker Desktop for Mac

1. Visit: https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Mac (choose Apple Silicon or Intel based on your Mac)
3. Install the .dmg file
4. Start Docker Desktop
5. Verify installation: `docker --version`

## Quick Setup

### 1. Run the Setup Script

```bash
# Make sure you're in the saju-meet directory
cd /Users/kakaogames/Desktop/skydecides/saju-meet

# Run the setup script
./setup-compreface.sh
```

### 2. Manual Setup (if script fails)

```bash
# Start CompreFace services
docker compose -f docker-compose.compreface.yml up -d

# Check status
docker compose -f docker-compose.compreface.yml ps
```

## Configuration

### 1. Access CompreFace Admin

1. Open http://localhost:8001 in your browser
2. Create an admin account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the API key

### 2. Update Environment Variables

Create or update your `.env.local` file:

```env
# CompreFace Configuration
NEXT_PUBLIC_COMPREFACE_URL=http://localhost:8000
NEXT_PUBLIC_COMPREFACE_API_KEY=your-actual-api-key-here
```

### 3. Restart Your Next.js Application

```bash
npm run dev
```

## Service URLs

After setup, these services will be available:

- **CompreFace API**: http://localhost:8000
- **CompreFace Admin**: http://localhost:8001  
- **CompreFace Frontend**: http://localhost:3001

## Verification

### 1. Check CompreFace Status

Visit http://localhost:8000/api/v1/health in your browser. You should see:
```json
{
  "status": "ok"
}
```

### 2. Test Facial Analysis

1. Go to your Saju Meet application
2. Upload a face image for analysis
3. Check the browser console for CompreFace logs
4. You should see: "✅ CompreFace 1.2.0 서버가 정상 작동 중"

## Troubleshooting

### Docker Issues

```bash
# Check Docker status
docker info

# Restart Docker Desktop if needed
# Check container logs
docker compose -f docker-compose.compreface.yml logs
```

### Port Conflicts

If ports 8000, 8001, or 3001 are in use:

1. Stop the conflicting services
2. Or modify `docker-compose.compreface.yml` to use different ports

### API Key Issues

1. Make sure the API key is correctly copied from CompreFace Admin
2. Check that `.env.local` is in the project root
3. Restart your Next.js development server

### Fallback System

If CompreFace is not working, the application will automatically use the fallback system. Check the console logs to see which system is being used.

## Stopping CompreFace

```bash
# Stop CompreFace services
docker compose -f docker-compose.compreface.yml down

# Stop and remove data
docker compose -f docker-compose.compreface.yml down -v
```

## Features Enabled

With CompreFace 1.2.0, your application will have:

- ✅ **Real facial detection** using AI
- ✅ **Accurate age estimation**
- ✅ **Gender recognition**
- ✅ **Facial landmarks** (468 points)
- ✅ **Pose analysis** (pitch, yaw, roll)
- ✅ **Mask detection**
- ✅ **High-quality face analysis** for 관상 (face reading)

## Next Steps

1. Test the facial analysis feature
2. Monitor performance and accuracy
3. Consider deploying CompreFace to a cloud service for production
4. Update your production environment variables

---

**Note**: The fallback system will continue to work if CompreFace is unavailable, ensuring your application remains functional.
