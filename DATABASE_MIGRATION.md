# Database Migration Guide

This document outlines the migration from frontend localStorage to a proper backend database system using SQLite.

## Overview

The application has been migrated from storing all data in the browser's localStorage to using a SQLite database on the backend. This provides better data persistence, scalability, and separation of concerns.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tests Table
```sql
CREATE TABLE tests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    story TEXT,
    category TEXT,
    priority TEXT,
    estimated_time TEXT,
    prerequisites TEXT,
    test_steps TEXT,           -- JSON array
    acceptance_criteria TEXT,  -- JSON array
    status_guidance TEXT,      -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Test Results Table
```sql
CREATE TABLE test_results (
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
);
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tests
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get test by ID
- `POST /api/tests` - Create new test
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test

### Test Results
- `GET /api/test-results` - Get all test results
- `GET /api/tests/:id/results` - Get test results by test ID
- `GET /api/users/:id/results` - Get test results by user ID
- `POST /api/test-results` - Create new test result
- `PUT /api/test-results/:id` - Update test result
- `DELETE /api/test-results/:id` - Delete test result

### Statistics
- `GET /api/stats` - Get overall test statistics
- `GET /api/users/:id/stats` - Get user-specific statistics

## Migration Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Migration
To migrate existing data from localStorage/JSON files:
```bash
npm run migrate
```

### 3. Seed Initial Data (Optional)
To populate the database with initial test data:
```bash
npm run seed
```

### 4. Start Server
```bash
npm start
```

## Data Migration Details

The migration script (`migrate.js`) performs the following operations:

1. **Initialize Database**: Creates SQLite database and tables
2. **Migrate Users**: Converts localStorage users to database records
3. **Migrate Tests**: Converts test definitions to database records
4. **Migrate Test Results**: Converts test results with proper user/test relationships
5. **Backup Old Data**: Creates backup of original data files

## Frontend Changes

### API Client
A new `APIClient` class has been added to handle all database operations:

```javascript
const api = new APIClient();

// Examples
const users = await api.getUsers();
const newUser = await api.createUser('John Doe');
const tests = await api.getTests();
const testResult = await api.createTestResult(resultData);
```

### Backward Compatibility
The old `/api/data` endpoints are maintained for backward compatibility, but individual CRUD endpoints are recommended for better performance.

## Benefits of Database Migration

1. **Data Persistence**: Data survives browser refreshes and is shared across sessions
2. **Scalability**: Can handle larger datasets without browser memory limitations
3. **Data Integrity**: Foreign key constraints ensure data consistency
4. **Performance**: Indexed queries for faster data retrieval
5. **Concurrent Access**: Multiple users can access the same data simultaneously
6. **Backup & Recovery**: Database can be backed up and restored
7. **Analytics**: Better support for reporting and statistics

## File Structure

```
├── database.js          # Database class and operations
├── migrate.js           # Data migration script
├── server.js            # Updated server with database endpoints
├── package.json         # Updated dependencies
└── data/
    ├── test-tracker.db  # SQLite database file
    └── test-data.json.backup  # Backup of old data
```

## Troubleshooting

### Database Connection Issues
- Ensure the `data` directory exists and is writable
- Check file permissions for database creation

### Migration Failures
- Check console output for specific error messages
- Verify old data file format is correct
- Ensure all required fields are present

### API Errors
- Check server logs for detailed error information
- Verify request format matches API documentation
- Ensure proper error handling in frontend code

## Performance Considerations

- Database queries are optimized with indexes
- JSON fields are used for complex data structures
- Foreign key relationships maintain data integrity
- Async/await pattern ensures non-blocking operations

## Security Notes

- Input validation is performed on all API endpoints
- SQL injection protection through parameterized queries
- Error messages don't expose sensitive information
- CORS is properly configured for cross-origin requests
