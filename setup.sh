#!/bin/bash

# Civigo - One-Command Setup for Hackathon Judges
# This script sets up the complete Civigo application stack

set -e

echo "🚀 Setting up Civigo for Hackathon Demo..."
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed and ready"

# Stop any existing containers
echo "🧹 Cleaning up any existing containers..."
docker-compose down -v 2>/dev/null || true

# Build and start all services
echo "🔨 Building and starting all services..."
echo "   This may take a few minutes on the first run..."

# Use docker compose if available, fallback to docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

$COMPOSE_CMD up -d --build

echo "⏳ Waiting for services to be ready..."

# Wait for database to be ready
echo "   - Waiting for database..."
until docker exec $(docker ps -qf "name=civigo-supabase-db") pg_isready -U supabase_admin &> /dev/null; do
    sleep 2
done

# Wait for API to be ready
echo "   - Waiting for API..."
until curl -s http://localhost:54321/health &> /dev/null; do
    sleep 2
done

# Wait for apps to be ready
echo "   - Waiting for applications..."
until curl -s http://localhost:3000 &> /dev/null; do
    sleep 2
done

until curl -s http://localhost:3001 &> /dev/null; do
    sleep 2
done

echo ""
echo "🎉 Civigo is now running!"
echo "========================"
echo ""
echo "📱 Citizen App:      http://localhost:3000"
echo "🏛️  Government Portal: http://localhost:3001"
echo "🗄️  Database Admin:   http://localhost:54323"
echo "📧 Email Testing:    http://localhost:8025"
echo ""
echo "Demo Accounts:"
echo "  Admin:   admin@demo.com / password123"
echo "  Officer: officer@demo.com / password123"
echo "  Citizen: citizen@demo.com / password123"
echo ""
echo "🔧 To stop all services: $COMPOSE_CMD down"
echo "🔄 To restart:           $COMPOSE_CMD up -d"
echo "📋 To view logs:         $COMPOSE_CMD logs -f"
echo ""
echo "Happy judging! 🚀"
