const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

// Data file path - Render uses ephemeral filesystem
const DATA_FILE = path.join(__dirname, 'data', 'test-data.json');

// Ensure data directory exists
fs.ensureDirSync(path.dirname(DATA_FILE));

// Initialize data file if it doesn't exist
const initializeDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      testCases: [],
      testUsers: [],
      currentUser: null,
      lastUpdated: new Date().toISOString()
    };
    fs.writeJsonSync(DATA_FILE, initialData, { spaces: 2 });
    console.log('📁 Initialized data file:', DATA_FILE);
  }
};

// Load data from file
const loadData = () => {
  try {
    return fs.readJsonSync(DATA_FILE);
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      testCases: [],
      testUsers: [],
      currentUser: null,
      lastUpdated: new Date().toISOString()
    };
  }
};

// Save data to file
const saveData = (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

// API Routes

// Get all test data
app.get('/api/data', (req, res) => {
  try {
    const data = loadData();
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load data',
      message: error.message
    });
  }
});

// Save all test data
app.post('/api/data', (req, res) => {
  try {
    const { testCases, testUsers, currentUser } = req.body;
    
    if (!Array.isArray(testCases) || !Array.isArray(testUsers)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format'
      });
    }

    const data = {
      testCases,
      testUsers,
      currentUser,
      lastUpdated: new Date().toISOString()
    };

    const saved = saveData(data);
    
    if (saved) {
      res.json({
        success: true,
        message: 'Data saved successfully',
        data: data
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save data'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save data',
      message: error.message
    });
  }
});

// Get test cases only
app.get('/api/tests', (req, res) => {
  try {
    const data = loadData();
    res.json({
      success: true,
      testCases: data.testCases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load test cases',
      message: error.message
    });
  }
});

// Save test cases only
app.post('/api/tests', (req, res) => {
  try {
    const { testCases } = req.body;
    
    if (!Array.isArray(testCases)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid test cases format'
      });
    }

    const data = loadData();
    data.testCases = testCases;
    
    const saved = saveData(data);
    
    if (saved) {
      res.json({
        success: true,
        message: 'Test cases saved successfully',
        testCases: data.testCases
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save test cases'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save test cases',
      message: error.message
    });
  }
});

// Get users only
app.get('/api/users', (req, res) => {
  try {
    const data = loadData();
    res.json({
      success: true,
      testUsers: data.testUsers,
      currentUser: data.currentUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load users',
      message: error.message
    });
  }
});

// Save users only
app.post('/api/users', (req, res) => {
  try {
    const { testUsers, currentUser } = req.body;
    
    if (!Array.isArray(testUsers)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid users format'
      });
    }

    const data = loadData();
    data.testUsers = testUsers;
    data.currentUser = currentUser;
    
    const saved = saveData(data);
    
    if (saved) {
      res.json({
        success: true,
        message: 'Users saved successfully',
        testUsers: data.testUsers,
        currentUser: data.currentUser
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save users'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save users',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Test Tracker Backend is running on Render',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Initialize data file and start server
initializeDataFile();

// Start server - Render will set PORT automatically
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test Tracker Backend running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`🌐 Frontend available at http://localhost:${PORT}/`);
  console.log(`💾 Data stored in: ${DATA_FILE}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.RENDER) {
    console.log(`☁️  Deployed on Render`);
    console.log(`🔗 Public URL: ${process.env.RENDER_EXTERNAL_URL || 'Not available'}`);
  }
});

module.exports = app;
