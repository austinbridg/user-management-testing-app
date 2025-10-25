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
    
    // Validate status
    const validStatuses = ['pass', 'fail', 'blocked', 'partial', 'skip', 'pending'];
    if (!validStatuses.includes(resultData.status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
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
        
        // Seed comprehensive user management test cases
        const testData = [
          {
            id: 'TC-01',
            title: 'Single User Invite - Basic Flow',
            story: 'As an Organization Administrator, I can invite a single user by email so that they can access the platform and be assigned to appropriate groups',
            category: 'org-admin',
            priority: 'High',
            estimatedTime: '10 minutes',
            prerequisites: 'Organization Administrator access, Test email addresses available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Users page',
              'Click "Add User" button',
              'Enter valid email address: testuser@example.com',
              'Optionally select a group from dropdown',
              'Click "Submit" button',
              'Verify confirmation message shows invite status',
              'Check that user appears in pending invites list'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Modal opens with email input field',
              'Email validation works correctly',
              'Confirmation message displays invite status',
              'User appears in pending invites with correct status',
              'If group selected, user is assigned to that group upon activation'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All acceptance criteria are met and single user invite works correctly',
              fail: 'Any acceptance criteria fails or invite process does not work',
              blocked: 'Cannot access Users page or Organization Administrator access unavailable',
              partial: 'Invite works but some acceptance criteria fail (e.g., no confirmation message)',
              skip: 'Test cannot be executed due to environment issues or missing prerequisites'
            })
          },
          {
            id: 'TC-02',
            title: 'Multi-User Invite from Users Page',
            story: 'As an Organization Administrator, I can invite multiple users simultaneously using chip-input from the Users page so that I can efficiently onboard multiple team members at once',
            category: 'org-admin',
            priority: 'High',
            estimatedTime: '15 minutes',
            prerequisites: 'Organization Administrator access, Multiple test email addresses available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Users page',
              'Click "Add User" button',
              'Enter multiple emails via chip-input:',
              '  - Type user1@example.com and press Enter',
              '  - Type user2@example.com and press comma',
              '  - Type user3@example.com and press Enter',
              'Optionally select groups from dropdown',
              'Submit invite',
              'Verify result summary shows per-email outcomes'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Emails convert to chips when Enter or comma pressed',
              'Each chip supports remove (X) functionality',
              'Result summary shows counts by outcome type',
              'All users (new + existing) are members of selected groups'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Multi-user invite with chip-input works correctly and all acceptance criteria are met',
              fail: 'Chip-input fails or multi-user invite does not work',
              blocked: 'Cannot access Users page or chip-input functionality unavailable',
              partial: 'Some emails work but chip-input behavior is inconsistent',
              skip: 'Multi-user invite functionality not available or test data missing'
            })
          },
          {
            id: 'TC-03',
            title: 'Chip-Input Behavior Validation',
            story: 'As an Organization Administrator, I can invite multiple users simultaneously using chip-input from the Users page so that I can efficiently onboard multiple team members at once',
            category: 'org-admin',
            priority: 'Medium',
            estimatedTime: '8 minutes',
            prerequisites: 'Organization Administrator access, Multi-user invite functionality available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Users page',
              'Click "Add User" button',
              'Test chip-input behavior:',
              '  - Type email and press Enter → verify chip creation',
              '  - Type email and press comma → verify chip creation',
              '  - Click X on chip → verify chip removal',
              '  - Enter duplicate emails → verify deduplication',
              'Submit with valid chips'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Emails convert to chips on Enter/comma',
              'Chips can be removed with X button',
              'Duplicate emails are surfaced and deduplicated',
              'UI remains responsive with up to 100 emails'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All chip-input behaviors work correctly and UI remains responsive',
              fail: 'Chip-input behavior fails or UI becomes unresponsive',
              blocked: 'Chip-input functionality not available',
              partial: 'Some chip behaviors work but others fail',
              skip: 'Multi-user invite functionality not implemented'
            })
          },
          {
            id: 'TC-04',
            title: 'Email Validation',
            story: 'As an Organization Administrator, I can invite a single user by email so that they can access the platform and be assigned to appropriate groups',
            category: 'org-admin',
            priority: 'Medium',
            estimatedTime: '5 minutes',
            prerequisites: 'Organization Administrator access, User invite functionality available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Users page',
              'Click "Add User" button',
              'Enter invalid email: invalid-email',
              'Attempt to submit',
              'Enter valid email: valid@example.com',
              'Submit successfully'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Invalid email is flagged and cannot be submitted',
              'Real-time validation occurs as user types',
              'Valid email allows successful submission'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Email validation works correctly for both valid and invalid formats',
              fail: 'Email validation fails or allows invalid emails',
              blocked: 'Email validation functionality not available',
              partial: 'Some validation works but not all cases',
              skip: 'User invite functionality not implemented'
            })
          },
          {
            id: 'TC-05',
            title: 'User Organization Association',
            story: 'As a System Administrator, I can associate users with one or more organizations via Sustainability Graph APIs so that users can work across different organizational contexts',
            category: 'system-admin',
            priority: 'High',
            estimatedTime: '12 minutes',
            prerequisites: 'System Administrator access, Sustainability Graph APIs available, Test organizations available',
            testSteps: JSON.stringify([
              'Login as System Administrator',
              'Use Sustainability Graph APIs to associate user with organizations',
              'Verify user can work on behalf of one organization at a time',
              'Test organization context switching',
              'Verify users are associated by default to "_All Users_" node'
            ]),
            acceptanceCriteria: JSON.stringify([
              'User can be associated with multiple organizations',
              'Vertex token contains correct organization context',
              'Organization switching works within 500ms',
              'Users are associated to "_All Users_" node by default'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'User organization association works correctly across all acceptance criteria',
              fail: 'Organization association fails or context switching does not work',
              blocked: 'Sustainability Graph APIs unavailable or System Administrator access denied',
              partial: 'Basic association works but context switching fails',
              skip: 'Organization management functionality not implemented'
            })
          },
          {
            id: 'TC-06',
            title: 'User Status Management',
            story: 'As an Organization Administrator, I can deactivate and reactivate users so that I can manage user access without losing their historical data',
            category: 'org-admin',
            priority: 'Medium',
            estimatedTime: '8 minutes',
            prerequisites: 'Organization Administrator access, Active test users available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Users page',
              'Find active user',
              'Deactivate user',
              'Verify user loses access',
              'Reactivate user',
              'Verify access is restored with previous group memberships'
            ]),
            acceptanceCriteria: JSON.stringify([
              'User loses access when deactivated',
              'Historical data is preserved',
              'Access is restored when reactivated',
              'Previous group memberships remain intact'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'User status management works correctly and data is preserved',
              fail: 'Status changes fail or data is lost during deactivation/reactivation',
              blocked: 'User status management functionality not available',
              partial: 'Basic status changes work but data preservation issues',
              skip: 'User management functionality not implemented'
            })
          },
          {
            id: 'TC-07',
            title: 'Effective Access Preview',
            story: 'As an Organization Administrator, I can preview any user\'s effective capabilities and scope so that I can understand their current access before making changes',
            category: 'org-admin',
            priority: 'Medium',
            estimatedTime: '6 minutes',
            prerequisites: 'Organization Administrator access, Users with group memberships available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Users page',
              'Find user with group memberships',
              'Click "View Effective Access" action',
              'Verify preview loads within 2 seconds',
              'Check that preview shows groups → roles → capabilities + resolved scope'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Preview loads within 2 seconds (p95)',
              'Shows read-only view of effective access',
              'Displays groups, roles, capabilities, and resolved scope',
              'Preview is comprehensive and accurate'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Effective access preview works correctly and loads within SLA',
              fail: 'Preview fails to load or shows incorrect information',
              blocked: 'Effective access preview functionality not available',
              partial: 'Preview loads but information is incomplete or inaccurate',
              skip: 'Access preview functionality not implemented'
            })
          },
          {
            id: 'TC-08',
            title: 'Default Role Visibility',
            story: 'As a System Administrator, I can see and manage the four default roles (System Administrator, Organization Administrator, Organization Manager, Organization Member) so that I can ensure proper access control across the platform',
            category: 'system-admin',
            priority: 'High',
            estimatedTime: '8 minutes',
            prerequisites: 'System Administrator access, Roles page accessible',
            testSteps: JSON.stringify([
              'Login as System Administrator',
              'Navigate to Roles page',
              'Verify four default roles are visible:',
              '  - System Administrator',
              '  - Organization Administrator',
              '  - Organization Manager',
              '  - Organization Member',
              'Check that roles have clear descriptions',
              'Verify default roles cannot be edited'
            ]),
            acceptanceCriteria: JSON.stringify([
              'All four default roles are visible',
              'Clear descriptions of capabilities are shown',
              'Default roles cannot be edited',
              'Permission matrix is displayed correctly'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All default roles are visible and properly configured',
              fail: 'Default roles missing or incorrectly configured',
              blocked: 'Cannot access Roles page or System Administrator access denied',
              partial: 'Some default roles visible but others missing or misconfigured',
              skip: 'Role management functionality not implemented'
            })
          },
          {
            id: 'TC-09',
            title: 'Default Permission Matrix Validation',
            story: 'As a System Administrator, I can see and manage the four default roles (System Administrator, Organization Administrator, Organization Manager, Organization Member) so that I can ensure proper access control across the platform',
            category: 'system-admin',
            priority: 'High',
            estimatedTime: '15 minutes',
            prerequisites: 'System Administrator access, Permission matrix visible',
            testSteps: JSON.stringify([
              'Login as System Administrator',
              'Navigate to Roles page',
              'Review permission matrix for each default role',
              'Verify Entity Management permissions:',
              '  - System Administrator: All permissions ✓',
              '  - Organization Administrator: All permissions ✓',
              '  - Organization Manager: Edit ✓, Create ✗, View ✓, Delete ✗',
              '  - Organization Member: View ✓, others ✗',
              'Verify Hierarchy Management permissions',
              'Verify Organization Management permissions',
              'Verify Role Management permissions',
              'Verify User Group Management permissions',
              'Verify User Management permissions'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Permission matrix matches PRD specifications exactly',
              'Each role has correct permissions for each management area',
              'Visual indicators (✓/✗) are accurate',
              'Permission descriptions are clear'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Permission matrix is accurate and matches PRD specifications',
              fail: 'Permission matrix incorrect or does not match PRD',
              blocked: 'Permission matrix not visible or accessible',
              partial: 'Some permissions correct but others incorrect',
              skip: 'Permission matrix functionality not implemented'
            })
          },
          {
            id: 'TC-10',
            title: 'Custom Role Creation',
            story: 'As an Organization Administrator, I can create custom roles by selecting capabilities from platform and application areas so that I can tailor access to my organization\'s specific needs',
            category: 'org-admin',
            priority: 'High',
            estimatedTime: '12 minutes',
            prerequisites: 'Organization Administrator access, Custom role creation functionality available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Roles page',
              'Click "Create Custom Role"',
              'Enter role name and description',
              'Select capabilities from platform areas',
              'Select capabilities from application areas',
              'Save role',
              'Verify role is created and can be assigned to groups'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Role is created successfully',
              'Role reflects organization\'s specific job functions',
              'Role can be assigned to groups',
              'Role appears in roles catalog'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Custom role creation works correctly and role can be used',
              fail: 'Custom role creation fails or role cannot be assigned',
              blocked: 'Custom role creation functionality not available',
              partial: 'Role created but cannot be assigned or has issues',
              skip: 'Custom role functionality not implemented'
            })
          },
          {
            id: 'TC-11',
            title: 'Permission Assignment',
            story: 'As an Organization Administrator, I can assign application-defined permissions to roles so that I can control what actions each role can perform',
            category: 'org-admin',
            priority: 'Medium',
            estimatedTime: '10 minutes',
            prerequisites: 'Organization Administrator access, Custom roles available, Application permissions defined',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Roles page',
              'Create or edit custom role',
              'Assign application-defined permissions to role',
              'Save role',
              'Verify permissions define what actions role can perform',
              'Test that permissions are not editable by users'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Permissions are assigned successfully',
              'Permissions define role actions correctly',
              'Permissions are managed by application teams',
              'Users cannot edit permissions'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Permission assignment works correctly and permissions are properly managed',
              fail: 'Permission assignment fails or permissions can be edited by users',
              blocked: 'Permission assignment functionality not available',
              partial: 'Basic assignment works but permission management issues',
              skip: 'Permission management functionality not implemented'
            })
          },
          {
            id: 'TC-12',
            title: 'Group Creation',
            story: 'As an Organization Administrator, I can create and edit groups with names, descriptions, assigned roles, hierarchy scopes, and members so that I can organize users with appropriate access',
            category: 'org-admin',
            priority: 'High',
            estimatedTime: '15 minutes',
            prerequisites: 'Organization Administrator access, Groups page accessible, Roles available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Groups page',
              'Click "Create Group"',
              'Enter group name and description',
              'Assign roles to group',
              'Define hierarchy scopes',
              'Add members to group',
              'Save group',
              'Verify group is created and can be used for access control'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Group is created successfully',
              'All fields are saved correctly',
              'Group can be used for access control',
              'Group appears in groups list'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Group creation works correctly and all fields are saved properly',
              fail: 'Group creation fails or fields are not saved correctly',
              blocked: 'Group creation functionality not available',
              partial: 'Group created but some fields missing or incorrect',
              skip: 'Group management functionality not implemented'
            })
          },
          {
            id: 'TC-13',
            title: 'Group Member Management',
            story: 'As an Organization Administrator, I can add and remove users from groups so that I can maintain proper group membership',
            category: 'org-admin',
            priority: 'High',
            estimatedTime: '12 minutes',
            prerequisites: 'Organization Administrator access, Existing groups available, Test users available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Groups page',
              'Edit existing group',
              'Add users to group using searchable table',
              'Remove users from group',
              'Save changes',
              'Verify membership changes are applied',
              'Test duplicate membership prevention'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Users can be added to groups',
              'Users can be removed from groups',
              'Duplicate memberships are prevented',
              'Searchable table supports efficient management',
              'Changes are applied immediately'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Group member management works correctly and efficiently',
              fail: 'Member management fails or duplicate memberships allowed',
              blocked: 'Group member management functionality not available',
              partial: 'Basic member management works but efficiency issues',
              skip: 'Group member management functionality not implemented'
            })
          },
          {
            id: 'TC-14',
            title: 'Hierarchy Access Parameters',
            story: 'As an Organization Administrator, I can define hierarchy access using Hierarchy Name, Path, and Permission parameters so that I can control where users can perform actions',
            category: 'org-admin',
            priority: 'High',
            estimatedTime: '15 minutes',
            prerequisites: 'Organization Administrator access, Groups page accessible, Hierarchy data available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Groups page',
              'Create or edit group',
              'Define hierarchy access:',
              '  - Set Hierarchy Name (specific or wildcard *)',
              '  - Set Path (specific path or wildcard *)',
              '  - Set Permission (grant/deny)',
              'Save group',
              'Verify access is granted/denied to entire subgraph',
              'Test wildcard constraints'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Access is granted/denied to entire subgraph starting at final node',
              'Wildcard * applies to entire hierarchy',
              'If hierarchy name is *, path must also be *',
              'Access patterns are consistent'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Hierarchy access parameters work correctly and constraints are enforced',
              fail: 'Hierarchy access fails or constraints not enforced',
              blocked: 'Hierarchy access functionality not available',
              partial: 'Basic hierarchy access works but constraint issues',
              skip: 'Hierarchy access functionality not implemented'
            })
          },
          {
            id: 'TC-15',
            title: 'Hierarchy Scope Picker',
            story: 'As an Organization Administrator, I can use a scope picker to browse, search, and multi-select hierarchy nodes with "include descendants" toggle so that I can efficiently define access scopes',
            category: 'org-admin',
            priority: 'Medium',
            estimatedTime: '12 minutes',
            prerequisites: 'Organization Administrator access, Scope picker functionality available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Groups page',
              'Create or edit group',
              'Use scope picker to define hierarchy access:',
              '  - Browse hierarchy nodes',
              '  - Search for specific nodes',
              '  - Multi-select nodes',
              '  - Toggle "include descendants"',
              'Verify picker responds within 300ms',
              'Save group'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Scope picker allows browsing hierarchy',
              'Search functionality works correctly',
              'Multi-select is supported',
              '"Include descendants" toggle works',
              'Picker responds within 300ms'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Scope picker works correctly and meets performance requirements',
              fail: 'Scope picker fails or performance requirements not met',
              blocked: 'Scope picker functionality not available',
              partial: 'Basic picker works but performance or functionality issues',
              skip: 'Scope picker functionality not implemented'
            })
          },
          {
            id: 'TC-16',
            title: 'EIM Authentication',
            story: 'As a User, I can authenticate via Schneider Electric EIM so that I can securely access the platform using my corporate credentials',
            category: 'integration',
            priority: 'High',
            estimatedTime: '8 minutes',
            prerequisites: 'EIM integration configured, Valid EIM credentials available',
            testSteps: JSON.stringify([
              'Navigate to platform login page',
              'Click "Login with EIM" or similar',
              'Enter Schneider Electric EIM credentials',
              'Complete EIM authentication flow',
              'Verify successful login to platform',
              'Test authentication integration'
            ]),
            acceptanceCriteria: JSON.stringify([
              'EIM authentication works seamlessly',
              'User can access platform with corporate credentials',
              'Authentication integrates properly with platform',
              'Login process is smooth'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'EIM authentication works seamlessly and integrates properly',
              fail: 'EIM authentication fails or integration issues',
              blocked: 'EIM integration not configured or credentials unavailable',
              partial: 'Basic authentication works but integration issues',
              skip: 'EIM integration not implemented'
            })
          },
          {
            id: 'TC-17',
            title: 'Vertex Token Generation',
            story: 'As a User, I can receive a Vertex token with my organization context and permissions so that I can access platform resources with appropriate authorization',
            category: 'integration',
            priority: 'High',
            estimatedTime: '6 minutes',
            prerequisites: 'Authenticated user, Vertex token service available',
            testSteps: JSON.stringify([
              'Login as authenticated user',
              'Access platform resources',
              'Verify Vertex token is generated',
              'Check token contains organization context',
              'Verify token contains user permissions',
              'Test token is used for authorization decisions'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Vertex token is generated automatically',
              'Token contains organization context',
              'Token contains user permissions',
              'Token is used for all authorization decisions'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Vertex token generation works correctly and contains all required information',
              fail: 'Token generation fails or missing required information',
              blocked: 'Vertex token service unavailable',
              partial: 'Token generated but missing some information',
              skip: 'Vertex token functionality not implemented'
            })
          },
          {
            id: 'TC-18',
            title: 'Fast Access Preview Performance',
            story: 'As an Organization Administrator, I can preview effective access within 2 seconds so that I can make quick decisions about access changes',
            category: 'performance',
            priority: 'Medium',
            estimatedTime: '8 minutes',
            prerequisites: 'Organization Administrator access, Users with complex group memberships available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Users page',
              'Find user with complex group memberships',
              'Click "View Effective Access"',
              'Measure time to load preview',
              'Verify preview loads within 2 seconds (p95)',
              'Check that preview shows comprehensive access information'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Preview loads within 2 seconds (p95)',
              'Comprehensive access information is shown',
              'Performance is consistent across different user types'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Access preview loads within SLA and shows comprehensive information',
              fail: 'Preview fails to load within SLA or shows incomplete information',
              blocked: 'Access preview functionality not available',
              partial: 'Preview loads but performance or information issues',
              skip: 'Access preview functionality not implemented'
            })
          },
          {
            id: 'TC-19',
            title: 'Quick Search Performance',
            story: 'As an Organization Administrator, I can search in pickers within 300ms so that I can quickly find users, groups, and hierarchy nodes',
            category: 'performance',
            priority: 'Medium',
            estimatedTime: '10 minutes',
            prerequisites: 'Organization Administrator access, Search functionality available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Groups page',
              'Test search in various pickers:',
              '  - User search',
              '  - Group search',
              '  - Hierarchy node search',
              'Measure search response time',
              'Verify searches return results within 300ms (p95)'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Search results returned within 300ms (p95)',
              'Search works for users, groups, and hierarchy nodes',
              'Performance is consistent across different search types'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Search performance meets SLA across all picker types',
              fail: 'Search performance fails SLA or functionality issues',
              blocked: 'Search functionality not available',
              partial: 'Some searches meet SLA but others do not',
              skip: 'Search functionality not implemented'
            })
          },
          {
            id: 'TC-20',
            title: 'No Access State',
            story: 'As a User with no group memberships, I can see a clear "No Access" state with guidance on how to request access so that I understand my current status',
            category: 'end-user',
            priority: 'Medium',
            estimatedTime: '5 minutes',
            prerequisites: 'User with no group memberships available',
            testSteps: JSON.stringify([
              'Login as user with no group memberships',
              'Navigate to platform',
              'Verify "No Access" state is displayed',
              'Check that guidance on requesting access is provided',
              'Verify state provides clear next steps'
            ]),
            acceptanceCriteria: JSON.stringify([
              '"No Access" state is clearly displayed',
              'Guidance on requesting access is provided',
              'Clear next steps are shown',
              'User understands current status'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'No Access state is clear and provides helpful guidance',
              fail: 'No Access state not displayed or guidance unclear',
              blocked: 'Cannot create user with no group memberships',
              partial: 'No Access state shown but guidance incomplete',
              skip: 'No Access state functionality not implemented'
            })
          },
          {
            id: 'TC-21',
            title: 'Orphan User Management',
            story: 'As an Organization Administrator, I can handle orphan users (users with zero groups) by providing clear guidance and request-access CTAs so that users are not left without direction',
            category: 'org-admin',
            priority: 'Low',
            estimatedTime: '6 minutes',
            prerequisites: 'Organization Administrator access, Users with zero groups available',
            testSteps: JSON.stringify([
              'Login as Organization Administrator',
              'Navigate to Users page',
              'Find users with zero groups',
              'Verify clear guidance is provided',
              'Check that request-access CTAs are available',
              'Verify users are not left without direction'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Clear guidance is provided for orphan users',
              'Request-access CTAs are available',
              'Users are not left without direction',
              'Management interface is helpful'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Orphan user management provides clear guidance and helpful CTAs',
              fail: 'Orphan user management fails or provides unclear guidance',
              blocked: 'Cannot access users with zero groups',
              partial: 'Basic guidance provided but CTAs missing or unclear',
              skip: 'Orphan user management functionality not implemented'
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
