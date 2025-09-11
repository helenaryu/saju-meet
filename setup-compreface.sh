#!/bin/bash

# CompreFace 1.2.0 Setup Script for Saju Meet
echo "🚀 Setting up CompreFace 1.2.0 for Saju Meet..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop for Mac first:"
    echo "   https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is installed and running"

# Stop any existing CompreFace containers
echo "🛑 Stopping existing CompreFace containers..."
docker compose -f docker-compose.compreface.yml down

# Start CompreFace services
echo "🐳 Starting CompreFace 1.2.0 services..."
docker compose -f docker-compose.compreface.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker compose -f docker-compose.compreface.yml ps

echo ""
echo "🎉 CompreFace 1.2.0 is now running!"
echo ""
echo "📋 Service URLs:"
echo "   • CompreFace API: http://localhost:8000"
echo "   • CompreFace Admin: http://localhost:8001"
echo "   • CompreFace Frontend: http://localhost:3001"
echo ""
echo "🔑 Next steps:"
echo "   1. Open http://localhost:8001 in your browser"
echo "   2. Create an admin account"
echo "   3. Generate an API key"
echo "   4. Update your .env.local file with the API key"
echo ""
echo "📝 Add these to your .env.local file:"
echo "   NEXT_PUBLIC_COMPREFACE_URL=http://localhost:8000"
echo "   NEXT_PUBLIC_COMPREFACE_API_KEY=your-api-key-here"
echo ""
echo "✨ Your Saju Meet app will now use real CompreFace analysis!"
