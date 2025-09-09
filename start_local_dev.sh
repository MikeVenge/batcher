#!/bin/bash
# Local development startup script for frontend

echo "🚀 Starting local frontend development environment..."

# Set local development environment variables
export NODE_ENV=development
export BACKEND_URL=http://localhost:8080

echo "📊 Configuration:"
echo "  - Environment: $NODE_ENV"
echo "  - Backend URL: $BACKEND_URL"
echo "  - Frontend: http://localhost:3000"
echo ""

echo "🌐 Starting Next.js development server..."
echo "Make sure your backend is running on port 8080!"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the Next.js development server
npm run dev
