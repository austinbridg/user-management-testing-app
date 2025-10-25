# Database Migration & Test Case Management Guide

This guide covers how to migrate data and manage test cases using the automated migration system.

## 🚀 Quick Start

### Basic Migration Commands
```bash
# Migrate existing data (creates backup)
npm run migrate

# Seed from work directory (automatically detects JS/MD files)
npm run seed

# Clear all tests
npm run clear-tests

# Generate test report
npm run report
```

### Advanced Commands
```bash
# Seed from specific JavaScript file
npm run seed-js work/user-management-test-cases-app-format.js

# Seed from specific markdown file
npm run seed-md work/user-management-test-cases-comprehensive-docs.md

# Direct migration tool usage
node migrate.js migrate
node migrate.js seed
node migrate.js clear
```

## 📋 Migration System Features

### 1. **Automated Test Case Detection**
The migration system automatically detects and processes:
- **JavaScript files** (`.js`) - Direct test case objects
- **Markdown files** (`.md`) - Parsed test case documentation

### 2. **Multiple Source Support**
- **Work Directory**: Automatically processes all test case files in `work/` directory
- **Specific Files**: Target specific files for seeding
- **Backup Creation**: Automatically backs up existing data

### 3. **Markdown Parsing**
The system can parse markdown test cases with the following format:
```markdown
## TC-001: Test Case Title

**Story:** User story description
**Category:** org-admin
**Priority:** high
**Estimated Time:** 30 minutes
**Prerequisites:** Setup requirements

**Test Steps:**
1. Navigate to the users page
2. Click "Invite Users" button
3. Enter email addresses

**Acceptance Criteria:**
- Users receive invitation emails
- Users appear in pending users list
- Invitation status is tracked correctly
```

## 🔄 Migration Workflows

### Workflow 1: Update from Work Directory
```bash
# 1. Add new test cases to work/ directory
# 2. Run migration
npm run seed

# 3. Verify in app
# 4. Generate report
npm run report
```

### Workflow 2: Update from Specific File
```bash
# 1. Create/update test case file
# 2. Seed from specific file
npm run seed-js work/new-test-cases.js
# OR
npm run seed-md work/new-test-cases.md

# 3. Verify and report
npm run report
```

### Workflow 3: Complete Reset
```bash
# 1. Clear existing tests
npm run clear-tests

# 2. Seed from work directory
npm run seed

# 3. Verify all test cases loaded
npm run report
```

## 📁 File Structure

```
├── migrate.js                    # Migration tool
├── database.js                   # Database operations
├── work/                         # Test case source files
│   ├── user-management-test-cases-app-format.js
│   ├── user-management-test-cases-comprehensive-docs.md
│   └── README-test-cases.md
├── data/                         # Database and backups
│   ├── test-tracker.db          # SQLite database
│   ├── test-data.json.backup    # Backup files
│   └── test-report.json         # Generated reports
└── package.json                  # Migration scripts
```

## 🎯 Test Case Formats

### JavaScript Format (App Integration)
```javascript
const testCases = [
    {
        id: "TC-001",
        title: "Single User Invite - Basic Flow",
        story: "As a system administrator, I want to invite a single user...",
        category: "org-admin",
        priority: "high",
        estimatedTime: "15 minutes",
        prerequisites: "User must have admin access",
        testSteps: [
            "Navigate to the users page",
            "Click 'Invite Users' button",
            "Enter email address in the input field"
        ],
        acceptanceCriteria: [
            "User receives invitation email",
            "User appears in pending users list"
        ],
        statusGuidance: {
            pass: "Test passes when user receives email and appears in list",
            fail: "Test fails if email not sent or user not in list",
            skip: "Test can be skipped if email service is down"
        }
    }
];

module.exports = { testCases };
```

### Markdown Format (Documentation)
```markdown
## TC-001: Single User Invite - Basic Flow

**Story:** As a system administrator, I want to invite a single user to the organization so they can access the system.

**Category:** org-admin
**Priority:** high
**Estimated Time:** 15 minutes
**Prerequisites:** User must have admin access to the organization

**Test Steps:**
1. Navigate to the users page
2. Click "Invite Users" button
3. Enter email address in the input field
4. Click "Send Invitation" button
5. Verify confirmation message appears

**Acceptance Criteria:**
- User receives invitation email within 5 minutes
- User appears in pending users list with "Pending" status
- Invitation includes proper organization context
- User can click invitation link to access system
```

## 🔧 Customization Options

### 1. **Custom Test Case Parsing**
Modify the `parseMarkdownTestCases` method in `migrate.js` to handle different markdown formats.

### 2. **Additional File Types**
Extend the migration system to support other formats (JSON, YAML, etc.).

### 3. **Custom Validation**
Add validation rules for test case data before seeding.

### 4. **Incremental Updates**
Implement logic to update existing test cases instead of clearing all.

## 🚨 Important Notes

### Database Safety
- **Backup Creation**: Migration automatically creates backups of existing data
- **Clear Operations**: `clear-tests` removes ALL test cases - use with caution
- **Transaction Safety**: All operations are wrapped in try-catch blocks

### File Requirements
- **JavaScript Files**: Must export `testCases` array or be the array itself
- **Markdown Files**: Must follow the specified format with proper headers
- **Work Directory**: Files must be in the `work/` directory for automatic detection

### Performance Considerations
- **Large Files**: Markdown parsing may be slower for very large files
- **Database Size**: Consider clearing old data before seeding large test case sets
- **Memory Usage**: Very large test case arrays may require chunked processing

## 🐛 Troubleshooting

### Common Issues

1. **"No test cases found in markdown file"**
   - Check markdown format matches expected structure
   - Ensure test case headers use `## TC-XXX:` format

2. **"Failed to seed test"**
   - Check test case data structure
   - Verify required fields (id, title) are present
   - Check database connection

3. **"Database initialization failed"**
   - Ensure `data/` directory exists and is writable
   - Check file permissions
   - Verify SQLite3 dependency is installed

### Debug Mode
Add `console.log` statements in migration methods to debug parsing issues:
```javascript
console.log('Parsed test cases:', testCases);
console.log('Current test case:', currentTestCase);
```

## 📊 Reporting

The migration system generates comprehensive reports:
```bash
npm run report
```

Reports include:
- Total test cases, users, and results
- Test case summaries by category
- User information
- Generation timestamp

Reports are saved to `data/test-report.json` for analysis and tracking.

---

*This migration system provides flexible, automated test case management while maintaining data safety and providing comprehensive reporting capabilities.*
