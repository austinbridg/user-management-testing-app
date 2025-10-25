const Database = require('./database');
const fs = require('fs-extra');
const path = require('path');

class DataMigration {
    constructor() {
        this.db = new Database();
        this.dataDir = path.join(__dirname, 'data');
        this.workDir = path.join(__dirname, 'work');
    }

    async migrate() {
        try {
            console.log('🔄 Starting data migration...');
            
            // Initialize database
            const dbInitialized = await this.db.init();
            if (!dbInitialized) {
                throw new Error('Failed to initialize database');
            }

            // Check for existing data files
            const oldDataFile = path.join(this.dataDir, 'test-data.json');
            const backupFile = path.join(this.dataDir, 'test-data.json.backup');
            
            if (await fs.pathExists(oldDataFile)) {
                console.log('📁 Found existing data file, creating backup...');
                await fs.copy(oldDataFile, backupFile);
                console.log('✅ Backup created at:', backupFile);
            }

            console.log('✅ Migration completed successfully');
            return true;
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            return false;
        }
    }

    async seedFromWorkDirectory() {
        try {
            console.log('🌱 Seeding database from work directory...');
            
            // Initialize database
            const dbInitialized = await this.db.init();
            if (!dbInitialized) {
                throw new Error('Failed to initialize database');
            }

            // Look for test case files in work directory
            const testCaseFiles = [
                'user-management-test-cases-app-format.js',
                'user-management-test-cases-comprehensive-docs.md'
            ];

            let seededCount = 0;

            for (const fileName of testCaseFiles) {
                const filePath = path.join(this.workDir, fileName);
                
                if (await fs.pathExists(filePath)) {
                    console.log(`📄 Processing ${fileName}...`);
                    
                    if (fileName.endsWith('.js')) {
                        seededCount += await this.seedFromJavaScript(filePath);
                    } else if (fileName.endsWith('.md')) {
                        seededCount += await this.seedFromMarkdown(filePath);
                    }
                }
            }

            console.log(`✅ Seeded ${seededCount} test cases from work directory`);
            return seededCount;
        } catch (error) {
            console.error('❌ Seeding from work directory failed:', error.message);
            return 0;
        }
    }

    async seedFromJavaScript(filePath) {
        try {
            // Initialize database
            const dbInitialized = await this.db.init();
            if (!dbInitialized) {
                throw new Error('Failed to initialize database');
            }
            
            // Clear existing tests
            await this.db.clearAllTests();
            
            // Load and execute the JavaScript file
            const absolutePath = path.resolve(filePath);
            const testCasesModule = require(absolutePath);
            const testCases = testCasesModule.testCases || testCasesModule.userManagementTestCases || testCasesModule;
            
            if (!Array.isArray(testCases)) {
                throw new Error('Test cases must be an array');
            }

            let seededCount = 0;
            for (const testCase of testCases) {
                try {
                    await this.db.createTest(testCase);
                    seededCount++;
                } catch (error) {
                    console.warn(`⚠️ Failed to seed test ${testCase.id}:`, error.message);
                }
            }

            console.log(`✅ Seeded ${seededCount} test cases from JavaScript file`);
            return seededCount;
        } catch (error) {
            console.error('❌ Failed to seed from JavaScript file:', error.message);
            return 0;
        }
    }

