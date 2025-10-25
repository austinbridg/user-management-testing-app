// Test Manager - handles test-related operations
class TestManager {
    constructor(apiClient, modalManager, app) {
        this.api = apiClient;
        this.modalManager = modalManager;
        this.app = app;
        this.testCases = [];
        this.currentTestId = null;
        this.currentEditingTestId = null;
        this.currentEditingResultId = null;
        this.sortedTests = [];
        this.currentSortColumn = 'id';
        this.currentSortOrder = 'asc';
        
        this.categoryNames = {
            'system-admin': 'System Administrator Tests',
            'org-admin': 'Organization Administrator Tests',
            'org-member': 'Organization Member Tests',
            'hr-admin': 'HR Administrator Tests',
            'end-user': 'End User Tests',
            'cross-role': 'Cross-Role Tests',
            'integration': 'Integration Tests',
            'performance': 'Performance Tests',
            'security': 'Security Tests',
            'advanced': 'Advanced Tests',
            'adr-compliance': 'ADR Compliance Tests'
        };
    }
    
    // Load tests from API
    async loadTests() {
        try {
            console.log('📡 Loading tests from API...');
            console.log('API Client baseURL:', this.api.baseURL);
            
            // Load tests and all test results in parallel
            const [tests, allTestResults] = await Promise.all([
                this.api.getTests(),
                this.api.getTestResults()
            ]);
            
            console.log('✅ Tests loaded from API:', tests.length);
            console.log('✅ All test results loaded:', allTestResults.length);
            
            this.testCases = [];
            
            // Process tests with their results
            for (const test of tests) {
                try {
                    console.log(`📡 Processing test ${test.id}...`);
                    
                    // Get test results for this specific test
                    const testResults = allTestResults.filter(result => result.test_id === test.id);

                    // Transform test results to match frontend format
                    const transformedResults = testResults.map(result => ({
                        id: result.id, // Database ID for editing/deleting
                        userId: result.user_id, // User ID from database
                        status: result.status,
                        date: result.test_date,
                        notes: result.notes,
                        environment: result.environment,
                        bugReport: result.bug_severity ? {
                            severity: result.bug_severity,
                            description: result.bug_description,
                            stepsToReproduce: result.steps_to_reproduce,
                            expectedResult: result.expected_result,
                            actualResult: result.actual_result
                        } : null
                    }));

                    // Add test to testCases array
                    this.testCases.push({
                        id: test.id,
                        title: test.title,
                        story: test.story,
                        category: test.category,
                        priority: test.priority,
                        estimatedTime: test.estimated_time,
                        prerequisites: test.prerequisites,
                        testSteps: this.parseJsonField(test.test_steps, []),
                        acceptanceCriteria: this.parseJsonField(test.acceptance_criteria, []),
                        statusGuidance: this.parseJsonField(test.status_guidance, {}),
                        userResults: transformedResults,
                        consolidatedStatus: this.calculateConsolidatedStatus(transformedResults)
                    });
                    console.log(`✅ Processed test ${test.id}`);
                } catch (testError) {
                    console.error(`❌ Error processing test ${test.id}:`, testError);
                    throw testError;
                }
            }
            console.log('✅ All tests loaded successfully. Total testCases:', this.testCases.length);
        } catch (error) {
            console.error('❌ Failed to load tests:', error);
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    }
    
    // Helper method to get user name by ID
    getUserNameById(userId) {
        const user = this.app.userManager.testUsers.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    }
    
    // Helper function to safely parse JSON fields
    parseJsonField(field, defaultValue) {
        if (!field || field === '') {
            return defaultValue;
        }
        
        if (typeof field === 'object') {
            return field;
        }
        
        if (typeof field === 'string') {
            try {
                return JSON.parse(field);
            } catch (error) {
                console.warn('Failed to parse JSON field:', field, error);
                return defaultValue;
            }
        }
        
        return defaultValue;
    }
    
    // Calculate consolidated status based on user results
    calculateConsolidatedStatus(userResults) {
        if (userResults.length === 0) {
            return 'pending';
        }

        const statuses = userResults.map(result => result.status);
        const uniqueStatuses = [...new Set(statuses)];

        if (uniqueStatuses.length === 1) {
            return uniqueStatuses[0];
        }

        // Priority order: fail > blocked > partial > skip > pass
        const priorityOrder = ['fail', 'blocked', 'partial', 'skip', 'pass'];
        for (const status of priorityOrder) {
            if (uniqueStatuses.includes(status)) {
                return status;
            }
        }

        return uniqueStatuses[0];
    }
    
    // Render all tests
    renderTests() {
        console.log('🔄 renderTests called with', this.testCases.length, 'tests');
        console.log('Test cases:', this.testCases);
        
        const testGrid = document.getElementById('testGrid');
        if (!testGrid) {
            console.error('❌ Test grid element not found');
            return;
        }
        
        // Hide loading message if it exists
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.classList.add('hidden');
            setTimeout(() => {
                if (loadingMessage.parentNode) {
                    loadingMessage.parentNode.removeChild(loadingMessage);
                }
            }, 300);
        }
        
        const statusFilter = document.getElementById('statusFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        
        // Filter tests first
        const filteredTests = this.testCases.filter(test => {
            const statusMatch = statusFilter === 'all' || test.consolidatedStatus === statusFilter;
            const categoryMatch = categoryFilter === 'all' || test.category === categoryFilter;
            const priorityMatch = priorityFilter === 'all' || test.priority === priorityFilter;
            return statusMatch && categoryMatch && priorityMatch;
        });

        // Sort all tests by Test ID (ascending) regardless of category
        filteredTests.sort((a, b) => {
            const aNum = parseInt(a.id.replace(/\D/g, '')) || 0;
            const bNum = parseInt(b.id.replace(/\D/g, '')) || 0;
            
            if (aNum !== bNum) {
                return aNum - bNum;
            }
            return a.id.localeCompare(b.id);
        });

        // Group sorted tests by category for display
        const groupedTests = {};
        filteredTests.forEach(test => {
            const category = test.category || 'uncategorized';
            if (!groupedTests[category]) {
                groupedTests[category] = [];
            }
            groupedTests[category].push(test);
        });

        let html = '';
        
        // Display categories in the order they appear in the sorted list
        const categoryOrder = [...new Set(filteredTests.map(test => test.category))];
        
        categoryOrder.forEach(category => {
            const categoryTests = groupedTests[category];
            
            if (categoryTests.length > 0) {
                html += `
                    <div class="test-category">
                        <div class="category-header">${this.categoryNames[category]}</div>
                        <div class="test-cards">
                            ${categoryTests.map(test => this.renderTestCard(test)).join('')}
                        </div>
                    </div>
                `;
            }
        });

        console.log('📝 Generated HTML length:', html.length);
        testGrid.innerHTML = html;
        console.log('✅ Tests rendered successfully');
    }
    
    // Render individual test card
    renderTestCard(test) {
        const statusClass = `status-${test.consolidatedStatus}`;
        const statusText = test.consolidatedStatus.charAt(0).toUpperCase() + test.consolidatedStatus.slice(1).replace('-', ' ');
        
        // Generate test info section
        const testInfoHtml = `
            <div class="test-info-section">
                <h4>Test Information</h4>
                <p><strong>Estimated Time:</strong> ${test.estimatedTime}</p>
                <p><strong>Prerequisites:</strong> ${test.prerequisites}</p>
            </div>
        `;

        // Generate test steps section
        const testStepsHtml = `
            <div class="test-steps">
                <h4>Test Steps</h4>
                <ol>
                    ${test.testSteps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        `;

        // Generate acceptance criteria section
        const acceptanceCriteriaHtml = `
            <div class="acceptance-criteria">
                <h4>Acceptance Criteria</h4>
                <ul>
                    ${test.acceptanceCriteria.map(criteria => `<li>${criteria}</li>`).join('')}
                </ul>
            </div>
        `;

        // Generate status guidance section
        const statusGuidanceHtml = `
            <div class="status-guidance">
                <h4>Status Guidance</h4>
                <p><strong>Pass:</strong> ${test.statusGuidance.pass}</p>
                <p><strong>Fail:</strong> ${test.statusGuidance.fail}</p>
                <p><strong>Blocked:</strong> ${test.statusGuidance.blocked}</p>
                <p><strong>Partial:</strong> ${test.statusGuidance.partial}</p>
                <p><strong>Skip:</strong> ${test.statusGuidance.skip}</p>
            </div>
        `;

        // Generate user results section
        let userResultsHtml = '';
        if (test.userResults.length > 0) {
            userResultsHtml = `
                <div class="user-results">
                    <h4>User Results (${test.userResults.length})</h4>
                    ${test.userResults.map(result => `
                        <div class="user-result-item">
                            <div class="user-info">
                                <strong>${this.getUserNameById(result.userId)}</strong> - ${result.date}
                                ${result.notes ? `<br><em>${result.notes}</em>` : ''}
                            </div>
                            <div class="user-result-actions">
                                <div class="user-status status-${result.status}">${result.status.toUpperCase()}</div>
                                <div class="result-buttons">
                                    <button class="btn btn-sm btn-outline" onclick="app.testManager.editTestResult('${test.id}', '${result.id}')" title="Edit Result">✏️</button>
                                    <button class="btn btn-sm btn-danger" onclick="app.testManager.deleteTestResult('${test.id}', '${result.id}')" title="Delete Result">🗑️</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="test-card">
                <div class="test-header">
                    <div class="test-id">${test.id}</div>
                    <div class="test-badges">
                        <div class="priority-badge priority-${test.priority.toLowerCase()}">${test.priority}</div>
                        <div class="status-badge ${statusClass}">${statusText}</div>
                    </div>
                </div>
                <div class="test-title">${test.title}</div>
                <div class="test-story">${test.story}</div>
                ${testInfoHtml}
                ${testStepsHtml}
                ${acceptanceCriteriaHtml}
                ${statusGuidanceHtml}
                ${userResultsHtml}
                <div class="test-actions">
                    <button class="btn btn-primary btn-sm" onclick="app.openTestModal('${test.id}')">Add Result</button>
                    ${test.consolidatedStatus === 'needs-review' ? `<button class="btn btn-info btn-sm" onclick="app.viewConflicts('${test.id}')">View Conflicts</button>` : ''}
                </div>
            </div>
        `;
    }
    
    // Open test modal
    openTestModal(testId) {
        this.currentTestId = testId;
        this.currentEditingResultId = null; // Clear any editing state
        const test = this.testCases.find(t => t.id === testId);
        
        document.getElementById('modalTitle').textContent = `Add Test Result - ${test.id}`;
        document.getElementById('testStatus').value = 'pending';
        document.getElementById('testDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('testNotes').value = '';
        document.getElementById('environment').value = '';
        
        // Update tester dropdown
        this.updateTesterDropdown();
        
        // Clear bug report fields
        document.getElementById('bugSeverity').value = 'critical';
        document.getElementById('bugDescription').value = '';
        document.getElementById('stepsToReproduce').value = '';
        document.getElementById('expectedResult').value = '';
        document.getElementById('actualResult').value = '';
        
        this.toggleBugReport();
        this.modalManager.show('testModal');
    }
    
    // Close test modal
    closeModal() {
        this.modalManager.hide('testModal');
        this.currentTestId = null;
        this.currentEditingResultId = null; // Clear editing state
    }
    
    // Toggle bug report section
    toggleBugReport() {
        const status = document.getElementById('testStatus').value;
        const bugSection = document.getElementById('bugReportSection');
        bugSection.style.display = status === 'fail' ? 'block' : 'none';
    }
    
    // Edit test result
    async editTestResult(testId, resultId) {
        try {
            const test = this.testCases.find(t => t.id === testId);
            if (!test) {
                console.error('Test not found for ID:', testId);
                return;
            }
            
            const result = test.userResults.find(r => r.id === resultId);
            if (!result) {
                console.error('Test result not found for ID:', resultId);
                return;
            }
            
            // Set current test and result for editing
            this.currentTestId = testId;
            this.currentEditingResultId = resultId;
            
            // Populate the modal with existing data
            this.populateEditModal(result);
            
            // Show the modal
            this.modalManager.show('testModal');
            
        } catch (error) {
            console.error('❌ Error editing test result:', error);
            alert('Failed to edit test result. Please try again.');
        }
    }
    
    // Delete test result
    async deleteTestResult(testId, resultId) {
        try {
            console.log('🗑️ Deleting test result:', { testId, resultId });
            
            if (!confirm('Are you sure you want to delete this test result? This action cannot be undone.')) {
                return;
            }
            
            const test = this.testCases.find(t => t.id === testId);
            if (!test) {
                console.error('Test not found for ID:', testId);
                return;
            }
            
            console.log('📊 Test found:', test.id);
            console.log('📊 Current userResults:', test.userResults);
            console.log('📊 Looking for result with ID:', resultId);
            
            // Find the result to delete
            const resultToDelete = test.userResults.find(r => r.id == resultId);
            if (!resultToDelete) {
                console.error('Test result not found for ID:', resultId);
                console.error('Available result IDs:', test.userResults.map(r => r.id));
                return;
            }
            
            console.log('📊 Found result to delete:', resultToDelete);
            
            // Delete from database
            const deleteResponse = await this.api.deleteTestResult(resultId);
            console.log('📊 Delete response:', deleteResponse);
            
            // Remove from local data
            const resultIndex = test.userResults.findIndex(r => r.id == resultId);
            if (resultIndex >= 0) {
                test.userResults.splice(resultIndex, 1);
                console.log('📊 Removed result from local data. New userResults:', test.userResults);
            }
            
            // Recalculate consolidated status
            test.consolidatedStatus = this.calculateConsolidatedStatus(test.userResults);
            console.log('📊 New consolidated status:', test.consolidatedStatus);
            
            // Re-render the UI
            this.renderTests();
            if (window.app) {
                window.app.updateStats();
            }
            
            console.log('✅ Test result deleted successfully');
            
        } catch (error) {
            console.error('❌ Error deleting test result:', error);
            alert('Failed to delete test result. Please try again.');
        }
    }
    
    // Populate edit modal with existing data
    populateEditModal(result) {
        // Update modal title
        document.getElementById('modalTitle').textContent = 'Edit Test Result';
        
        // Populate form fields
        document.getElementById('testStatus').value = result.status;
        document.getElementById('testerName').value = this.getUserNameById(result.userId);
        document.getElementById('testDate').value = result.date;
        document.getElementById('testNotes').value = result.notes || '';
        document.getElementById('environment').value = result.environment || '';
        
        // Populate bug report fields if they exist
        if (result.bugReport) {
            document.getElementById('bugSeverity').value = result.bugReport.severity || '';
            document.getElementById('bugDescription').value = result.bugReport.description || '';
            document.getElementById('stepsToReproduce').value = result.bugReport.stepsToReproduce || '';
            document.getElementById('expectedResult').value = result.bugReport.expectedResult || '';
            document.getElementById('actualResult').value = result.bugReport.actualResult || '';
        }
        
        // Show/hide bug report section based on status
        const bugReportSection = document.getElementById('bugReportSection');
        if (result.status === 'fail') {
            bugReportSection.style.display = 'block';
        } else {
            bugReportSection.style.display = 'none';
        }
    }
    
    // Save test result
    async saveTestResult(e) {
        e.preventDefault();
        
        const test = this.testCases.find(t => t.id === this.currentTestId);
        if (!test) {
            console.error('Test not found for ID:', this.currentTestId);
            return;
        }
        
        const testerName = document.getElementById('testerName').value;
        const status = document.getElementById('testStatus').value;
        
        if (!testerName || !status) {
            alert('Please fill in all required fields');
            return;
        }
        
        try {
            // Find the user ID from the user name
            const user = this.app.userManager.testUsers.find(u => u.name === testerName);
            if (!user) {
                alert('User not found. Please select a valid user.');
                return;
            }
            
            const newResult = {
                userId: user.id, // Send user ID instead of name
                status: status,
                date: document.getElementById('testDate').value,
                notes: document.getElementById('testNotes').value,
                environment: document.getElementById('environment').value,
                bugReport: null
            };
            
            if (status === 'fail') {
                newResult.bugReport = {
                    severity: document.getElementById('bugSeverity').value,
                    description: document.getElementById('bugDescription').value,
                    stepsToReproduce: document.getElementById('stepsToReproduce').value,
                    expectedResult: document.getElementById('expectedResult').value,
                    actualResult: document.getElementById('actualResult').value
                };
            }
            
            console.log('💾 Saving test result:', {
                testId: test.id,
                userId: user.id,
                testerName: testerName,
                status: status,
                isEditing: !!this.currentEditingResultId
            });
            
            // Check if we're editing an existing result
            if (this.currentEditingResultId) {
                // Update existing result
                await this.api.updateTestResult(this.currentEditingResultId, newResult);
                
                // Update local data
                const existingResultIndex = test.userResults.findIndex(result => result.id === this.currentEditingResultId);
                if (existingResultIndex >= 0) {
                    test.userResults[existingResultIndex] = { ...newResult, id: this.currentEditingResultId };
                }
                
                // Clear editing state
                this.currentEditingResultId = null;
            } else {
                // Create new result
                const createdResult = await this.api.createTestResult(test.id, newResult);
                
                // Add to local data with the ID from the server
                test.userResults.push({ ...newResult, id: createdResult.id });
            }
            
            // Recalculate consolidated status
            test.consolidatedStatus = this.calculateConsolidatedStatus(test.userResults);
            
            this.renderTests();
            if (window.app) {
                window.app.updateStats();
            }
            this.closeModal();
            
            console.log('✅ Test result saved successfully');
        } catch (error) {
            console.error('❌ Error saving test result:', error);
            alert(`Failed to save test result: ${error.message}`);
        }
    }
    
    // View conflicts for tests that need review
    viewConflicts(testId) {
        const test = this.testCases.find(t => t.id === testId);
        if (test && test.userResults.length > 1) {
            const conflicts = test.userResults.map(result => 
                `${this.getUserNameById(result.userId)}: ${result.status.toUpperCase()} (${result.date})\n${result.notes ? `Notes: ${result.notes}\n` : ''}${result.bugReport ? `Bug: ${result.bugReport.description}\n` : ''}`
            ).join('\n---\n');
            
            alert(`Conflicting Results for ${testId}:\n\n${conflicts}`);
        }
    }
    
    // Update tester dropdown in modal
    updateTesterDropdown() {
        // Delegate to UserManager since it has direct access to testUsers
        if (window.app && window.app.userManager) {
            window.app.userManager.updateTesterDropdown();
        }
    }
    
    // Filter tests
    filterTests() {
        this.renderTests();
    }
    
    // Reset all tests
    resetAllTests() {
        if (confirm('Are you sure you want to reset all test results? This action cannot be undone.')) {
            this.testCases.forEach(test => {
                test.userResults = [];
                test.consolidatedStatus = 'pending';
            });
            this.renderTests();
            if (window.app) {
                window.app.updateStats();
            }
        }
    }
    
    // Export results
    exportResults() {
        const completedTests = this.testCases.filter(t => t.consolidatedStatus !== 'pending');
        const exportData = completedTests.map(test => ({
            'Test ID': test.id,
            'Test Title': test.title,
            'User Story': test.story,
            'Category': this.categoryNames[test.category],
            'Priority': test.priority,
            'Estimated Time': test.estimatedTime,
            'Consolidated Status': test.consolidatedStatus,
            'User Results Count': test.userResults.length,
            'User Results': test.userResults.map(result => 
                `${this.getUserNameById(result.userId)}: ${result.status} (${result.date})`
            ).join('; '),
            'Latest Bug Report': test.userResults.find(r => r.bugReport)?.bugReport?.description || '',
            'Latest Bug Severity': test.userResults.find(r => r.bugReport)?.bugReport?.severity || ''
        }));
        
        const csv = this.convertToCSV(exportData);
        this.downloadCSV(csv, 'test-results-v2.csv');
    }
    
    // Export to CSV
    exportToCSV() {
        this.exportResults();
    }
    
    // Export to JSON
    exportToJSON() {
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '2.0',
            totalTests: this.testCases.length,
            completedTests: this.testCases.filter(t => t.consolidatedStatus !== 'pending').length,
            testResults: this.testCases
        };
        
        const json = JSON.stringify(exportData, null, 2);
        this.downloadJSON(json, 'test-results-v2.json');
    }
    
    // Convert array to CSV
    convertToCSV(data) {
        if (data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        return csvContent;
    }
    
    // Download CSV
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    // Download JSON
    downloadJSON(json, filename) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
