# Project Structure

This document outlines the organized folder structure of the Test Tracker web application.

## 📁 Directory Structure

```
user-management-testing-app/
├── src/                          # Backend source code
│   ├── server.js                 # Main server entry point
│   ├── models/                   # Data models and database
│   │   └── database.js          # Database operations and schema
│   ├── controllers/              # Request handlers (future)
│   ├── routes/                   # API route definitions (future)
│   ├── middleware/               # Custom middleware (future)
│   └── utils/                    # Utility functions
│       └── migrate.js            # Database migration tool
├── public/                       # Frontend static files
│   ├── index.html               # Main application page
│   ├── login.html               # Login page
│   ├── styles.css               # Application styles
│   └── js/                      # Frontend JavaScript modules
│       ├── app.js               # Main application controller
│       ├── api-client.js        # API communication
│       ├── modal-manager.js     # Modal handling
│       ├── test-manager.js      # Test management
│       ├── user-manager.js      # User management
│       └── results-manager.js   # Results management
├── config/                       # Configuration files
│   └── render.yaml              # Render deployment config
├── scripts/                      # Utility scripts
│   ├── deploy-to-render.sh      # Deployment script
│   ├── generate-test-report.js  # Test report generator
│   └── seed-all-tests.js        # Database seeding script
├── docs/                         # Documentation
│   ├── MIGRATION_GUIDE.md       # Migration documentation
│   └── RENDER.md                # Render deployment guide
├── data/                         # Database and data files
│   ├── test-tracker.db          # SQLite database
│   └── test-report.json         # Generated reports
├── work/                         # Development files (ignored in deployment)
│   ├── user-management-test-cases-app-format.js
│   ├── user-management-test-cases-comprehensive-docs.md
│   └── [other development files]
├── node_modules/                 # Dependencies
├── package.json                  # Project configuration
├── package-lock.json            # Dependency lock file
└── README.md                     # Project overview
```

## 🎯 Directory Purposes

### `/src` - Backend Source Code
- **`server.js`**: Main Express.js server with all API endpoints
- **`models/`**: Database models and data access layer
- **`controllers/`**: Business logic handlers (reserved for future expansion)
- **`routes/`**: API route definitions (reserved for future expansion)
- **`middleware/`**: Custom middleware functions (reserved for future expansion)
- **`utils/`**: Utility functions and tools

### `/public` - Frontend Static Files
- **`index.html`**: Main application interface
- **`login.html`**: Authentication page
- **`styles.css`**: Global styles and theming
- **`js/`**: Modular JavaScript components

### `/config` - Configuration Files
- **`render.yaml`**: Render deployment configuration
- Environment-specific settings (future)

### `/scripts` - Utility Scripts
- **`deploy-to-render.sh`**: Automated deployment script
- **`generate-test-report.js`**: Test report generation
- **`seed-all-tests.js`**: Database seeding utilities

### `/docs` - Documentation
- **`MIGRATION_GUIDE.md`**: Database migration instructions
- **`RENDER.md`**: Deployment guide
- API documentation (future)

### `/data` - Data Storage
- **`test-tracker.db`**: SQLite database file
- **`test-report.json`**: Generated test reports
- Backup files and data exports

### `/work` - Development Files
- Test case definitions and documentation
- Development notes and resources
- Files ignored in deployment (see `.gitignore`)

## 🔧 Development Commands

### Backend Development
```bash
# Start development server
npm run dev

# Start production server
npm start

# Database operations
npm run migrate
npm run seed
npm run clear-tests
npm run report
```

### Deployment
```bash
# Test deployment readiness
npm run deploy

# Deploy to Render
git push origin main
```

### File Organization Benefits

1. **Separation of Concerns**: Clear separation between frontend, backend, and configuration
2. **Scalability**: Easy to add new modules and features
3. **Maintainability**: Logical organization makes code easier to find and maintain
4. **Deployment Ready**: Clean structure suitable for production deployment
5. **Team Collaboration**: Standard structure familiar to web developers

## 🚀 Future Expansion

The current structure supports easy expansion:

- **API Routes**: Add route files in `/src/routes/`
- **Controllers**: Add business logic in `/src/controllers/`
- **Middleware**: Add custom middleware in `/src/middleware/`
- **Configuration**: Add environment configs in `/config/`
- **Documentation**: Add API docs in `/docs/`

This structure follows Node.js best practices and is ready for production deployment on Render.
