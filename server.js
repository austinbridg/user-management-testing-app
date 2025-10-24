const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

// API Routes

// Get all data (for backward compatibility)
app.get('/api/data', async (req, res) => {
  try {
    const [tests, users, testResults] = await Promise.all([
      db.getTests(),
      db.getUsers(),
      db.getTestResults()
    ]);

    // Transform data to match frontend expectations
    const transformedTests = tests.map(test => ({
      ...test,
      userResults: testResults.filter(result => result.test_id === test.id)
    }));

    res.json({
      success: true,
      data: {
        testCases: transformedTests,
        testUsers: users,
        currentUser: null // Will be handled by frontend
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load data',
      message: error.message
    });
  }
});

// Save all data (for backward compatibility)
app.post('/api/data', async (req, res) => {
  try {
    const { testCases, testUsers, currentUser } = req.body;
    
    if (!Array.isArray(testCases) || !Array.isArray(testUsers)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format'
      });
    }

    // This endpoint is mainly for backward compatibility
    // Individual CRUD operations should be used instead
    res.json({
      success: true,
      message: 'Data structure received. Use individual CRUD endpoints for better performance.',
      data: { testCases, testUsers, currentUser }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process data',
      message: error.message
    });
  }
});

// USER API ENDPOINTS

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load users',
      message: error.message
    });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (user) {
      res.json({
        success: true,
        user: user
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load user',
      message: error.message
    });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'User name is required'
      });
    }

    const user = await db.createUser(name.trim());
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: user
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({
        success: false,
        error: 'User with this name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create user',
        message: error.message
      });
    }
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'User name is required'
      });
    }

    const result = await db.updateUser(req.params.id, name.trim());
    if (result.changes > 0) {
      res.json({
        success: true,
        message: 'User updated successfully',
        user: result
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await db.deleteUser(req.params.id);
    if (result.changes > 0) {
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

// TEST API ENDPOINTS

// Get all tests
app.get('/api/tests', async (req, res) => {
  try {
    const tests = await db.getTests();
    res.json({
      success: true,
      tests: tests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load tests',
      message: error.message
    });
  }
});

// Get test by ID
app.get('/api/tests/:id', async (req, res) => {
  try {
    const test = await db.getTestById(req.params.id);
    if (test) {
      res.json({
        success: true,
        test: test
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load test',
      message: error.message
    });
  }
});

// Create a new test
app.post('/api/tests', async (req, res) => {
  try {
    const testData = req.body;
    
    if (!testData.id || !testData.title) {
      return res.status(400).json({
        success: false,
        error: 'Test ID and title are required'
      });
    }

    const test = await db.createTest(testData);
    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      test: test
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({
        success: false,
        error: 'Test with this ID already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create test',
        message: error.message
      });
    }
  }
});

// Update test
app.put('/api/tests/:id', async (req, res) => {
  try {
    const testData = req.body;
    const result = await db.updateTest(req.params.id, testData);
    
    if (result.changes > 0) {
      res.json({
        success: true,
        message: 'Test updated successfully',
        test: result
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update test',
      message: error.message
    });
  }
});

// Delete test
app.delete('/api/tests/:id', async (req, res) => {
  try {
    const result = await db.deleteTest(req.params.id);
    if (result.changes > 0) {
      res.json({
        success: true,
        message: 'Test deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete test',
      message: error.message
    });
  }
});

// TEST RESULTS API ENDPOINTS

// Get all test results
app.get('/api/test-results', async (req, res) => {
  try {
    const testResults = await db.getTestResults();
    res.json({
      success: true,
      testResults: testResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load test results',
      message: error.message
    });
  }
});

// Get test results by test ID
app.get('/api/tests/:id/results', async (req, res) => {
  try {
    const testResults = await db.getTestResultsByTestId(req.params.id);
    res.json({
      success: true,
      testResults: testResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load test results',
      message: error.message
    });
  }
});

// Get test results by user ID
app.get('/api/users/:id/results', async (req, res) => {
  try {
    const testResults = await db.getTestResultsByUserId(req.params.id);
    res.json({
      success: true,
      testResults: testResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load test results',
      message: error.message
    });
  }
});

// Create a new test result
app.post('/api/test-results', async (req, res) => {
  try {
    const resultData = req.body;
    
    if (!resultData.testId || !resultData.userId || !resultData.status) {
      return res.status(400).json({
        success: false,
        error: 'Test ID, User ID, and status are required'
      });
    }

    const testResult = await db.createTestResult(resultData);
    res.status(201).json({
      success: true,
      message: 'Test result created successfully',
      testResult: testResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create test result',
      message: error.message
    });
  }
});

// Update test result
app.put('/api/test-results/:id', async (req, res) => {
  try {
    const resultData = req.body;
    const result = await db.updateTestResult(req.params.id, resultData);
    
    if (result.changes > 0) {
      res.json({
        success: true,
        message: 'Test result updated successfully',
        testResult: result
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Test result not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update test result',
      message: error.message
    });
  }
});

// Delete test result
app.delete('/api/test-results/:id', async (req, res) => {
  try {
    const result = await db.deleteTestResult(req.params.id);
    if (result.changes > 0) {
      res.json({
        success: true,
        message: 'Test result deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Test result not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete test result',
      message: error.message
    });
  }
});

// STATISTICS API ENDPOINTS

// Get overall test statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getTestStats();
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load statistics',
      message: error.message
    });
  }
});

// Get user-specific statistics
app.get('/api/users/:id/stats', async (req, res) => {
  try {
    const stats = await db.getUserStats(req.params.id);
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load user statistics',
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

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    const dbInitialized = await db.init();
    if (!dbInitialized) {
      console.error('❌ Failed to initialize database. Exiting...');
      process.exit(1);
    }

    // Start server - Render will set PORT automatically
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Test Tracker Backend running on port ${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
      console.log(`🌐 Frontend available at http://localhost:${PORT}/`);
      console.log(`💾 Database: ${db.dbPath}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      if (process.env.RENDER) {
        console.log(`☁️  Deployed on Render`);
        console.log(`🔗 Public URL: ${process.env.RENDER_EXTERNAL_URL || 'Not available'}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
