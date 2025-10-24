# Render Deployment Guide

## 🚀 Deploy Test Tracker to Render

This guide will help you deploy the Test Tracker application to Render, a modern cloud platform that makes deployment simple and reliable.

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Your code pushed to a GitHub repository

## 🎯 Quick Deployment (5 minutes)

### Step 1: Prepare Your Repository
1. Push this code to a GitHub repository
2. Make sure all files are committed and pushed

### Step 2: Deploy on Render
1. **Sign up/Login:** Go to [render.com](https://render.com) and sign up
2. **New Web Service:** Click "New +" → "Web Service"
3. **Connect Repository:** Connect your GitHub account and select your repository
4. **Configure Service:**
   - **Name:** `test-tracker-backend` (or your preferred name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or choose paid plan for better performance)

### Step 3: Environment Variables
Add these environment variables in Render dashboard:
- `NODE_ENV` = `production`
- `PORT` = `3000` (Render sets this automatically)

### Step 4: Deploy
Click "Create Web Service" and Render will automatically:
- Install dependencies
- Build your application
- Deploy it with a public URL

## 🔧 Advanced Configuration

### Using render.yaml (Recommended)
This project includes a `render.yaml` file for automatic configuration:

```yaml
services:
  - type: web
    name: test-tracker-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
    healthCheckPath: /api/health
    autoDeploy: true
```

### Manual Configuration Options

#### Build Settings
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Node Version:** 18.x (recommended)

#### Environment Variables
- `NODE_ENV` = `production`
- `PORT` = `3000` (automatically set by Render)

#### Health Check
- **Health Check Path:** `/api/health`
- **Health Check Interval:** 30 seconds

## 📊 Render Features

### Automatic Deployments
- **Auto-deploy:** Enabled by default
- **Branch:** `main` or `master`
- **Deploy on push:** Yes

### Monitoring
- **Logs:** Available in Render dashboard
- **Metrics:** CPU, memory, and response time
- **Health checks:** Automatic monitoring

### Scaling
- **Free tier:** 750 hours/month
- **Paid tiers:** Always-on services
- **Auto-scaling:** Available on paid plans

## 🔍 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs in Render dashboard
# Common fixes:
- Ensure package.json is in root directory
- Check Node.js version compatibility
- Verify all dependencies are listed
```

#### Runtime Errors
```bash
# Check application logs
# Common issues:
- Port binding errors (use process.env.PORT)
- File system permissions
- Environment variable issues
```

#### Health Check Failures
- Verify `/api/health` endpoint responds with 200
- Check if server starts successfully
- Ensure PORT environment variable is set

### Debugging Steps

1. **Check Build Logs:**
   - Go to Render dashboard
   - Click on your service
   - View "Build Logs" tab

2. **Check Runtime Logs:**
   - Go to "Logs" tab
   - Look for error messages
   - Check startup sequence

3. **Test Health Endpoint:**
   - Visit `https://your-app.onrender.com/api/health`
   - Should return JSON with success: true

4. **Verify Environment:**
   - Check environment variables in dashboard
   - Ensure NODE_ENV is set to production

## 💡 Best Practices

### Performance Optimization
- **Use Free Tier Wisely:** Free services sleep after 15 minutes of inactivity
- **Optimize Dependencies:** Only include necessary packages
- **Enable Compression:** Use gzip compression for responses
- **Cache Static Files:** Serve static files efficiently

### Security
- **Environment Variables:** Never commit secrets to code
- **HTTPS:** Automatically provided by Render
- **CORS:** Configure appropriately for your domain
- **Input Validation:** Validate all API inputs

### Monitoring
- **Health Checks:** Monitor `/api/health` endpoint
- **Logs:** Regularly check application logs
- **Metrics:** Monitor performance metrics
- **Alerts:** Set up alerts for failures

## 🔄 Updates and Maintenance

### Updating Your App
1. **Push Changes:** Commit and push to your repository
2. **Auto-Deploy:** Render automatically deploys changes
3. **Monitor:** Watch deployment logs for issues

### Data Persistence
⚠️ **Important:** Render's free tier uses ephemeral storage
- Data is lost when service restarts
- Consider upgrading to paid plan for persistent storage
- Or implement external database (PostgreSQL, MongoDB)

### Backup Strategy
- **Code:** Always backed up in Git
- **Data:** Implement external storage for production
- **Configuration:** Document all environment variables

## 📱 Sharing Your App

Once deployed, you'll get a public URL like:
`https://your-app-name.onrender.com`

### Share with Colleagues
- **Public URL:** Works from anywhere
- **No Setup:** Just share the link
- **Mobile Friendly:** Works on all devices
- **HTTPS:** Secure connection included

## 🆘 Support

### Render Support
- **Documentation:** [render.com/docs](https://render.com/docs)
- **Community:** [render.com/community](https://render.com/community)
- **Status:** [status.render.com](https://status.render.com)

### Application Support
- **Health Check:** `/api/health`
- **Logs:** Available in Render dashboard
- **GitHub Issues:** Report bugs in repository

## 🎉 Success!

Your Test Tracker app is now live on Render! 

**Next Steps:**
1. Test all functionality
2. Share the URL with your team
3. Monitor performance and logs
4. Consider upgrading to paid plan for production use

**Remember:** Free tier services sleep after inactivity, so first access might be slower.
