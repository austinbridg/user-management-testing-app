// Results Manager - handles results page operations
class ResultsManager {
    constructor(apiClient, modalManager, app) {
        this.api = apiClient;
        this.modalManager = modalManager;
        this.app = app;
    }
    
    // Helper method to get user name by ID
    getUserNameById(userId) {
        const user = this.app.userManager.testUsers.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    }
    
    // Show results page
    showResultsPage() {
        document.getElementById('testGrid').style.display = 'none';
        document.getElementById('resultsPage').classList.add('active');
        this.populateResultsFilters();
        this.renderResultsTable();
        this.updateResultsSummary();
    }
    
    // Hide results page
    hideResultsPage() {
        document.getElementById('resultsPage').classList.remove('active');
        document.getElementById('testGrid').style.display = 'block';
    }
    
    // Populate results page filters
    populateResultsFilters() {
        // Populate user filter
        const userFilter = document.getElementById('resultsUserFilter');
        userFilter.innerHTML = '<option value="all">All Users</option>';
        this.app.userManager.testUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.name;
            option.textContent = user.name;
            userFilter.appendChild(option);
        });

        // Populate test filter
        const testFilter = document.getElementById('resultsTestFilter');
        testFilter.innerHTML = '<option value="all">All Tests</option>';
        this.app.testManager.testCases.forEach(test => {
            const option = document.createElement('option');
            option.value = test.id;
            option.textContent = `${test.id} - ${test.title}`;
            testFilter.appendChild(option);
        });
    }
    
    // Render results table
    renderResultsTable() {
        const tbody = document.getElementById('resultsTableBody');
        const noResults = document.getElementById('noResults');
        
        // Get filter values
        const userFilter = document.getElementById('resultsUserFilter').value;
        const statusFilter = document.getElementById('resultsStatusFilter').value;
        const testFilter = document.getElementById('resultsTestFilter').value;
        
        // Collect all results
        let allResults = [];
        this.app.testManager.testCases.forEach(test => {
            test.userResults.forEach(result => {
                allResults.push({
                    testId: test.id,
                    testTitle: test.title,
                    user: this.getUserNameById(result.userId),
                    status: result.status,
                    date: result.date,
                    environment: result.environment,
                    notes: result.notes,
                    bugReport: result.bugReport
                });
            });
        });
        
        // Apply filters
        let filteredResults = allResults.filter(result => {
            const userMatch = userFilter === 'all' || result.user === userFilter;
            const statusMatch = statusFilter === 'all' || result.status === statusFilter;
            const testMatch = testFilter === 'all' || result.testId === testFilter;
            return userMatch && statusMatch && testMatch;
        });
        
        // Sort by date (newest first)
        filteredResults.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredResults.length === 0) {
            tbody.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';
        
        // Render table rows
        tbody.innerHTML = filteredResults.map(result => `
            <tr>
                <td class="test-id-cell">${result.testId}</td>
                <td class="test-title-cell">${result.testTitle}</td>
                <td class="user-name-cell">${result.user}</td>
                <td class="status-cell">
                    <span class="status-badge status-${result.status}">${result.status.toUpperCase()}</span>
                </td>
                <td class="date-cell">${result.date}</td>
                <td>${result.environment || '-'}</td>
                <td class="notes-cell" title="${result.notes || ''}">${result.notes || '-'}</td>
                <td>
                    ${result.bugReport ? 
                        `<button class="btn btn-outline btn-sm" onclick="app.resultsManager.viewBugReport('${result.testId}', '${result.user}')">View Bug</button>` : 
                        '-'
                    }
                </td>
            </tr>
        `).join('');
    }
    
    // Update results summary
    updateResultsSummary() {
        const summaryStats = document.getElementById('summaryStats');
        
        // Calculate statistics
        let totalResults = 0;
        let totalUsers = this.app.userManager.testUsers.length;
        let totalTests = this.app.testManager.testCases.length;
        let completedTests = 0;
        
        this.app.testManager.testCases.forEach(test => {
            if (test.userResults.length > 0) {
                completedTests++;
            }
            totalResults += test.userResults.length;
        });
        
        summaryStats.innerHTML = `
            <div class="summary-stat">
                <div class="number">${totalResults}</div>
                <div class="label">Total Results</div>
            </div>
            <div class="summary-stat">
                <div class="number">${totalUsers}</div>
                <div class="label">Active Users</div>
            </div>
            <div class="summary-stat">
                <div class="number">${completedTests}</div>
                <div class="label">Tests with Results</div>
            </div>
            <div class="summary-stat">
                <div class="number">${totalTests}</div>
                <div class="label">Total Tests</div>
            </div>
        `;
    }
    
    // View bug report from results table
    viewBugReport(testId, userName) {
        const test = this.app.testManager.testCases.find(t => t.id === testId);
        if (test) {
            const result = test.userResults.find(r => this.getUserNameById(r.userId) === userName);
            if (result && result.bugReport) {
                alert(`Bug Report for ${testId} by ${userName}:\n\nSeverity: ${result.bugReport.severity}\nDescription: ${result.bugReport.description}\n\nSteps to Reproduce:\n${result.bugReport.stepsToReproduce}\n\nExpected Result:\n${result.bugReport.expectedResult}\n\nActual Result:\n${result.bugReport.actualResult}`);
            }
        }
    }
    
    // Export results table
    exportResultsTable() {
        const userFilter = document.getElementById('resultsUserFilter').value;
        const statusFilter = document.getElementById('resultsStatusFilter').value;
        const testFilter = document.getElementById('resultsTestFilter').value;
        
        // Collect filtered results
        let allResults = [];
        this.app.testManager.testCases.forEach(test => {
            test.userResults.forEach(result => {
                allResults.push({
                    'Test ID': test.id,
                    'Test Title': test.title,
                    'User': this.getUserNameById(result.userId),
                    'Status': result.status,
                    'Date': result.date,
                    'Environment': result.environment || '',
                    'Notes': result.notes || '',
                    'Bug Severity': result.bugReport ? result.bugReport.severity : '',
                    'Bug Description': result.bugReport ? result.bugReport.description : '',
                    'Steps to Reproduce': result.bugReport ? result.bugReport.stepsToReproduce : '',
                    'Expected Result': result.bugReport ? result.bugReport.expectedResult : '',
                    'Actual Result': result.bugReport ? result.bugReport.actualResult : ''
                });
            });
        });
        
        // Apply same filters as table
        let filteredResults = allResults.filter(result => {
            const userMatch = userFilter === 'all' || result.User === userFilter;
            const statusMatch = statusFilter === 'all' || result.Status === statusFilter;
            const testMatch = testFilter === 'all' || result['Test ID'] === testFilter;
            return userMatch && statusMatch && testMatch;
        });
        
        if (filteredResults.length === 0) {
            alert('No results to export with current filters.');
            return;
        }
        
        const csv = this.app.testManager.convertToCSV(filteredResults);
        this.app.testManager.downloadCSV(csv, 'test-results-table.csv');
    }
}
