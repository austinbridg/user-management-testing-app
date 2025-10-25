#!/bin/bash

# Deploy to Render - Test Tracker App
echo "🚀 Preparing for Render deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please ensure the Render configuration file exists."
    exit 1
fi

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Please ensure the main server file exists."
    exit 1
fi

# Check if public directory exists
if [ ! -d "public" ]; then
    echo "❌ Error: public directory not found. Please ensure the frontend files are in the public directory."
    exit 1
fi

echo "✅ All required files found!"

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node --version)
echo "Node.js version: $node_version"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Test the server locally (optional)
echo "🧪 Testing server startup..."
node server.js &
server_pid=$!
sleep 3

if kill -0 $server_pid 2>/dev/null; then
    echo "✅ Server starts successfully"
    kill $server_pid
else
    echo "❌ Server failed to start. Please check for errors."
    exit 1
fi

echo ""
echo "🎉 Ready for Render deployment!"
echo ""
echo "📋 Deployment checklist:"
echo "  ✅ package.json configured"
echo "  ✅ render.yaml configured"
echo "  ✅ server.js exists"
echo "  ✅ public/ directory exists"
echo "  ✅ Dependencies installed"
echo "  ✅ Server starts successfully"
echo ""
echo "🔗 Next steps:"
echo "  1. Push your code to GitHub"
echo "  2. Connect your GitHub repo to Render"
echo "  3. Render will automatically detect the render.yaml configuration"
echo "  4. The app will be deployed with password: GoodbyeVertex2025"
echo ""
echo "🌐 Your app will be available at: https://your-app-name.onrender.com"
echo "🔐 Login with password: GoodbyeVertex2025"