# Test Tracker - Render Deployment Guide

## 🚀 Quick Deploy to Render

This Node.js application is configured for easy deployment to Render without requiring a Dockerfile.

### Prerequisites

- GitHub repository with your code
- Render account (free tier available)

### Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/login with your GitHub account
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure the service**
   - Render will automatically detect the `render.yaml` configuration
   - The service will be configured with:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Node.js
     - **Plan**: Free

4. **Environment Variables**
   The following environment variables are automatically configured:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `APP_PASSWORD=GoodbyeVertex2025`

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your application
   - Your app will be available at `https://your-app-name.onrender.com`

### 🔐 Access Information

- **URL**: `https://your-app-name.onrender.com`
- **Password**: `GoodbyeVertex2025`
- **Login**: Navigate to the URL and enter the password

### 📁 Project Structure

```
├── server.js              # Main server file
├── database.js            # Database management
├── package.json           # Dependencies and scripts
├── render.yaml           # Render deployment configuration
├── public/               # Frontend files
│   ├── index.html        # Main app page
│   ├── login.html        # Login page
│   ├── styles.css        # CSS styles
│   └── js/               # JavaScript modules
├── data/                 # Database storage (created on first run)
└── work/                 # Local development files (ignored in deployment)
```

### 🔧 Configuration Files

- **render.yaml**: Render deployment configuration
- **package.json**: Node.js dependencies and scripts
- **.gitignore**: Files to exclude from deployment

### 🚨 Important Notes

- The app uses SQLite database that persists data
- Sessions expire after 30 seconds for security
- Password is set to `GoodbyeVertex2025`
- All 35 test cases are automatically seeded on first run
- The app includes password protection for public hosting

### 🐛 Troubleshooting

If deployment fails:

1. **Check build logs** in Render dashboard
2. **Verify all files** are committed to GitHub
3. **Test locally** using `./deploy-to-render.sh`
4. **Check Node.js version** (requires Node.js 18+)

### 📞 Support

For issues with this deployment:
- Check Render's documentation
- Verify your GitHub repository is public
- Ensure all dependencies are in `package.json`