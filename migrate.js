const Database = require('./database');
const fs = require('fs-extra');
const path = require('path');

class DataMigration {
    constructor() {
        this.db = new Database();
        this.oldDataFile = path.join(__dirname, 'data', 'test-data.json');
    }

    async migrate() {
        try {
            console.log('🔄 Starting data migration...');
            
            // Initialize database
            const dbInitialized = await this.db.init();
            if (!dbInitialized) {
                throw new Error('Failed to initialize database');
            }

            // Check if old data file exists
            if (!fs.existsSync(this.oldDataFile)) {
                console.log('📁 No old data file found. Migration not needed.');
                return;
            }

            // Load old data
            const oldData = fs.readJsonSync(this.oldDataFile);
            console.log('📖 Loaded old data file');

            // Migrate users
            if (oldData.testUsers && oldData.testUsers.length > 0) {
                console.log(`👥 Migrating ${oldData.testUsers.length} users...`);
                for (const user of oldData.testUsers) {
                    try {
                        await this.db.createUser(user.name);
                        console.log(`✅ Migrated user: ${user.name}`);
                    } catch (error) {
                        if (error.message.includes('UNIQUE constraint failed')) {
                            console.log(`⚠️  User already exists: ${user.name}`);
                        } else {
                            console.error(`❌ Failed to migrate user ${user.name}:`, error.message);
                        }
                    }
                }
            }

            // Migrate tests
            if (oldData.testCases && oldData.testCases.length > 0) {
                console.log(`🧪 Migrating ${oldData.testCases.length} tests...`);
                for (const test of oldData.testCases) {
                    try {
                        const testData = {
                            id: test.id,
                            title: test.title,
                            story: test.story,
                            category: test.category,
                            priority: test.priority,
                            estimatedTime: test.estimatedTime,
                            prerequisites: test.prerequisites,
                            testSteps: test.testSteps || [],
                            acceptanceCriteria: test.acceptanceCriteria || [],
                            statusGuidance: test.statusGuidance || {}
                        };
                        
                        await this.db.createTest(testData);
                        console.log(`✅ Migrated test: ${test.id}`);
                    } catch (error) {
                        if (error.message.includes('UNIQUE constraint failed')) {
                            console.log(`⚠️  Test already exists: ${test.id}`);
                        } else {
                            console.error(`❌ Failed to migrate test ${test.id}:`, error.message);
                        }
                    }
                }
            }

            // Migrate test results
            if (oldData.testCases && oldData.testCases.length > 0) {
                console.log('📊 Migrating test results...');
                let totalResults = 0;
                
                for (const test of oldData.testCases) {
                    if (test.userResults && test.userResults.length > 0) {
                        for (const result of test.userResults) {
                            try {
                                // Find user ID by name
                                const user = await this.db.getUserByName(result.tester);
                                if (!user) {
                                    console.log(`⚠️  User not found for result: ${result.tester}`);
                                    continue;
                                }

                                const resultData = {
                                    testId: test.id,
                                    userId: user.id,
                                    status: result.status,
                                    testDate: result.date,
                                    environment: result.environment,
                                    notes: result.notes,
                                    bugSeverity: result.bugSeverity,
                                    bugDescription: result.bugDescription,
                                    stepsToReproduce: result.stepsToReproduce,
                                    expectedResult: result.expectedResult,
                                    actualResult: result.actualResult
                                };

                                await this.db.createTestResult(resultData);
                                totalResults++;
                            } catch (error) {
                                console.error(`❌ Failed to migrate test result for ${test.id}:`, error.message);
                            }
                        }
                    }
                }
                
                console.log(`✅ Migrated ${totalResults} test results`);
            }

            console.log('🎉 Data migration completed successfully!');
            
            // Backup old data file
            const backupFile = this.oldDataFile + '.backup';
            fs.copySync(this.oldDataFile, backupFile);
            console.log(`💾 Old data backed up to: ${backupFile}`);

        } catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        } finally {
            this.db.close();
        }
    }

    async seedInitialData() {
        try {
            console.log('🌱 Seeding initial data...');
            
            // Initialize database
            const dbInitialized = await this.db.init();
            if (!dbInitialized) {
                throw new Error('Failed to initialize database');
            }

            // Check if data already exists
            const existingTests = await this.db.getTests();
            if (existingTests.length > 0) {
                console.log('📊 Database already contains data. Skipping seed.');
                return;
            }

            // Seed initial test data from frontend
            const initialTests = [
                {
                    id: 'TC-001',
                    title: 'Create Users Across Organizations',
                    story: 'US-001 - Create and manage users across all organizations',
                    category: 'system-admin',
                    priority: 'High',
                    estimatedTime: '15 minutes',
                    prerequisites: 'System Administrator access, Test organizations available',
                    testSteps: [
                        'Navigate to User Management section',
                        'Click "Create New User" button',
                        'Fill in user details (name, email, organization)',
                        'Select appropriate role and permissions',
                        'Save user and verify creation'
                    ],
                    acceptanceCriteria: [
                        'User is created successfully',
                        'User appears in organization user list',
                        'User receives welcome email',
                        'User can log in with provided credentials'
                    ],
                    statusGuidance: {
                        pass: 'User creation works as expected',
                        fail: 'User creation fails or has issues',
                        blocked: 'Cannot access user management or missing permissions',
                        partial: 'User created but some features not working',
                        skip: 'Test not applicable or environment issues'
                    }
                },
                {
                    id: 'TC-002',
                    title: 'User Role Assignment',
                    story: 'US-002 - Assign and modify user roles within organizations',
                    category: 'system-admin',
                    priority: 'High',
                    estimatedTime: '10 minutes',
                    prerequisites: 'Existing users, Admin access',
                    testSteps: [
                        'Navigate to user profile',
                        'Click "Edit Roles" button',
                        'Select new role from dropdown',
                        'Save changes',
                        'Verify role update'
                    ],
                    acceptanceCriteria: [
                        'Role is updated successfully',
                        'User permissions reflect new role',
                        'Changes are logged in audit trail'
                    ],
                    statusGuidance: {
                        pass: 'Role assignment works correctly',
                        fail: 'Role assignment fails or incorrect permissions',
                        blocked: 'Cannot access role management',
                        partial: 'Role updated but some permissions missing',
                        skip: 'Test not applicable'
                    }
                }
            ];

            // Create initial tests
            for (const test of initialTests) {
                await this.db.createTest(test);
                console.log(`✅ Seeded test: ${test.id}`);
            }

            console.log('🌱 Initial data seeding completed!');

        } catch (error) {
            console.error('❌ Seeding failed:', error);
            throw error;
        } finally {
            this.db.close();
        }
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    const migration = new DataMigration();
    
    const command = process.argv[2];
    
    if (command === 'seed') {
        migration.seedInitialData()
            .then(() => {
                console.log('✅ Seeding completed');
                process.exit(0);
            })
            .catch((error) => {
                console.error('❌ Seeding failed:', error);
                process.exit(1);
            });
    } else {
        migration.migrate()
            .then(() => {
                console.log('✅ Migration completed');
                process.exit(0);
            })
            .catch((error) => {
                console.error('❌ Migration failed:', error);
                process.exit(1);
            });
    }
}

module.exports = DataMigration;
