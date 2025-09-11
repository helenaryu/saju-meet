# CompreFace Cloud Deployment Guide

## Option 1: Deploy CompreFace to Railway (Recommended)

Railway is perfect for CompreFace deployment with automatic scaling and easy setup.

### 1. Create Railway Account
- Visit: https://railway.app/
- Sign up with GitHub
- Connect your repository

### 2. Deploy CompreFace
- Create new project
- Add PostgreSQL database
- Deploy CompreFace using Docker

### 3. Get Production URLs
- Railway will provide public URLs
- Update your Vercel environment variables

## Option 2: Deploy to Render

### 1. Create Render Account
- Visit: https://render.com/
- Sign up with GitHub

### 2. Deploy CompreFace
- Create new Web Service
- Use Docker deployment
- Add PostgreSQL database

## Option 3: Deploy to DigitalOcean App Platform

### 1. Create DigitalOcean Account
- Visit: https://cloud.digitalocean.com/
- Sign up

### 2. Deploy CompreFace
- Create new App
- Use Docker deployment
- Add managed database

## Environment Variables for Production

Once deployed, update your Vercel environment variables:

```
NEXT_PUBLIC_COMPREFACE_URL=https://your-compreface-domain.com
NEXT_PUBLIC_COMPREFACE_API_KEY=your-production-api-key
```

## Quick Start with Railway (Recommended)

1. Go to https://railway.app/
2. Click "Deploy from GitHub"
3. Select your repository
4. Add PostgreSQL service
5. Deploy CompreFace Docker container
6. Get the public URL
7. Update Vercel environment variables