    async seedFromMarkdown(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            
            // Parse markdown test cases
            const testCases = this.parseMarkdownTestCases(content);
            
            if (testCases.length === 0) {
                console.log('ℹ️ No test cases found in markdown file');
                return 0;
            }

            // Clear existing tests
            await this.db.clearAllTests();
            
            let seededCount = 0;
            for (const testCase of testCases) {
                try {
                    await this.db.createTest(testCase);
                    seededCount++;
                } catch (error) {
                    console.warn(`⚠️ Failed to seed test ${testCase.id}:`, error.message);
                }
            }

            console.log(`✅ Seeded ${seededCount} test cases from markdown file`);
            return seededCount;
        } catch (error) {
            console.error('❌ Failed to seed from markdown file:', error.message);
            return 0;
        }
    }

    parseMarkdownTestCases(content) {
        const testCases = [];
        const lines = content.split('\n');
        
        let currentTestCase = null;
        let inTestCase = false;
        let testSteps = [];
        let acceptanceCriteria = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Look for test case headers (## TC-XXX or ### TC-XXX)
            if (line.match(/^#{2,3}\s+TC-[\w-]+/)) {
                // Save previous test case if exists
                if (currentTestCase) {
                    currentTestCase.testSteps = testSteps;
                    currentTestCase.acceptanceCriteria = acceptanceCriteria;
                    testCases.push(currentTestCase);
                }
                
                // Start new test case
                const match = line.match(/^#{2,3}\s+(TC-[\w-]+):\s*(.+)/);
                if (match) {
                    currentTestCase = {
                        id: match[1],
                        title: match[2],
                        story: '',
                        category: 'manual',
                        priority: 'medium',
                        estimatedTime: '15 minutes',
                        prerequisites: '',
                        testSteps: [],
                        acceptanceCriteria: [],
                        statusGuidance: {
                            pass: 'Test passes when all acceptance criteria are met',
                            fail: 'Test fails if any acceptance criteria is not met',
                            skip: 'Test can be skipped if prerequisites are not met'
                        }
                    };
                    testSteps = [];
                    acceptanceCriteria = [];
                    inTestCase = true;
                }
            }
            
            // Parse test case content
            if (inTestCase && currentTestCase) {
                if (line.startsWith('**Story:**')) {
                    currentTestCase.story = line.replace('**Story:**', '').trim();
                } else if (line.startsWith('**Category:**')) {
                    currentTestCase.category = line.replace('**Category:**', '').trim().toLowerCase();
                } else if (line.startsWith('**Priority:**')) {
                    currentTestCase.priority = line.replace('**Priority:**', '').trim().toLowerCase();
                } else if (line.startsWith('**Estimated Time:**')) {
                    currentTestCase.estimatedTime = line.replace('**Estimated Time:**', '').trim();
                } else if (line.startsWith('**Prerequisites:**')) {
                    currentTestCase.prerequisites = line.replace('**Prerequisites:**', '').trim();
                } else if (line.startsWith('**Test Steps:**')) {
                    // Parse test steps
                    i++;
                    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('**')) {
                        const step = lines[i].trim();
                        if (step.match(/^\d+\./)) {
                            testSteps.push(step);
                        }
                        i++;
                    }
                    i--; // Adjust for loop increment
                } else if (line.startsWith('**Acceptance Criteria:**')) {
                    // Parse acceptance criteria
                    i++;
                    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('**')) {
                        const criteria = lines[i].trim();
                        if (criteria.startsWith('-') || criteria.startsWith('*')) {
                            acceptanceCriteria.push(criteria.substring(1).trim());
                        }
                        i++;
                    }
                    i--; // Adjust for loop increment
                }
            }
        }
        
        // Add last test case
        if (currentTestCase) {
            currentTestCase.testSteps = testSteps;
            currentTestCase.acceptanceCriteria = acceptanceCriteria;
            testCases.push(currentTestCase);
        }
        
        return testCases;
    }

    async clearTests() {
        try {
            console.log('🗑️ Clearing existing tests...');
            await this.db.clearAllTests();
            console.log('✅ Tests cleared successfully');
        } catch (error) {
            console.error('❌ Failed to clear tests:', error.message);
            throw error;
        }
    }

    async generateTestReport() {
        try {
            console.log('📊 Generating test report...');
            
            // Initialize database
            const dbInitialized = await this.db.init();
            if (!dbInitialized) {
                throw new Error('Failed to initialize database');
            }
            
            const tests = await this.db.getTests();
            const users = await this.db.getUsers();
            const testResults = await this.db.getTestResults();
            
            const report = {
                generatedAt: new Date().toISOString(),
                summary: {
                    totalTests: tests.length,
                    totalUsers: users.length,
                    totalResults: testResults.length
                },
                tests: tests.map(test => ({
                    id: test.id,
                    title: test.title,
                    category: test.category,
                    priority: test.priority
                })),
                users: users.map(user => ({
                    id: user.id,
                    name: user.name
                }))
            };
            
            const reportPath = path.join(this.dataDir, 'test-report.json');
            await fs.writeJson(reportPath, report, { spaces: 2 });
            
            console.log('✅ Test report generated at:', reportPath);
            return reportPath;
        } catch (error) {
            console.error('❌ Failed to generate test report:', error.message);
            return null;
        }
    }
}

// CLI interface
async function main() {
    const migration = new DataMigration();
    const command = process.argv[2];
    
    switch (command) {
        case 'migrate':
            await migration.migrate();
            break;
            
        case 'seed':
            const source = process.argv[3] || 'work';
            if (source === 'work') {
                await migration.seedFromWorkDirectory();
            } else {
                console.log('❌ Unknown seed source:', source);
                process.exit(1);
            }
            break;
            
        case 'seed-js':
            const jsFile = process.argv[3];
            if (!jsFile) {
                console.log('❌ Please provide JavaScript file path');
                process.exit(1);
            }
            await migration.seedFromJavaScript(jsFile);
            break;
            
        case 'seed-md':
            const mdFile = process.argv[3];
            if (!mdFile) {
                console.log('❌ Please provide markdown file path');
                process.exit(1);
            }
            await migration.seedFromMarkdown(mdFile);
            break;
            
        case 'clear':
            await migration.clearTests();
            break;
            
        case 'report':
            await migration.generateTestReport();
            break;
            
        default:
            console.log(`
🔄 Data Migration Tool

Usage:
  node migrate.js migrate                    # Migrate existing data
  node migrate.js seed                       # Seed from work directory
  node migrate.js seed-js <file>            # Seed from JavaScript file
  node migrate.js seed-md <file>             # Seed from markdown file
  node migrate.js clear                      # Clear all tests
  node migrate.js report                     # Generate test report

Examples:
  node migrate.js seed-js work/user-management-test-cases-app-format.js
  node migrate.js seed-md work/user-management-test-cases-comprehensive-docs.md
            `);
            break;
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = DataMigration;
