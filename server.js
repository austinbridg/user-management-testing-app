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

    // Check if database is empty and seed if necessary
    try {
      const users = await db.getUsers();
      const tests = await db.getTests();
      
      if (users.length === 0 && tests.length === 0) {
        console.log('🌱 Database is empty, seeding initial data...');
        
        // Seed default user
        await db.createUser('Austin');
        console.log('✅ Seeded default user: Austin');
        
        // Seed comprehensive test data
        const testData = [
          {
            id: 'TC-001',
            title: 'Create Users Across Organizations',
            story: 'US-001 - Create and manage users across all organizations',
            category: 'system-admin',
            priority: 'High',
            estimatedTime: '15 minutes',
            prerequisites: 'System Administrator access, Test organizations available',
            testSteps: JSON.stringify([
              'Navigate to User Management section',
              'Click "Create New User" button',
              'Fill in user details (name, email, organization)',
              'Select appropriate role and permissions',
              'Save user and verify creation'
            ]),
            acceptanceCriteria: JSON.stringify([
              'User is created successfully',
              'User appears in organization user list',
              'User receives welcome email',
              'User can log in with provided credentials'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'User creation works as expected',
              fail: 'User creation fails or has issues',
              blocked: 'Cannot access user management or missing permissions',
              partial: 'User created but some features not working',
              needsReview: 'User created but requires manual verification'
            })
          },
          {
            id: 'TC-002',
            title: 'User Role Assignment',
            story: 'US-002 - Assign and modify user roles within organizations',
            category: 'system-admin',
            priority: 'High',
            estimatedTime: '10 minutes',
            prerequisites: 'Existing users, Role management access',
            testSteps: JSON.stringify([
              'Select user from organization list',
              'Click "Edit Roles" button',
              'Modify role assignments',
              'Save changes and verify'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Role changes are saved successfully',
              'User permissions reflect new role',
              'Changes are logged in audit trail'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Role assignment works correctly',
              fail: 'Role changes fail to save or apply',
              blocked: 'Cannot access role management',
              partial: 'Some role changes work, others fail',
              needsReview: 'Role changes need manual verification'
            })
          },
          {
            id: 'TC-003',
            title: 'Organization User Listing',
            story: 'US-003 - View and filter users by organization',
            category: 'functional',
            priority: 'Medium',
            estimatedTime: '8 minutes',
            prerequisites: 'Multiple organizations with users',
            testSteps: JSON.stringify([
              'Navigate to Organization Management',
              'Select organization from dropdown',
              'View user list for selected organization',
              'Test filtering and search functionality'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Correct users displayed for organization',
              'Filtering works as expected',
              'Search returns accurate results'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'User listing and filtering work correctly',
              fail: 'Incorrect users shown or filtering broken',
              blocked: 'Cannot access organization management',
              partial: 'Some features work, others fail',
              needsReview: 'Results need manual verification'
            })
          },
          {
            id: 'TC-004',
            title: 'User Deactivation',
            story: 'US-004 - Deactivate users while preserving data',
            category: 'system-admin',
            priority: 'High',
            estimatedTime: '12 minutes',
            prerequisites: 'Active users in system',
            testSteps: JSON.stringify([
              'Select user to deactivate',
              'Click "Deactivate User" button',
              'Confirm deactivation action',
              'Verify user status change'
            ]),
            acceptanceCriteria: JSON.stringify([
              'User is deactivated successfully',
              'User data is preserved',
              'User cannot log in',
              'Deactivation is logged'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'User deactivation works correctly',
              fail: 'Deactivation fails or data lost',
              blocked: 'Cannot access deactivation feature',
              partial: 'Deactivation works but data issues',
              needsReview: 'Deactivation needs manual verification'
            })
          },
          {
            id: 'TC-005',
            title: 'Bulk User Operations',
            story: 'US-005 - Perform bulk operations on multiple users',
            category: 'system-admin',
            priority: 'Medium',
            estimatedTime: '20 minutes',
            prerequisites: 'Multiple users in system',
            testSteps: JSON.stringify([
              'Select multiple users using checkboxes',
              'Choose bulk operation (activate, deactivate, role change)',
              'Confirm bulk operation',
              'Verify changes applied to all selected users'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Bulk operation completes successfully',
              'All selected users are affected',
              'Operation is logged for each user',
              'No partial failures'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Bulk operations work correctly',
              fail: 'Bulk operation fails or partial failure',
              blocked: 'Cannot access bulk operations',
              partial: 'Some users affected, others not',
              needsReview: 'Bulk operation results need verification'
            })
          }
        ];
        
        // Insert test data
        for (const test of testData) {
          await db.createTest(test);
          console.log(`✅ Seeded test: ${test.id}`);
        }
        
        console.log('✅ Initial data seeded successfully');
      } else {
        console.log(`📊 Database contains ${users.length} users and ${tests.length} tests`);
      }
    } catch (seedError) {
      console.warn('⚠️  Warning: Could not seed initial data:', seedError.message);
      console.log('📝 Continuing with empty database...');
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
