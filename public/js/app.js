// Main Application - coordinates all components
class App {
    constructor() {
        try {
            console.log('🏗️ Creating App instance...');
            this.api = new APIClient();
            console.log('✅ API Client created');
            
            this.modalManager = new ModalManager();
            console.log('✅ Modal Manager created');
            
            this.userManager = new UserManager(this.api, this.modalManager, this);
            console.log('✅ User Manager created');
            
            this.testManager = new TestManager(this.api, this.modalManager, this);
            console.log('✅ Test Manager created');
            
            this.resultsManager = new ResultsManager(this.api, this.modalManager, this);
            console.log('✅ Results Manager created');
            
            // Initialize modal manager
            this.modalManager.init();
            console.log('✅ Modal Manager initialized');
            
            console.log('✅ App instance created successfully');
        } catch (error) {
            console.error('❌ Error creating App instance:', error);
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    }
    
    // Check authentication status
    async checkAuthentication() {
        try {
            const response = await fetch('/api/auth-status', {
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                throw new Error('Authentication check failed');
            }
            
            const data = await response.json();
            
            if (!data.authenticated) {
                console.log('🔒 Not authenticated, redirecting to login...');
                window.location.href = '/login';
                return;
            }
            
            console.log('✅ Authentication verified');
        } catch (error) {
            console.error('❌ Authentication check failed:', error);
            window.location.href = '/login';
        }
    }
    
    // Initialize the application
    async init() {
        try {
            console.log('🚀 Initializing application...');
            
            // Check authentication status first
            await this.checkAuthentication();
            
            // Add a small delay to ensure server is ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Load data from database with retry
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
                try {
                    console.log(`📡 Attempt ${retryCount + 1} to load data...`);
                    await this.loadDataFromAPI();
                    break; // Success, exit retry loop
                } catch (error) {
                    retryCount++;
                    console.warn(`⚠️ Attempt ${retryCount} failed:`, error.message);
                    
                    if (retryCount >= maxRetries) {
                        // Show user-friendly error message
                        this.showErrorMessage('Unable to connect to server. Please check that the server is running and try refreshing the page.');
                        throw error; // Re-throw if all retries failed
                    }
                    
                    // Wait before retry with exponential backoff
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            
            console.log('✅ Data loaded successfully');
            console.log('Users:', this.userManager.testUsers.length);
            console.log('Tests:', this.testManager.testCases.length);
            
            // Setup event listeners
            this.setupEventListeners();
            this.setupResultsEventListeners();
            this.setupTestManagementEventListeners();
            
            // Render UI after data is loaded
            this.testManager.renderTests();
            this.updateStats();
            this.userManager.renderUserTiles();
            
            // Hide loading message
            const loadingMessage = document.getElementById('loadingMessage');
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
            
            console.log('✅ Application initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            console.error('❌ Final error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            alert(`Failed to load data from server: ${error.message}. Please refresh the page.`);
        }
    }
    
    // Load data from API
    async loadDataFromAPI() {
        try {
            console.log('📡 Starting to load data from API...');
            // Load users and tests in parallel
            await Promise.all([
                this.userManager.loadUsers(),
                this.testManager.loadTests()
            ]);
            console.log('✅ Data loaded from API successfully');
            console.log('Users loaded:', this.userManager.testUsers.length);
            console.log('Tests loaded:', this.testManager.testCases.length);
        } catch (error) {
            console.error('❌ Failed to load data from API:', error);
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        document.getElementById('statusFilter').addEventListener('change', () => this.testManager.filterTests());
        document.getElementById('categoryFilter').addEventListener('change', () => this.testManager.filterTests());
        document.getElementById('priorityFilter').addEventListener('change', () => this.testManager.filterTests());
        document.getElementById('testForm').addEventListener('submit', (e) => this.testManager.saveTestResult(e));
        document.getElementById('testStatus').addEventListener('change', () => this.testManager.toggleBugReport());
        document.getElementById('newUserName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.userManager.createUser();
            }
        });
        document.getElementById('testerName').addEventListener('change', (e) => {
            if (e.target.value) {
                this.userManager.selectUser(e.target.value);
            }
        });
    }
    
    // Setup results page event listeners
    setupResultsEventListeners() {
        document.getElementById('resultsUserFilter').addEventListener('change', () => this.resultsManager.renderResultsTable());
        document.getElementById('resultsStatusFilter').addEventListener('change', () => this.resultsManager.renderResultsTable());
        document.getElementById('resultsTestFilter').addEventListener('change', () => this.resultsManager.renderResultsTable());
    }
    
    // Setup test management event listeners
    setupTestManagementEventListeners() {
        document.getElementById('testManagementForm').addEventListener('submit', (e) => this.saveTest(e));
    }
    
    // Update statistics
    updateStats() {
        const stats = {
            pass: this.testManager.testCases.filter(t => t.consolidatedStatus === 'pass').length,
            fail: this.testManager.testCases.filter(t => t.consolidatedStatus === 'fail').length,
            blocked: this.testManager.testCases.filter(t => t.consolidatedStatus === 'blocked').length,
            partial: this.testManager.testCases.filter(t => t.consolidatedStatus === 'partial').length,
            skip: this.testManager.testCases.filter(t => t.consolidatedStatus === 'skip').length,
            needsReview: this.testManager.testCases.filter(t => t.consolidatedStatus === 'needs-review').length,
            total: this.testManager.testCases.length
        };
        
        // Calculate completed tests (all non-pending statuses)
        const completed = stats.pass + stats.fail + stats.blocked + stats.partial + stats.skip + stats.needsReview;
        const total = this.testManager.testCases.length;
        
        document.getElementById('passCount').textContent = stats.pass;
        document.getElementById('failCount').textContent = stats.fail;
        document.getElementById('blockedCount').textContent = stats.blocked;
        document.getElementById('partialCount').textContent = stats.partial;
        document.getElementById('skipCount').textContent = stats.skip;
        document.getElementById('needsReviewCount').textContent = stats.needsReview;
        document.getElementById('completedCount').textContent = `${completed}/${total}`;
        
        const progress = (completed / stats.total) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }
    
    // Show user-friendly error message
    showErrorMessage(message) {
        const testGrid = document.getElementById('testGrid');
        if (testGrid) {
            testGrid.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 40px; color: #e74c3c;">
                    <h3>⚠️ Connection Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">🔄 Retry</button>
                </div>
            `;
        }
    }
    
    // Test Manager Methods
    openTestModal(testId) {
        this.testManager.openTestModal(testId);
    }
    
    closeModal() {
        this.testManager.closeModal();
    }
    
    viewConflicts(testId) {
        this.testManager.viewConflicts(testId);
    }
    
    exportResults() {
        this.testManager.exportResults();
    }
    
    resetAllTests() {
        this.testManager.resetAllTests();
    }
    
    exportToCSV() {
        this.testManager.exportToCSV();
    }
    
    exportToJSON() {
        this.testManager.exportToJSON();
    }
    
    // User Manager Methods
    createUser() {
        this.userManager.createUser();
    }
    
    resetUserData() {
        this.userManager.resetUserData();
    }
    
    // Results Manager Methods
    showResultsPage() {
        this.resultsManager.showResultsPage();
    }
    
    hideResultsPage() {
        this.resultsManager.hideResultsPage();
    }
    
    exportResultsTable() {
        this.resultsManager.exportResultsTable();
    }
    
    // Test Management Methods
    showTestManagement() {
        document.getElementById('testGrid').style.display = 'none';
        document.getElementById('resultsPage').classList.remove('active');
        document.getElementById('testManagementPage').classList.add('active');
        this.initializeSort();
        this.userManager.renderUserTiles();
    }
    
    hideTestManagement() {
        document.getElementById('testManagementPage').classList.remove('active');
        document.getElementById('testGrid').style.display = 'block';
    }
    
    openCreateTestModal() {
        this.currentEditingTestId = null;
        document.getElementById('testManagementModalTitle').textContent = 'Create New Test';
        this.clearTestManagementForm();
        this.modalManager.show('testManagementModal');
    }
    
    closeTestManagementModal() {
        this.modalManager.hide('testManagementModal');
        this.currentEditingTestId = null;
    }
    
    editTest(testId) {
        const test = this.testManager.testCases.find(t => t.id === testId);
        if (!test) return;
        
        this.currentEditingTestId = testId;
        document.getElementById('testManagementModalTitle').textContent = `Edit Test - ${testId}`;
        
        // Populate form with test data
        document.getElementById('testId').value = test.id;
        document.getElementById('testTitle').value = test.title;
        document.getElementById('testStory').value = test.story;
        document.getElementById('testCategory').value = test.category;
        document.getElementById('testPriority').value = test.priority;
        document.getElementById('testEstimatedTime').value = test.estimatedTime;
        document.getElementById('testPrerequisites').value = test.prerequisites;
        document.getElementById('testSteps').value = test.testSteps.join('\n');
        document.getElementById('testAcceptanceCriteria').value = test.acceptanceCriteria.join('\n');
        document.getElementById('passGuidance').value = test.statusGuidance.pass;
        document.getElementById('failGuidance').value = test.statusGuidance.fail;
        document.getElementById('blockedGuidance').value = test.statusGuidance.blocked;
        document.getElementById('partialGuidance').value = test.statusGuidance.partial;
        document.getElementById('skipGuidance').value = test.statusGuidance.skip;
        
        this.modalManager.show('testManagementModal');
    }
    
    duplicateTest(testId) {
        const test = this.testManager.testCases.find(t => t.id === testId);
        if (!test) return;
        
        // Generate new ID
        const newId = this.generateNewTestId();
        
        this.currentEditingTestId = null;
        document.getElementById('testManagementModalTitle').textContent = 'Duplicate Test';
        
        // Populate form with test data but with new ID
        document.getElementById('testId').value = newId;
        document.getElementById('testTitle').value = `${test.title} (Copy)`;
        document.getElementById('testStory').value = test.story;
        document.getElementById('testCategory').value = test.category;
        document.getElementById('testPriority').value = test.priority;
        document.getElementById('testEstimatedTime').value = test.estimatedTime;
        document.getElementById('testPrerequisites').value = test.prerequisites;
        document.getElementById('testSteps').value = test.testSteps.join('\n');
        document.getElementById('testAcceptanceCriteria').value = test.acceptanceCriteria.join('\n');
        document.getElementById('passGuidance').value = test.statusGuidance.pass;
        document.getElementById('failGuidance').value = test.statusGuidance.fail;
        document.getElementById('blockedGuidance').value = test.statusGuidance.blocked;
        document.getElementById('partialGuidance').value = test.statusGuidance.partial;
        document.getElementById('skipGuidance').value = test.statusGuidance.skip;
        
        this.modalManager.show('testManagementModal');
    }
    
    async deleteTest(testId) {
        const test = this.testManager.testCases.find(t => t.id === testId);
        if (!test) return;
        
        if (confirm(`Are you sure you want to delete test "${testId}"?\n\nThis will permanently remove:\n• The test definition\n• All test results from all users\n\nThis action cannot be undone.`)) {
            try {
                // Delete test via API
                const response = await this.api.deleteTest(testId);
                
                if (response.success) {
                    // Remove test from local array
                    const testIndex = this.testManager.testCases.findIndex(t => t.id === testId);
                    if (testIndex !== -1) {
                        this.testManager.testCases.splice(testIndex, 1);
                    }
                    
                    // Update UI
                    this.initializeSort();
                    this.testManager.renderTests();
                    this.updateStats();
                    
                    alert(`Test "${testId}" has been deleted successfully.`);
                } else {
                    alert(`Failed to delete test: ${response.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error deleting test:', error);
                alert(`Failed to delete test: ${error.message}`);
            }
        }
    }
    
    generateNewTestId() {
        const existingIds = this.testManager.testCases.map(t => t.id);
        let counter = this.testManager.testCases.length + 1;
        let newId;
        
        do {
            newId = `TC-${counter.toString().padStart(3, '0')}`;
            counter++;
        } while (existingIds.includes(newId));
        
        return newId;
    }
    
    clearTestManagementForm() {
        document.getElementById('testId').value = '';
        document.getElementById('testTitle').value = '';
        document.getElementById('testStory').value = '';
        document.getElementById('testCategory').value = 'system-admin';
        document.getElementById('testPriority').value = 'High';
        document.getElementById('testEstimatedTime').value = '';
        document.getElementById('testPrerequisites').value = '';
        document.getElementById('testSteps').value = '';
        document.getElementById('testAcceptanceCriteria').value = '';
        document.getElementById('passGuidance').value = '';
        document.getElementById('failGuidance').value = '';
        document.getElementById('blockedGuidance').value = '';
        document.getElementById('partialGuidance').value = '';
        document.getElementById('skipGuidance').value = '';
    }
    
    async saveTest(e) {
        e.preventDefault();
        
        const testData = {
            id: document.getElementById('testId').value.trim(),
            title: document.getElementById('testTitle').value.trim(),
            story: document.getElementById('testStory').value.trim(),
            category: document.getElementById('testCategory').value,
            priority: document.getElementById('testPriority').value,
            estimatedTime: document.getElementById('testEstimatedTime').value.trim(),
            prerequisites: document.getElementById('testPrerequisites').value.trim(),
            testSteps: document.getElementById('testSteps').value.split('\n').filter(step => step.trim()),
            acceptanceCriteria: document.getElementById('testAcceptanceCriteria').value.split('\n').filter(criteria => criteria.trim()),
            statusGuidance: {
                pass: document.getElementById('passGuidance').value.trim(),
                fail: document.getElementById('failGuidance').value.trim(),
                blocked: document.getElementById('blockedGuidance').value.trim(),
                partial: document.getElementById('partialGuidance').value.trim(),
                skip: document.getElementById('skipGuidance').value.trim()
            },
            userResults: [],
            consolidatedStatus: 'pending'
        };
        
        // Validate required fields
        if (!testData.id || !testData.title || !testData.story) {
            alert('Please fill in all required fields (Test ID, Title, and User Story).');
            return;
        }
        
        // Check for duplicate ID (only when creating new test)
        if (!this.currentEditingTestId && this.testManager.testCases.some(t => t.id === testData.id)) {
            alert('A test with this ID already exists. Please choose a different ID.');
            return;
        }
        
        try {
            let response;
            if (this.currentEditingTestId) {
                // Update existing test
                console.log('🔄 Updating test:', this.currentEditingTestId, testData);
                response = await this.api.updateTest(this.currentEditingTestId, testData);
                console.log('📡 Update response:', response);
            } else {
                // Create new test
                console.log('➕ Creating new test:', testData);
                response = await this.api.createTest(testData);
                console.log('📡 Create response:', response);
            }
            
            if (response && response.success) {
                // Update local array
                if (this.currentEditingTestId) {
                    const testIndex = this.testManager.testCases.findIndex(t => t.id === this.currentEditingTestId);
                    if (testIndex !== -1) {
                        // Preserve existing user results and consolidated status
                        testData.userResults = this.testManager.testCases[testIndex].userResults;
                        testData.consolidatedStatus = this.testManager.testCases[testIndex].consolidatedStatus;
                        this.testManager.testCases[testIndex] = testData;
                    }
                } else {
                    // Add new test
                    testData.userResults = [];
                    testData.consolidatedStatus = 'pending';
                    this.testManager.testCases.push(testData);
                }
                
                // Update UI
                this.initializeSort();
                this.testManager.renderTests();
                this.updateStats();
                this.closeTestManagementModal();
                
                alert(`Test "${testData.id}" has been ${this.currentEditingTestId ? 'updated' : 'created'} successfully.`);
            } else {
                alert(`Failed to ${this.currentEditingTestId ? 'update' : 'create'} test: ${response.error || response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving test:', error);
            alert(`Failed to ${this.currentEditingTestId ? 'update' : 'create'} test: ${error.message}`);
        }
    }
    
    exportTestDefinitions() {
        const exportData = this.testManager.testCases.map(test => ({
            'Test ID': test.id,
            'Title': test.title,
            'User Story': test.story,
            'Category': this.testManager.categoryNames[test.category],
            'Priority': test.priority,
            'Estimated Time': test.estimatedTime,
            'Prerequisites': test.prerequisites,
            'Test Steps': test.testSteps.join('; '),
            'Acceptance Criteria': test.acceptanceCriteria.join('; '),
            'Status Guidance - Pass': test.statusGuidance.pass,
            'Status Guidance - Fail': test.statusGuidance.fail,
            'Status Guidance - Blocked': test.statusGuidance.blocked,
            'Status Guidance - Partial': test.statusGuidance.partial,
            'Status Guidance - Skip': test.statusGuidance.skip,
            'Current Status': test.consolidatedStatus,
            'User Results Count': test.userResults.length
        }));
        
        const csv = this.testManager.convertToCSV(exportData);
        this.testManager.downloadCSV(csv, 'test-definitions.csv');
    }
    
    // Sorting methods
    initializeSort() {
        this.testManager.sortedTests = [...this.testManager.testCases];
        this.testManager.currentSortColumn = 'id';
        this.testManager.currentSortOrder = 'asc';
        this.updateSortIndicators();
        this.sortTests();
    }
    
    sortByColumn(column) {
        if (this.testManager.currentSortColumn === column) {
            // Toggle order if same column
            this.testManager.currentSortOrder = this.testManager.currentSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            // New column, default to ascending
            this.testManager.currentSortColumn = column;
            this.testManager.currentSortOrder = 'asc';
        }
        
        this.updateSortIndicators();
        this.sortTests();
    }
    
    updateSortIndicators() {
        // Reset all arrows
        document.querySelectorAll('.sort-arrow').forEach(arrow => {
            arrow.textContent = '↕';
            arrow.parentElement.classList.remove('active');
        });
        
        // Set active column arrow
        const activeArrow = document.getElementById(`sort-arrow-${this.testManager.currentSortColumn}`);
        if (activeArrow) {
            activeArrow.textContent = this.testManager.currentSortOrder === 'asc' ? '↑' : '↓';
            activeArrow.parentElement.classList.add('active');
        }
    }
    
    sortTests() {
        this.testManager.sortedTests = [...this.testManager.testCases].sort((a, b) => {
            let aValue, bValue;
            
            switch (this.testManager.currentSortColumn) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'category':
                    aValue = this.testManager.categoryNames[a.category] || a.category;
                    bValue = this.testManager.categoryNames[b.category] || b.category;
                    break;
                case 'priority':
                    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    aValue = priorityOrder[a.priority] || 0;
                    bValue = priorityOrder[b.priority] || 0;
                    break;
                case 'status':
                    aValue = a.consolidatedStatus;
                    bValue = b.consolidatedStatus;
                    break;
                case 'results':
                    aValue = a.userResults.length;
                    bValue = b.userResults.length;
                    break;
                default:
                    aValue = a.id;
                    bValue = b.id;
            }
            
            // Handle alphanumeric comparison for Test ID
            if (this.testManager.currentSortColumn === 'id') {
                const aNum = parseInt(aValue.replace(/\D/g, '')) || 0;
                const bNum = parseInt(bValue.replace(/\D/g, '')) || 0;
                
                if (aNum !== bNum) {
                    return this.testManager.currentSortOrder === 'asc' ? aNum - bNum : bNum - aNum;
                }
                return this.testManager.currentSortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            
            // Handle numeric comparison for results
            if (this.testManager.currentSortColumn === 'results') {
                return this.testManager.currentSortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            // Handle priority numeric comparison
            if (this.testManager.currentSortColumn === 'priority') {
                return this.testManager.currentSortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            // Handle string comparison for other fields
            if (aValue < bValue) {
                return this.testManager.currentSortOrder === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return this.testManager.currentSortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        this.renderTestManagementTable();
    }
    
    renderTestManagementTable() {
        const tbody = document.getElementById('testManagementTableBody');
        
        // Use sortedTests if available, otherwise use testCases
        const testsToRender = this.testManager.sortedTests.length > 0 ? this.testManager.sortedTests : this.testManager.testCases;
        
        tbody.innerHTML = testsToRender.map(test => `
            <tr class="test-row" onclick="app.editTest('${test.id}')" style="cursor: pointer;">
                <td class="test-id-cell" title="Test ID: ${test.id}">${test.id}</td>
                <td class="test-details-cell" title="${test.title}">${test.title}</td>
                <td title="${this.testManager.categoryNames[test.category]}">${this.testManager.categoryNames[test.category]}</td>
                <td>
                    <div class="priority-badge priority-${test.priority.toLowerCase()}" title="Priority: ${test.priority}">${test.priority}</div>
                </td>
                <td>
                    <div class="status-badge status-${test.consolidatedStatus}" title="Status: ${test.consolidatedStatus.toUpperCase()}">${test.consolidatedStatus.toUpperCase()}</div>
                </td>
                <td title="${test.userResults.length} test result${test.userResults.length !== 1 ? 's' : ''}">${test.userResults.length} result${test.userResults.length !== 1 ? 's' : ''}</td>
                <td class="test-actions-cell" onclick="event.stopPropagation();">
                    <button class="btn btn-outline btn-sm" onclick="app.editTest('${test.id}')" title="Edit test">✏️</button>
                    <button class="btn btn-warning btn-sm" onclick="app.duplicateTest('${test.id}')" title="Duplicate test">📋</button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteTest('${test.id}')" title="Delete test">🗑️</button>
                </td>
            </tr>
        `).join('');

        // Initialize table resizer after table is rendered
        setTimeout(() => {
            if (window.tableResizer) {
                window.tableResizer.loadColumnWidths();
            }
        }, 100);
    }
}

// Create global app instance
const app = new App();
window.app = app; // Make app globally accessible

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 DOM Content Loaded, initializing app...');
        app.init();
    } catch (error) {
        console.error('❌ Critical error during app initialization:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        alert(`Critical error: ${error.message}. Please check the console for details.`);
    }
});
