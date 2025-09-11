# 🚀 Saju Meet Setup Instructions

To get CompreFace and Claude analysis working with actual results (not dummy data), follow these steps:

## 1. Install Docker Desktop

**Required for CompreFace facial analysis:**

1. Visit: https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Mac
3. Install and start Docker Desktop
4. Verify: `docker --version` in terminal

## 2. Set up CompreFace

**Run the setup script:**
```bash
cd /Users/kakaogames/Desktop/skydecides/saju-meet
./setup-compreface.sh
```

**Or manually:**
```bash
docker compose -f docker-compose.compreface.yml up -d
```

## 3. Get CompreFace API Key

1. Open http://localhost:8001 in your browser
2. Create an admin account
3. Go to API Keys section
4. Generate a new API key
5. Copy the API key

## 4. Configure Environment Variables

**Update `.env.local` with your actual API keys:**

```bash
# CompreFace Configuration
NEXT_PUBLIC_COMPREFACE_URL=http://localhost:8000
NEXT_PUBLIC_COMPREFACE_API_KEY=your-actual-compreface-api-key

# Claude API (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# 서비스 설정
NEXT_PUBLIC_APP_URL=https://saju-meet.vercel.app
```

## 5. Get Claude API Key

1. Visit: https://console.anthropic.com/
2. Create an account
3. Generate an API key
4. Add to `.env.local` as `ANTHROPIC_API_KEY`

## 6. Test the Setup

**Start the development server:**
```bash
npm run dev
```

**Check the console for:**
- ✅ CompreFace 1.2.0 서버가 정상 작동 중
- ✅ Claude API 클라이언트 초기화 성공

## 7. Verify Real Analysis

1. Upload a face photo
2. Check that you get actual facial analysis results
3. Verify Korean physiognomy keywords are generated
4. Confirm Claude provides real personality insights

## Troubleshooting

**If CompreFace fails:**
- Check Docker is running: `docker ps`
- Verify CompreFace is up: `docker compose -f docker-compose.compreface.yml ps`
- Check API key in CompreFace admin panel

**If Claude fails:**
- Verify API key is correct
- Check API key has sufficient credits
- Ensure network connectivity

**If you see dummy data:**
- The fallback mechanisms have been removed
- Real analysis will only work with proper setup
- Check console logs for specific error messages

## What You'll Get

With proper setup, you'll receive:
- **Real facial analysis** using CompreFace 68-point landmarks
- **Korean physiognomy** interpretations
- **Claude AI insights** based on actual face data
- **No dummy data** - only real analysis results

---

**Note:** This setup requires Docker and API keys. Without them, the analysis will fail with clear error messages instead of showing dummy data.
