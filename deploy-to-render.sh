#!/bin/bash

# Test Tracker Render Deployment Helper
# This script helps you prepare and deploy to Render

echo "🚀 Test Tracker Render Deployment Helper"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found. Please ensure this is the Render-optimized version."
    exit 1
fi

echo "✅ Project files found"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
    echo "✅ Git repository initialized"
    echo ""
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Update for Render deployment"
    echo "✅ Changes committed"
    echo ""
fi

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please set up your GitHub repository:"
    echo "   git remote add origin https://github.com/your-username/your-repo.git"
    echo "   git push -u origin main"
    echo ""
    echo "Then deploy on Render:"
    echo "   1. Go to https://render.com"
    echo "   2. Create new Web Service"
    echo "   3. Connect your GitHub repository"
    echo "   4. Deploy!"
    echo ""
else
    echo "🌐 Pushing to GitHub..."
    git push origin main
    echo "✅ Code pushed to GitHub"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Go to https://render.com"
    echo "   2. Create new Web Service"
    echo "   3. Connect your GitHub repository"
    echo "   4. Deploy!"
    echo ""
fi

echo "📋 Deployment Checklist:"
echo "✅ Project files ready"
echo "✅ Git repository initialized"
echo "✅ Changes committed"
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Code pushed to GitHub"
else
    echo "⚠️  Set up GitHub remote repository"
fi
echo ""

echo "🔧 Render Configuration:"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Health Check: /api/health"
echo "   - Environment: NODE_ENV=production"
echo ""

echo "📖 For detailed instructions, see RENDER.md"
echo "🎉 Ready for Render deployment!"
