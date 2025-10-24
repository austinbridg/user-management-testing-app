# Test Tracker Backend - Render Edition

A lightweight Node.js backend for the User and Group Management Test Tracker application, optimized for deployment on Render.

## 🌐 Quick Deploy to Render

### One-Click Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deploy
1. **Fork this repository** to your GitHub account
2. **Sign up at Render:** https://render.com
3. **Create Web Service:** Connect your GitHub repository
4. **Deploy:** Render automatically builds and deploys your app

## 🚀 Features

- ✅ **Render Optimized:** Configured specifically for Render deployment
- ✅ **Auto-Deploy:** Automatic deployments on code changes
- ✅ **Health Monitoring:** Built-in health check endpoint
- ✅ **HTTPS Included:** Secure connections out of the box
- ✅ **Free Tier:** Deploy for free with Render's free plan
- ✅ **Mobile Friendly:** Works on all devices
- ✅ **Team Sharing:** Share with colleagues instantly

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Node.js 18+ (for local development)

## 🛠️ Local Development

### Quick Start
```bash
# Clone the repository
git clone https://github.com/your-username/test-tracker-render.git
cd test-tracker-render

# Install dependencies
npm install

# Start development server
npm start

# Open in browser
open http://localhost:3000
```

### Development Mode
```bash
# Install nodemon for auto-restart
npm install -g nodemon

# Start with auto-restart
npm run dev
```

## 🔌 API Endpoints

### Core Data Endpoints
- **GET** `/api/data` - Get all test data
- **POST** `/api/data` - Save all test data

### Specific Data Endpoints
- **GET** `/api/tests` - Get test cases only
- **POST** `/api/tests` - Save test cases only
- **GET** `/api/users` - Get users and current user
- **POST** `/api/users` - Save users and current user

### Utility Endpoints
- **GET** `/api/health` - Health check endpoint
- **GET** `/` - Serve the frontend application

## 📊 Data Format

### Test Data Structure
```json
{
  "testCases": [
    {
      "id": "TC-001",
      "title": "Test Case Title",
      "story": "User Story",
      "category": "category-name",
      "priority": "High",
      "estimatedTime": "15 minutes",
      "prerequisites": ["Prerequisite 1"],
      "testSteps": ["Step 1", "Step 2"],
      "acceptanceCriteria": ["Criteria 1"],
      "statusGuidance": "Guidance text",
      "userResults": [
        {
          "tester": "User Name",
          "status": "pass",
          "date": "2024-01-15T10:30:00Z",
          "notes": "Test notes",
          "bugReport": {
            "description": "Bug description",
            "severity": "High"
          }
        }
      ],
      "consolidatedStatus": "pass"
    }
  ],
  "testUsers": [
    {
      "name": "User Name",
      "createdDate": "2024-01-15T10:30:00Z",
      "id": "unique-id"
    }
  ],
  "currentUser": "User Name",
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

## 🔧 Configuration

### Environment Variables
- **PORT** - Server port (Render sets this automatically)
- **NODE_ENV** - Environment mode (production on Render)
- **RENDER** - Automatically set by Render platform

### Render Configuration
The `render.yaml` file configures automatic deployment:
```yaml
services:
  - type: web
    name: test-tracker-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    autoDeploy: true
```

## 🚀 Deployment Options

### Option 1: Render (Recommended)
- **Free tier available**
- **Automatic HTTPS**
- **Auto-deploy on push**
- **Built-in monitoring**

### Option 2: Other Platforms
- **Railway:** See `RAILWAY.md`
- **Heroku:** See `HEROKU.md`
- **Vercel:** See `vercel.json`
- **Docker:** See `Dockerfile`

## 📱 Sharing with Team

### Render Deployment
1. **Deploy to Render** (see RENDER.md)
2. **Get public URL:** `https://your-app.onrender.com`
3. **Share URL** with team members
4. **Works everywhere:** No setup required

### Local Network Sharing
```bash
# Start server
npm start

# Find your IP
ifconfig | grep "inet "

# Share URL
http://YOUR_IP:3000
```

## 🔍 Monitoring & Health

### Health Check
- **Endpoint:** `/api/health`
- **Response:** JSON with status and timestamp
- **Monitoring:** Render automatically monitors this endpoint

### Logs
- **Render Dashboard:** View logs in real-time
- **Local Development:** Console output
- **Error Tracking:** Built-in error handling

## ⚠️ Important Notes

### Data Persistence
- **Free Tier:** Data is ephemeral (lost on restart)
- **Paid Tier:** Persistent storage available
- **Recommendation:** Use external database for production

### Performance
- **Free Tier:** Services sleep after 15 minutes of inactivity
- **Cold Start:** First request after sleep may be slower
- **Upgrade:** Consider paid plan for always-on service

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check package.json is in root
# Verify Node.js version compatibility
# Check all dependencies are listed
```

#### Runtime Errors
```bash
# Check Render logs
# Verify PORT environment variable
# Check file permissions
```

#### Health Check Failures
- Verify `/api/health` returns 200 status
- Check server startup logs
- Ensure PORT is properly set

### Debug Steps
1. **Check Build Logs:** Render dashboard → Build Logs
2. **Check Runtime Logs:** Render dashboard → Logs
3. **Test Health Endpoint:** Visit `/api/health`
4. **Verify Environment:** Check environment variables

## 📚 Documentation

- **RENDER.md** - Detailed Render deployment guide
- **API Documentation** - Complete API reference
- **Troubleshooting** - Common issues and solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

### Render Support
- **Documentation:** https://render.com/docs
- **Community:** https://render.com/community
- **Status:** https://status.render.com

### Application Support
- **Health Check:** `/api/health`
- **GitHub Issues:** Report bugs in repository
- **Logs:** Check Render dashboard logs

## 🎉 Success!

Your Test Tracker app is now ready for Render deployment!

**Next Steps:**
1. Deploy to Render using the guide in `RENDER.md`
2. Test all functionality
3. Share the URL with your team
4. Monitor performance and logs

**Remember:** Free tier services sleep after inactivity, so first access might be slower.
