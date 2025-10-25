const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '../../data', 'test-tracker.db');
    }

    // Initialize database connection and create tables
    async init() {
        try {
            // Ensure data directory exists
            await fs.ensureDir(path.dirname(this.dbPath));
            
            // Create database connection
            this.db = new sqlite3.Database(this.dbPath);
            
            // Create tables
            await this.createTables();
            
            console.log('📊 Database initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            return false;
        }
    }

    // Create all necessary tables
    async createTables() {
        return new Promise((resolve, reject) => {
            const tableQueries = [
                // Users table
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,

                // Tests table
                `CREATE TABLE IF NOT EXISTS tests (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    story TEXT,
                    category TEXT,
                    priority TEXT,
                    estimated_time TEXT,
                    prerequisites TEXT,
                    test_steps TEXT,
                    acceptance_criteria TEXT,
                    status_guidance TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,

                // Test results table
                `CREATE TABLE IF NOT EXISTS test_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    test_id TEXT NOT NULL,
                    user_id INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    test_date DATE,
                    environment TEXT,
                    notes TEXT,
                    bug_severity TEXT,
                    bug_description TEXT,
                    steps_to_reproduce TEXT,
                    expected_result TEXT,
                    actual_result TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (test_id) REFERENCES tests (id),
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )`
            ];

            // First create all tables
            let completed = 0;
            tableQueries.forEach((query, index) => {
                this.db.run(query, (err) => {
                    if (err) {
                        console.error(`❌ Error creating table ${index}:`, err);
                        reject(err);
                        return;
                    }
                    completed++;
                    if (completed === tableQueries.length) {
                        console.log('✅ All database tables created successfully');
                        
                        // Now create indexes
                        const indexQueries = [
                            `CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results (test_id)`,
                            `CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results (user_id)`,
                            `CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results (status)`
                        ];
                        
                        let indexCompleted = 0;
                        indexQueries.forEach((query, index) => {
                            this.db.run(query, (err) => {
                                if (err) {
                                    console.error(`❌ Error creating index ${index}:`, err);
                                    reject(err);
                                    return;
                                }
                                indexCompleted++;
                                if (indexCompleted === indexQueries.length) {
                                    console.log('✅ All database indexes created successfully');
                                    resolve();
                                }
                            });
                        });
                    }
                });
            });
        });
    }

    // USER OPERATIONS

    // Get all users
    async getUsers() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get user by ID
    async getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Get user by name
    async getUserByName(name) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE name = ?', [name], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Create a new user
    async createUser(name) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO users (name) VALUES (?)', [name], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, name });
                }
            });
        });
    }

    // Update user
    async updateUser(id, name) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
                [name, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, name, changes: this.changes });
                }
            });
        });
    }

    // Delete user
    async deleteUser(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // TEST OPERATIONS

    // Get all tests
    async getTests() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM tests ORDER BY id ASC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Parse JSON fields
                    const tests = rows.map(row => ({
                        ...row,
                        test_steps: row.test_steps ? JSON.parse(row.test_steps) : [],
                        acceptance_criteria: row.acceptance_criteria ? JSON.parse(row.acceptance_criteria) : [],
                        status_guidance: row.status_guidance ? JSON.parse(row.status_guidance) : {}
                    }));
                    resolve(tests);
                }
            });
        });
    }

    // Get test by ID
    async getTestById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM tests WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    // Parse JSON fields
                    const test = {
                        ...row,
                        test_steps: row.test_steps ? JSON.parse(row.test_steps) : [],
                        acceptance_criteria: row.acceptance_criteria ? JSON.parse(row.acceptance_criteria) : [],
                        status_guidance: row.status_guidance ? JSON.parse(row.status_guidance) : {}
                    };
                    resolve(test);
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Create a new test
    async createTest(testData) {
        return new Promise((resolve, reject) => {
            const {
                id, title, story, category, priority, estimatedTime, prerequisites,
                testSteps, acceptanceCriteria, statusGuidance
            } = testData;

            this.db.run(
                `INSERT INTO tests (id, title, story, category, priority, estimated_time, 
                 prerequisites, test_steps, acceptance_criteria, status_guidance) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id, title, story, category, priority, estimatedTime, prerequisites,
                    JSON.stringify(testSteps), JSON.stringify(acceptanceCriteria), JSON.stringify(statusGuidance)
                ],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...testData });
                    }
                }
            );
        });
    }

    // Update test
    async updateTest(id, testData) {
        return new Promise((resolve, reject) => {
            const {
                title, story, category, priority, estimatedTime, prerequisites,
                testSteps, acceptanceCriteria, statusGuidance
            } = testData;

            this.db.run(
                `UPDATE tests SET title = ?, story = ?, category = ?, priority = ?, 
                 estimated_time = ?, prerequisites = ?, test_steps = ?, 
                 acceptance_criteria = ?, status_guidance = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [
                    title, story, category, priority, estimatedTime, prerequisites,
                    JSON.stringify(testSteps), JSON.stringify(acceptanceCriteria), 
                    JSON.stringify(statusGuidance), id
                ],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...testData, changes: this.changes });
                    }
                }
            );
        });
    }

    // Delete test
    async deleteTest(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM tests WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // Clear all tests (for migration purposes)
    async clearAllTests() {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM tests', function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // TEST RESULTS OPERATIONS

    // Get all test results
    async getTestResults() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT tr.*, u.name as user_name, t.title as test_title 
                FROM test_results tr
                JOIN users u ON tr.user_id = u.id
                JOIN tests t ON tr.test_id = t.id
                ORDER BY tr.created_at DESC
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get test results by test ID
    async getTestResultsByTestId(testId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT tr.*, u.name as user_name 
                FROM test_results tr
                JOIN users u ON tr.user_id = u.id
                WHERE tr.test_id = ?
                ORDER BY tr.created_at DESC
            `, [testId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get test results by user ID
    async getTestResultsByUserId(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT tr.*, t.title as test_title 
                FROM test_results tr
                JOIN tests t ON tr.test_id = t.id
                WHERE tr.user_id = ?
                ORDER BY tr.created_at DESC
            `, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Create a new test result
    async createTestResult(resultData) {
        return new Promise((resolve, reject) => {
            const {
                testId, userId, status, testDate, environment, notes,
                bugSeverity, bugDescription, stepsToReproduce, expectedResult, actualResult
            } = resultData;

            this.db.run(
                `INSERT INTO test_results (test_id, user_id, status, test_date, environment, 
                 notes, bug_severity, bug_description, steps_to_reproduce, expected_result, actual_result) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    testId, userId, status, testDate, environment, notes,
                    bugSeverity, bugDescription, stepsToReproduce, expectedResult, actualResult
                ],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, ...resultData });
                    }
                }
            );
        });
    }

    // Update test result
    async updateTestResult(id, resultData) {
        return new Promise((resolve, reject) => {
            const {
                status, testDate, environment, notes,
                bugSeverity, bugDescription, stepsToReproduce, expectedResult, actualResult
            } = resultData;

            this.db.run(
                `UPDATE test_results SET status = ?, test_date = ?, environment = ?, 
                 notes = ?, bug_severity = ?, bug_description = ?, steps_to_reproduce = ?, 
                 expected_result = ?, actual_result = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [
                    status, testDate, environment, notes,
                    bugSeverity, bugDescription, stepsToReproduce, expectedResult, actualResult, id
                ],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...resultData, changes: this.changes });
                    }
                }
            );
        });
    }

    // Delete test result
    async deleteTestResult(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM test_results WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // UTILITY METHODS

    // Get test statistics
    async getTestStats() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    COUNT(*) as total_tests,
                    COUNT(CASE WHEN tr.status = 'pass' THEN 1 END) as passed_tests,
                    COUNT(CASE WHEN tr.status = 'fail' THEN 1 END) as failed_tests,
                    COUNT(CASE WHEN tr.status = 'blocked' THEN 1 END) as blocked_tests,
                    COUNT(CASE WHEN tr.status = 'partial' THEN 1 END) as partial_tests,
                    COUNT(CASE WHEN tr.status = 'skip' THEN 1 END) as skipped_tests
                FROM tests t
                LEFT JOIN test_results tr ON t.id = tr.test_id
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });
        });
    }

    // Get user statistics
    async getUserStats(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    COUNT(*) as total_tests,
                    COUNT(CASE WHEN tr.status = 'pass' THEN 1 END) as passed_tests,
                    COUNT(CASE WHEN tr.status = 'fail' THEN 1 END) as failed_tests,
                    COUNT(CASE WHEN tr.status = 'blocked' THEN 1 END) as blocked_tests,
                    COUNT(CASE WHEN tr.status = 'partial' THEN 1 END) as partial_tests,
                    COUNT(CASE WHEN tr.status = 'skip' THEN 1 END) as skipped_tests
                FROM test_results tr
                WHERE tr.user_id = ?
            `, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });
        });
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('❌ Error closing database:', err);
                } else {
                    console.log('📊 Database connection closed');
                }
            });
        }
    }
}

module.exports = Database;
