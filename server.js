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
        
        // Seed all 30 comprehensive test cases
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
              'Log in as System Administrator',
              'Navigate to User Management section',
              'Click "Create New User"',
              'Enter test user details (email, name, organization)',
              'Click "Save"',
              'Verify user is created successfully',
              'Repeat for different organization'
            ]),
            acceptanceCriteria: JSON.stringify([
              'User is created successfully',
              'User appears in user list',
              'User is associated with correct organization',
              'User is automatically added to "_All Users_" group',
              'User can be found by email search'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All acceptance criteria are met and user creation works across organizations',
              fail: 'Any acceptance criteria fails or user creation does not work',
              blocked: 'Cannot access user management or test organizations are unavailable',
              partial: 'User creation works but some acceptance criteria fail (e.g., missing "_All Users_" association)',
              skip: 'Test cannot be executed due to environment issues or missing prerequisites'
            })
          },
          {
            id: 'TC-002',
            title: 'Manage System-Wide Configurations',
            story: 'US-002 - Manage system-wide configurations and default roles',
            category: 'system-admin',
            priority: 'High',
            estimatedTime: '10 minutes',
            prerequisites: 'System Administrator access',
            testSteps: JSON.stringify([
              'Log in as System Administrator',
              'Navigate to System Configuration',
              'View default roles list',
              'Verify all 4 default roles exist',
              'Check that default roles cannot be edited',
              'Verify role permissions are pre-defined'
            ]),
            acceptanceCriteria: JSON.stringify([
              'All 4 default roles are visible',
              'Default roles cannot be edited',
              'Role permissions are correctly assigned',
              'System configuration is accessible'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All default roles exist and are properly configured',
              fail: 'Missing default roles or incorrect permissions',
              blocked: 'Cannot access system configuration',
              partial: 'Some default roles missing or configuration issues',
              skip: 'System configuration not available or access denied'
            })
          },
          {
            id: 'TC-003',
            title: 'Create and Manage Users Within Organization',
            story: 'US-006 - Create and manage users within my organization',
            category: 'org-admin',
            priority: 'High',
            estimatedTime: '20 minutes',
            prerequisites: 'Organization Administrator access, Test organization available',
            testSteps: JSON.stringify([
              'Log in as Organization Administrator',
              'Navigate to User Management',
              'Click "Add User to Organization"',
              'Enter user details (email, name)',
              'Click "Add User"',
              'Verify user is added to organization',
              'Edit user details and save changes',
              'Verify changes are saved'
            ]),
            acceptanceCriteria: JSON.stringify([
              'User can be added to organization',
              'User details can be edited',
              'Changes are saved successfully',
              'User appears in organization user list',
              'Cannot add users to other organizations'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All user management operations work correctly within organization scope',
              fail: 'User addition/editing fails or works outside organization scope',
              blocked: 'Cannot access user management or organization not available',
              partial: 'User addition works but editing fails, or vice versa',
              skip: 'Organization Administrator access not available or test data missing'
            })
          },
          {
            id: 'TC-004',
            title: 'Create and Manage User Groups',
            story: 'US-007 - Create and manage user groups',
            category: 'org-admin',
            priority: 'High',
            estimatedTime: '15 minutes',
            prerequisites: 'Organization Administrator access',
            testSteps: JSON.stringify([
              'Log in as Organization Administrator',
              'Navigate to Group Management',
              'Click "Create New Group"',
              'Enter group details (name, description)',
              'Click "Save"',
              'Verify group is created',
              'Edit group details',
              'Save changes and verify group appears in list'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Group can be created successfully',
              'Group details can be edited',
              'Group appears in group list',
              'Group name and description are correct',
              'Multiple groups can be created'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All group management operations work correctly',
              fail: 'Group creation/editing fails or data not saved',
              blocked: 'Cannot access group management',
              partial: 'Group creation works but editing fails',
              skip: 'Group management not available or access denied'
            })
          },
          {
            id: 'TC-005',
            title: 'Define Hierarchy Access Rules',
            story: 'US-008 - Define hierarchy access rules for different groups',
            category: 'org-admin',
            priority: 'High',
            estimatedTime: '25 minutes',
            prerequisites: 'Organization Administrator access, Test groups and hierarchies available',
            testSteps: JSON.stringify([
              'Log in as Organization Administrator',
              'Navigate to Group Management',
              'Select a test group',
              'Click "Add Hierarchy Access Rule"',
              'Configure access rule (hierarchy name, path, permission)',
              'Click "Save"',
              'Add another rule with different permission',
              'Save second rule and verify both rules are saved'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Hierarchy access rules can be created',
              'Multiple rules can be added to same group',
              'Grant and Deny permissions work',
              'Rules are saved correctly',
              'Rules can be edited or deleted'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All hierarchy access rule operations work correctly',
              fail: 'Rule creation fails or permissions not applied correctly',
              blocked: 'Cannot access hierarchy management or test data unavailable',
              partial: 'Basic rules work but complex scenarios fail',
              skip: 'Hierarchy management not available or test hierarchies missing'
            })
          },
          {
            id: 'TC-006',
            title: 'Create Custom Roles',
            story: 'US-009 - Create custom roles for specific job functions',
            category: 'org-admin',
            priority: 'Medium',
            estimatedTime: '20 minutes',
            prerequisites: 'Organization Administrator access',
            testSteps: JSON.stringify([
              'Log in as Organization Administrator',
              'Navigate to Role Management',
              'Click "Create Custom Role"',
              'Enter role details (name, description)',
              'Assign permissions to the role',
              'Click "Save"',
              'Verify role is created',
              'Edit role permissions and save changes'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Custom role can be created',
              'Permissions can be assigned',
              'Role appears in role list',
              'Role permissions can be edited',
              'Role is organization-specific'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Custom role creation and management works correctly',
              fail: 'Role creation fails or permissions not assigned correctly',
              blocked: 'Cannot access role management',
              partial: 'Role creation works but permission assignment fails',
              skip: 'Role management not available or custom roles disabled'
            })
          },
          {
            id: 'TC-007',
            title: 'Assign Users to Multiple Groups',
            story: 'US-010 - Assign users to multiple groups',
            category: 'org-admin',
            priority: 'Medium',
            estimatedTime: '15 minutes',
            prerequisites: 'Organization Administrator access, Test users and groups available',
            testSteps: JSON.stringify([
              'Log in as Organization Administrator',
              'Navigate to User Management',
              'Select a test user',
              'Click "Manage Group Memberships"',
              'Add user to first group',
              'Add user to second group',
              'Save memberships',
              'Verify user is in both groups',
              'Remove user from one group',
              'Save changes and verify user is only in remaining group'
            ]),
            acceptanceCriteria: JSON.stringify([
              'User can be added to multiple groups',
              'User can be removed from groups',
              'Group memberships are saved correctly',
              'User\'s group list updates correctly',
              'Multiple group operations work'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All group membership operations work correctly',
              fail: 'Group assignment/removal fails or not saved',
              blocked: 'Cannot access group membership management',
              partial: 'Adding works but removing fails, or vice versa',
              skip: 'Group membership management not available or test data missing'
            })
          },
          {
            id: 'TC-008',
            title: 'Deactivate Users',
            story: 'US-011 - Deactivate users who leave the organization',
            category: 'org-admin',
            priority: 'High',
            estimatedTime: '10 minutes',
            prerequisites: 'Organization Administrator access, Test users available',
            testSteps: JSON.stringify([
              'Log in as Organization Administrator',
              'Navigate to User Management',
              'Select a test user',
              'Click "Deactivate User"',
              'Confirm deactivation',
              'Verify user status changes to "Inactive"',
              'Verify user cannot log in',
              'Reactivate user',
              'Verify user status changes to "Active"'
            ]),
            acceptanceCriteria: JSON.stringify([
              'User can be deactivated',
              'User status changes correctly',
              'Deactivated user cannot access system',
              'User can be reactivated',
              'Status changes are saved'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All user activation/deactivation operations work correctly',
              fail: 'Deactivation fails or user still has access',
              blocked: 'Cannot access user management or test users unavailable',
              partial: 'Deactivation works but reactivation fails',
              skip: 'User management not available or deactivation feature disabled'
            })
          },
          {
            id: 'TC-009',
            title: 'View Group Memberships and Roles',
            story: 'US-012 - See which groups I belong to and what roles I have',
            category: 'org-member',
            priority: 'Medium',
            estimatedTime: '10 minutes',
            prerequisites: 'Organization Member access, User assigned to groups and roles',
            testSteps: JSON.stringify([
              'Log in as Organization Member',
              'Navigate to "My Profile" or "My Access"',
              'View "Group Memberships" section',
              'Verify all assigned groups are listed',
              'View "Role Assignments" section',
              'Verify all assigned roles are listed',
              'Check that permissions are visible',
              'Verify information is accurate and up-to-date'
            ]),
            acceptanceCriteria: JSON.stringify([
              'All group memberships are displayed',
              'All role assignments are shown',
              'Permissions are clearly visible',
              'Information is accurate and current',
              'Interface is user-friendly'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All membership and role information is displayed correctly',
              fail: 'Missing groups/roles or incorrect information displayed',
              blocked: 'Cannot access profile/access information',
              partial: 'Some information displayed but missing or incorrect',
              skip: 'Profile/access information not available or user not assigned to groups/roles'
            })
          },
          {
            id: 'TC-010',
            title: 'Request Group Membership',
            story: 'US-013 - Request to join groups I need access to',
            category: 'org-member',
            priority: 'Medium',
            estimatedTime: '15 minutes',
            prerequisites: 'Organization Member access, Groups available for joining',
            testSteps: JSON.stringify([
              'Log in as Organization Member',
              'Navigate to "Available Groups" or "Group Requests"',
              'Browse available groups',
              'Select a group to join',
              'Click "Request Membership"',
              'Add justification for request',
              'Submit request',
              'Verify request is submitted',
              'Check request status'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Available groups are listed',
              'Group request can be submitted',
              'Justification can be added',
              'Request status can be tracked',
              'Request is sent to appropriate approver'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Group request process works correctly',
              fail: 'Request submission fails or not processed',
              blocked: 'Cannot access group request functionality',
              partial: 'Request can be submitted but status tracking fails',
              skip: 'Group request functionality not available or no groups available'
            })
          },
          {
            id: 'TC-011',
            title: 'View Organization Hierarchy',
            story: 'US-014 - See the organization structure and my place in it',
            category: 'org-member',
            priority: 'Low',
            estimatedTime: '8 minutes',
            prerequisites: 'Organization Member access, Organization hierarchy configured',
            testSteps: JSON.stringify([
              'Log in as Organization Member',
              'Navigate to "Organization" or "Hierarchy" section',
              'View organization structure',
              'Locate your position in hierarchy',
              'Expand/collapse hierarchy levels',
              'Verify hierarchy information is accurate',
              'Check if you can see relevant organizational details'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Organization hierarchy is displayed',
              'User\'s position is clearly shown',
              'Hierarchy can be navigated',
              'Information is accurate',
              'Display is clear and understandable'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Organization hierarchy is displayed correctly with user\'s position',
              fail: 'Hierarchy not displayed or user position unclear',
              blocked: 'Cannot access organization information',
              partial: 'Hierarchy displayed but user position not clear',
              skip: 'Organization hierarchy not available or not configured'
            })
          },
          {
            id: 'TC-012',
            title: 'Update Personal Information',
            story: 'US-015 - Update my personal information and preferences',
            category: 'org-member',
            priority: 'Low',
            estimatedTime: '10 minutes',
            prerequisites: 'Organization Member access',
            testSteps: JSON.stringify([
              'Log in as Organization Member',
              'Navigate to "My Profile" or "Personal Settings"',
              'Update personal information (name, email, phone)',
              'Save changes',
              'Verify information is updated',
              'Update preferences (notifications, language)',
              'Save preference changes',
              'Verify preferences are saved'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Personal information can be updated',
              'Changes are saved successfully',
              'Updated information is displayed',
              'Preferences can be modified',
              'All changes persist after logout/login'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All personal information and preference updates work correctly',
              fail: 'Updates fail or changes not saved',
              blocked: 'Cannot access profile/settings',
              partial: 'Some updates work but others fail',
              skip: 'Profile/settings functionality not available'
            })
          },
          {
            id: 'TC-013',
            title: 'HR User Management',
            story: 'US-016 - Manage users for HR purposes',
            category: 'hr-admin',
            priority: 'High',
            estimatedTime: '25 minutes',
            prerequisites: 'HR Administrator access, Test users available',
            testSteps: JSON.stringify([
              'Log in as HR Administrator',
              'Navigate to HR User Management',
              'View user list with HR-specific information',
              'Update user employment status',
              'Modify user organizational assignments',
              'Update user role assignments',
              'Save changes',
              'Verify HR-specific information is updated'
            ]),
            acceptanceCriteria: JSON.stringify([
              'HR-specific user information is accessible',
              'Employment status can be updated',
              'Organizational assignments can be modified',
              'Role assignments can be changed',
              'Changes are saved and reflected correctly'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All HR user management operations work correctly',
              fail: 'HR operations fail or information not updated',
              blocked: 'Cannot access HR user management',
              partial: 'Some HR operations work but others fail',
              skip: 'HR user management not available or HR Administrator access not granted'
            })
          },
          {
            id: 'TC-014',
            title: 'Bulk HR Operations',
            story: 'US-017 - Perform bulk operations on multiple users',
            category: 'hr-admin',
            priority: 'Medium',
            estimatedTime: '20 minutes',
            prerequisites: 'HR Administrator access, Multiple test users available',
            testSteps: JSON.stringify([
              'Log in as HR Administrator',
              'Navigate to HR User Management',
              'Select multiple users',
              'Choose bulk operation (status change, role assignment)',
              'Configure bulk operation parameters',
              'Execute bulk operation',
              'Verify all selected users are affected',
              'Check operation results and logs'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Multiple users can be selected',
              'Bulk operations are available',
              'All selected users are processed',
              'Operation results are accurate',
              'Bulk operation logs are generated'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All bulk HR operations work correctly',
              fail: 'Bulk operations fail or partial processing',
              blocked: 'Cannot access bulk HR operations',
              partial: 'Some bulk operations work but others fail',
              skip: 'Bulk HR operations not available or insufficient test users'
            })
          },
          {
            id: 'TC-015',
            title: 'HR Reporting and Analytics',
            story: 'US-018 - Generate HR reports and view user analytics',
            category: 'hr-admin',
            priority: 'Medium',
            estimatedTime: '15 minutes',
            prerequisites: 'HR Administrator access, User data available for reporting',
            testSteps: JSON.stringify([
              'Log in as HR Administrator',
              'Navigate to HR Reports section',
              'Select report type (user count, role distribution, etc.)',
              'Configure report parameters',
              'Generate report',
              'View report results',
              'Export report if available',
              'Verify report accuracy'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Reports can be generated',
              'Report parameters can be configured',
              'Report results are accurate',
              'Reports can be exported',
              'Report data is up-to-date'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All HR reporting functionality works correctly',
              fail: 'Report generation fails or inaccurate results',
              blocked: 'Cannot access HR reporting',
              partial: 'Some reports work but others fail or inaccurate',
              skip: 'HR reporting not available or insufficient data for reports'
            })
          },
          {
            id: 'TC-016',
            title: 'End User Basic Operations',
            story: 'US-019 - Perform basic operations as end user',
            category: 'end-user',
            priority: 'Medium',
            estimatedTime: '15 minutes',
            prerequisites: 'End User access, Basic functionality available',
            testSteps: JSON.stringify([
              'Log in as End User',
              'Navigate to main dashboard',
              'View available features and options',
              'Access user profile',
              'View assigned groups and roles',
              'Test basic functionality access',
              'Verify user can perform allowed operations',
              'Check that restricted operations are blocked'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Dashboard is accessible',
              'Profile information is viewable',
              'Assigned groups and roles are visible',
              'Allowed operations work correctly',
              'Restricted operations are properly blocked'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All end user operations work correctly with proper access control',
              fail: 'Operations fail or access control not working',
              blocked: 'Cannot access end user functionality',
              partial: 'Some operations work but access control issues',
              skip: 'End user functionality not available or access not granted'
            })
          },
          {
            id: 'TC-017',
            title: 'Cross-Organization User Management',
            story: 'US-020 - Manage users across multiple organizations',
            category: 'cross-role',
            priority: 'High',
            estimatedTime: '30 minutes',
            prerequisites: 'Cross-role access, Multiple organizations available',
            testSteps: JSON.stringify([
              'Log in with cross-role access',
              'Navigate to Cross-Organization Management',
              'View users across organizations',
              'Create user in Organization A',
              'Assign same user to Organization B',
              'Verify user appears in both organizations',
              'Test cross-organization operations',
              'Verify proper access control'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Cross-organization user view works',
              'Users can be created across organizations',
              'Users can be assigned to multiple organizations',
              'Cross-organization operations work',
              'Access control is properly enforced'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All cross-organization operations work correctly',
              fail: 'Cross-organization operations fail or access control issues',
              blocked: 'Cannot access cross-organization functionality',
              partial: 'Some cross-organization operations work but others fail',
              skip: 'Cross-organization functionality not available or multiple organizations not configured'
            })
          },
          {
            id: 'TC-018',
            title: 'Role-Based Access Control Integration',
            story: 'US-021 - Test integration between different role types',
            category: 'integration',
            priority: 'High',
            estimatedTime: '25 minutes',
            prerequisites: 'Multiple role types available, Integration features enabled',
            testSteps: JSON.stringify([
              'Test System Admin role integration',
              'Test Organization Admin role integration',
              'Test HR Admin role integration',
              'Test cross-role interactions',
              'Verify role permissions work together',
              'Test role escalation scenarios',
              'Verify role conflicts are handled',
              'Check integration with external systems'
            ]),
            acceptanceCriteria: JSON.stringify([
              'All role types integrate properly',
              'Role permissions work together',
              'Role escalation works correctly',
              'Role conflicts are resolved properly',
              'External system integration works'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All role integrations work correctly',
              fail: 'Role integration fails or conflicts not resolved',
              blocked: 'Cannot test role integration',
              partial: 'Some role integrations work but others fail',
              skip: 'Role integration not available or insufficient role types'
            })
          },
          {
            id: 'TC-019',
            title: 'API Integration Testing',
            story: 'US-022 - Test API endpoints and external integrations',
            category: 'integration',
            priority: 'Medium',
            estimatedTime: '20 minutes',
            prerequisites: 'API access, External systems available',
            testSteps: JSON.stringify([
              'Test user creation API',
              'Test user update API',
              'Test group management API',
              'Test role assignment API',
              'Test authentication API',
              'Verify API responses',
              'Test error handling',
              'Check API documentation accuracy'
            ]),
            acceptanceCriteria: JSON.stringify([
              'All API endpoints respond correctly',
              'API responses are properly formatted',
              'Error handling works correctly',
              'API documentation is accurate',
              'External integrations work'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All API endpoints and integrations work correctly',
              fail: 'API endpoints fail or integrations broken',
              blocked: 'Cannot access API or external systems',
              partial: 'Some API endpoints work but others fail',
              skip: 'API testing not available or external systems unavailable'
            })
          },
          {
            id: 'TC-020',
            title: 'System Performance Under Load',
            story: 'US-023 - Test system performance with multiple users',
            category: 'performance',
            priority: 'Medium',
            estimatedTime: '30 minutes',
            prerequisites: 'Multiple test users, Performance testing tools',
            testSteps: JSON.stringify([
              'Create multiple test users',
              'Simulate concurrent user logins',
              'Test user creation under load',
              'Test group operations under load',
              'Monitor system performance',
              'Test database performance',
              'Check memory usage',
              'Verify response times'
            ]),
            acceptanceCriteria: JSON.stringify([
              'System handles concurrent users',
              'Response times are acceptable',
              'Database performance is good',
              'Memory usage is reasonable',
              'No system crashes or errors'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'System performs well under load',
              fail: 'Performance issues or system failures under load',
              blocked: 'Cannot perform load testing',
              partial: 'Some performance tests pass but others fail',
              skip: 'Performance testing not available or insufficient test users'
            })
          },
          {
            id: 'TC-021',
            title: 'Security Authentication Testing',
            story: 'US-024 - Test authentication and security features',
            category: 'security',
            priority: 'High',
            estimatedTime: '20 minutes',
            prerequisites: 'Security features enabled, Test accounts available',
            testSteps: JSON.stringify([
              'Test valid user login',
              'Test invalid password login',
              'Test account lockout after failed attempts',
              'Test password complexity requirements',
              'Test session timeout',
              'Test secure logout',
              'Test password reset functionality',
              'Verify security logs'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Valid logins work correctly',
              'Invalid logins are rejected',
              'Account lockout works',
              'Password requirements are enforced',
              'Session management works',
              'Security logs are generated'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All security features work correctly',
              fail: 'Security features fail or bypassed',
              blocked: 'Cannot test security features',
              partial: 'Some security features work but others fail',
              skip: 'Security testing not available or features disabled'
            })
          },
          {
            id: 'TC-022',
            title: 'Authorization and Permission Testing',
            story: 'US-025 - Test authorization and permission enforcement',
            category: 'security',
            priority: 'High',
            estimatedTime: '25 minutes',
            prerequisites: 'Multiple role types, Protected resources available',
            testSteps: JSON.stringify([
              'Test System Admin permissions',
              'Test Organization Admin permissions',
              'Test HR Admin permissions',
              'Test Organization Member permissions',
              'Test End User permissions',
              'Verify permission boundaries',
              'Test unauthorized access attempts',
              'Check permission escalation'
            ]),
            acceptanceCriteria: JSON.stringify([
              'All role permissions work correctly',
              'Permission boundaries are enforced',
              'Unauthorized access is blocked',
              'Permission escalation is prevented',
              'Access control is consistent'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All authorization and permission enforcement works correctly',
              fail: 'Authorization fails or permissions not enforced',
              blocked: 'Cannot test authorization',
              partial: 'Some permissions work but others fail',
              skip: 'Authorization testing not available or insufficient role types'
            })
          },
          {
            id: 'TC-023',
            title: 'Data Encryption and Privacy',
            story: 'US-026 - Test data encryption and privacy features',
            category: 'security',
            priority: 'Medium',
            estimatedTime: '15 minutes',
            prerequisites: 'Encryption features enabled, Sensitive data available',
            testSteps: JSON.stringify([
              'Test data encryption at rest',
              'Test data encryption in transit',
              'Test sensitive data masking',
              'Test data anonymization',
              'Verify encryption keys management',
              'Test data backup encryption',
              'Check privacy compliance',
              'Verify data retention policies'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Data is encrypted at rest',
              'Data is encrypted in transit',
              'Sensitive data is properly masked',
              'Encryption keys are managed securely',
              'Privacy compliance is maintained'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All encryption and privacy features work correctly',
              fail: 'Encryption fails or privacy not maintained',
              blocked: 'Cannot test encryption/privacy features',
              partial: 'Some encryption/privacy features work but others fail',
              skip: 'Encryption/privacy testing not available or features disabled'
            })
          },
          {
            id: 'TC-024',
            title: 'Advanced Group Management',
            story: 'US-027 - Test advanced group management features',
            category: 'advanced',
            priority: 'Medium',
            estimatedTime: '25 minutes',
            prerequisites: 'Advanced group features enabled, Complex group structures available',
            testSteps: JSON.stringify([
              'Create nested group structures',
              'Test group inheritance',
              'Test group-based workflows',
              'Test group automation rules',
              'Test group synchronization',
              'Test group conflict resolution',
              'Test group migration',
              'Verify group audit trails'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Nested groups work correctly',
              'Group inheritance functions properly',
              'Group workflows execute correctly',
              'Automation rules work',
              'Group synchronization is accurate',
              'Audit trails are complete'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All advanced group management features work correctly',
              fail: 'Advanced group features fail or not working',
              blocked: 'Cannot access advanced group features',
              partial: 'Some advanced features work but others fail',
              skip: 'Advanced group management not available or features disabled'
            })
          },
          {
            id: 'TC-025',
            title: 'Workflow Automation Testing',
            story: 'US-028 - Test automated workflows and business rules',
            category: 'advanced',
            priority: 'Medium',
            estimatedTime: '30 minutes',
            prerequisites: 'Workflow automation enabled, Business rules configured',
            testSteps: JSON.stringify([
              'Test user onboarding workflow',
              'Test role assignment automation',
              'Test group membership workflows',
              'Test approval workflows',
              'Test notification workflows',
              'Test escalation procedures',
              'Test workflow error handling',
              'Verify workflow audit logs'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Workflows execute automatically',
              'Business rules are enforced',
              'Approval processes work',
              'Notifications are sent',
              'Escalation procedures function',
              'Error handling works',
              'Audit logs are generated'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All workflow automation works correctly',
              fail: 'Workflows fail or automation not working',
              blocked: 'Cannot test workflow automation',
              partial: 'Some workflows work but others fail',
              skip: 'Workflow automation not available or not configured'
            })
          },
          {
            id: 'TC-026',
            title: 'Audit Trail and Compliance',
            story: 'US-029 - Test audit trails and compliance reporting',
            category: 'advanced',
            priority: 'High',
            estimatedTime: '20 minutes',
            prerequisites: 'Audit logging enabled, Compliance features available',
            testSteps: JSON.stringify([
              'Perform various user operations',
              'Check audit trail generation',
              'Test audit log search',
              'Test compliance reporting',
              'Test data retention policies',
              'Test audit log export',
              'Verify audit log integrity',
              'Test compliance dashboard'
            ]),
            acceptanceCriteria: JSON.stringify([
              'All operations are logged',
              'Audit logs are searchable',
              'Compliance reports are accurate',
              'Data retention policies work',
              'Audit logs can be exported',
              'Log integrity is maintained'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All audit and compliance features work correctly',
              fail: 'Audit logging fails or compliance issues',
              blocked: 'Cannot test audit/compliance features',
              partial: 'Some audit/compliance features work but others fail',
              skip: 'Audit/compliance testing not available or features disabled'
            })
          },
          {
            id: 'TC-027',
            title: 'Multi-Tenant Architecture Testing',
            story: 'US-030 - Test multi-tenant architecture and data isolation',
            category: 'advanced',
            priority: 'High',
            estimatedTime: '35 minutes',
            prerequisites: 'Multi-tenant architecture, Multiple tenants available',
            testSteps: JSON.stringify([
              'Test tenant data isolation',
              'Test cross-tenant access prevention',
              'Test tenant-specific configurations',
              'Test tenant resource allocation',
              'Test tenant migration',
              'Test tenant backup/restore',
              'Test tenant monitoring',
              'Verify tenant security boundaries'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Tenant data is properly isolated',
              'Cross-tenant access is prevented',
              'Tenant configurations work',
              'Resource allocation is correct',
              'Tenant migration works',
              'Security boundaries are maintained'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All multi-tenant features work correctly',
              fail: 'Multi-tenant architecture fails or data isolation issues',
              blocked: 'Cannot test multi-tenant features',
              partial: 'Some multi-tenant features work but others fail',
              skip: 'Multi-tenant architecture not available or insufficient tenants'
            })
          },
          {
            id: 'TC-028',
            title: 'Disaster Recovery Testing',
            story: 'US-031 - Test disaster recovery and backup procedures',
            category: 'advanced',
            priority: 'High',
            estimatedTime: '40 minutes',
            prerequisites: 'Backup systems available, Disaster recovery procedures configured',
            testSteps: JSON.stringify([
              'Test data backup procedures',
              'Test backup restoration',
              'Test system failover',
              'Test data replication',
              'Test recovery time objectives',
              'Test recovery point objectives',
              'Test disaster recovery procedures',
              'Verify data integrity after recovery'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Backups are created successfully',
              'Restoration works correctly',
              'Failover procedures function',
              'Data replication is accurate',
              'Recovery objectives are met',
              'Data integrity is maintained'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'All disaster recovery procedures work correctly',
              fail: 'Disaster recovery fails or procedures not working',
              blocked: 'Cannot test disaster recovery',
              partial: 'Some disaster recovery procedures work but others fail',
              skip: 'Disaster recovery testing not available or procedures not configured'
            })
          },
          {
            id: 'TC-029',
            title: 'Group-Based Authorization Testing',
            story: 'ADR Compliance - Test authorization based on group membership',
            category: 'adr-compliance',
            priority: 'High',
            estimatedTime: '25 minutes',
            prerequisites: 'Group-based authorization enabled, Protected resources available',
            testSteps: JSON.stringify([
              'Create user without group memberships',
              'Attempt to access protected resources',
              'Verify access is denied',
              'Add user to group with appropriate permissions',
              'Attempt to access same resources',
              'Verify access is granted',
              'Remove user from group',
              'Attempt to access resources again',
              'Verify access is denied'
            ]),
            acceptanceCriteria: JSON.stringify([
              'Users without group memberships are denied access',
              'Group membership grants appropriate access',
              'Removing group membership revokes access',
              'Authorization decisions are based on group membership',
              'Access control works correctly'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Group-based authorization works correctly per ADR specification',
              fail: 'Authorization not based on group membership or access control fails',
              blocked: 'Cannot test authorization or protected resources unavailable',
              partial: 'Basic authorization works but group membership changes not reflected',
              skip: 'Authorization testing not available or group-based access control not implemented'
            })
          },
          {
            id: 'TC-030',
            title: 'Cross-Organization User Association',
            story: 'ADR Compliance - Test users can be associated with multiple organizations',
            category: 'adr-compliance',
            priority: 'High',
            estimatedTime: '15 minutes',
            prerequisites: 'System Administrator access, Multiple test organizations available',
            testSteps: JSON.stringify([
              'Log in as System Administrator',
              'Create user',
              'Associate user with Organization A',
              'Associate same user with Organization B',
              'Verify user appears in both organizations',
              'Test user can switch between organizations',
              'Verify user\'s groups and roles are organization-specific',
              'Test user access in each organization context'
            ]),
            acceptanceCriteria: JSON.stringify([
              'User can be associated with multiple organizations',
              'User appears in both organization user lists',
              'User can switch between organizations',
              'Groups and roles are organization-specific',
              'Access is properly scoped per organization'
            ]),
            statusGuidance: JSON.stringify({
              pass: 'Cross-organization user association works correctly per ADR specification',
              fail: 'Users cannot be associated with multiple organizations or scoping fails',
              blocked: 'Cannot access user management or multiple organizations unavailable',
              partial: 'User association works but organization scoping fails',
              skip: 'Multi-organization support not available or cross-organization association not implemented'
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
