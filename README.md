# User Management Test Tracker

A comprehensive web application for tracking and managing user testing of User Management, Roles, and Groups functionality. Built with Node.js backend, SQLite database, and modern frontend components.

## 🎯 Purpose

This application enables teams to:
- **Track test case execution** across multiple testers
- **Manage user testing workflows** for User Management features
- **Generate comprehensive reports** on test progress and results
- **Collaborate on testing** with password-protected access
- **Maintain test case database** with automated migration tools

## 🌐 Quick Deploy to Render

### One-Click Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deploy
1. **Fork this repository** to your GitHub account
2. **Sign up at Render:** https://render.com
3. **Create Web Service:** Connect your GitHub repository
4. **Deploy:** Render automatically builds and deploys your app

## 🚀 Features

### Core Functionality
- ✅ **Test Case Management**: 35+ comprehensive test cases for User Management features
- ✅ **User Testing Tracking**: Multiple testers can execute and track test results
- ✅ **Real-time Progress**: Live updates on test completion and status
- ✅ **Test Result Management**: Edit, delete, and manage test results
- ✅ **Comprehensive Reporting**: Detailed test reports and statistics

### Technical Features
- ✅ **Database Backend**: SQLite database with automatic seeding
- ✅ **Password Protection**: Secure access with session management
- ✅ **Modern UI**: Responsive design with modal interactions
- ✅ **API Architecture**: RESTful API with organized endpoints
- ✅ **Migration System**: Automated test case updates from work directory

### Deployment Features
- ✅ **Render Optimized**: Configured specifically for Render deployment
- ✅ **Auto-Deploy**: Automatic deployments on code changes
- ✅ **Health Monitoring**: Built-in health check endpoint
- ✅ **HTTPS Included**: Secure connections out of the box
- ✅ **Free Tier**: Deploy for free with Render's free plan

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Node.js 18+ (for local development)

## 🛠️ Local Development

### Quick Start
```bash
# Clone the repository
git clone https://github.com/abridgforth/user-management-testing-app.git
cd user-management-testing-app

# Install dependencies
npm install

# Start development server
npm start

# Access the application
# Login page: http://localhost:3000/login
# Main app: http://localhost:3000/app
# Password: cursifyvertex2025
```

### Development Mode
```bash
# Start with auto-restart
npm run dev

# Database operations
npm run seed          # Seed test cases from work directory
npm run clear-tests   # Clear all test cases
npm run report        # Generate test report
```

### Project Structure
```
├── src/                    # Backend source code
│   ├── server.js          # Main server entry point
│   ├── models/            # Database models
│   └── utils/             # Utility functions
├── public/                # Frontend static files
│   ├── index.html         # Main application
│   ├── login.html         # Login page
│   └── js/                # Frontend modules
├── config/                # Configuration files
├── scripts/               # Utility scripts
├── docs/                  # Documentation
└── work/                  # Development files
```

## 🔌 API Endpoints

### Authentication
- **GET** `/login` - Login page
- **POST** `/api/login` - Authenticate user
- **POST** `/api/logout` - Logout user
- **GET** `/api/auth-status` - Check authentication status

### Test Management
- **GET** `/api/tests` - Get all test cases
- **GET** `/api/tests/:id` - Get specific test case
- **POST** `/api/tests` - Create new test case
- **PUT** `/api/tests/:id` - Update test case
- **DELETE** `/api/tests/:id` - Delete test case

### User Management
- **GET** `/api/users` - Get all users
- **POST** `/api/users` - Create new user
- **DELETE** `/api/users/:id` - Delete user

### Test Results
- **GET** `/api/test-results` - Get all test results
- **GET** `/api/tests/:id/results` - Get results for specific test
- **POST** `/api/test-results` - Create test result
- **PUT** `/api/test-results/:id` - Update test result
- **DELETE** `/api/test-results/:id` - Delete test result

### Statistics & Reports
- **GET** `/api/stats` - Get overall statistics
- **GET** `/api/users/:id/stats` - Get user-specific statistics

### Utility
- **GET** `/api/health` - Health check endpoint
- **GET** `/app` - Main application (requires authentication)

## 📊 Test Case Database

### Test Case Structure
The application includes 35+ comprehensive test cases covering:

- **User Management** (7 test cases): User invites, validation, organization association
- **Role Management** (4 test cases): Default roles, custom roles, permission assignment
- **Group Management** (2 test cases): Group creation and member management
- **Hierarchy Access** (2 test cases): Access parameters and scope picker
- **Authentication** (2 test cases): EIM authentication and token generation
- **Performance** (2 test cases): Access preview and search performance
- **Edge Cases** (2 test cases): No access states and orphan user management

### Database Schema
- **Tests Table**: Test case definitions with steps, criteria, and guidance
- **Users Table**: Tester information and management
- **Test Results Table**: Individual test execution results with bug reports

### Migration System
```bash
# Update test cases from work directory
npm run seed

# Seed from specific JavaScript file
npm run seed-js work/user-management-test-cases-app-format.js

# Seed from markdown documentation
npm run seed-md work/user-management-test-cases-comprehensive-docs.md

# Clear all test cases
npm run clear-tests

# Generate test report
npm run report
```

## 🔧 Configuration

### Environment Variables
- **PORT** - Server port (Render sets this automatically)
- **NODE_ENV** - Environment mode (production on Render)
- **APP_PASSWORD** - Application password (default: cursifyvertex2025)
- **SESSION_SECRET** - Session secret (auto-generated)

### Security Features
- **Password Protection**: Secure access with configurable password
- **Session Management**: Short-lived sessions (30 seconds) for security
- **Auto-logout**: Sessions expire on page refresh/close
- **HTTPS Ready**: Secure connections in production

### Render Configuration
The `config/render.yaml` file configures automatic deployment:
```yaml
services:
  - type: web
    name: test-tracker-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: APP_PASSWORD
        value: cursifyvertex2025
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
