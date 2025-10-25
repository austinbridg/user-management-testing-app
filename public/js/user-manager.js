// User Manager - handles user-related operations
class UserManager {
    constructor(apiClient, modalManager, app) {
        this.api = apiClient;
        this.modalManager = modalManager;
        this.app = app;
        this.testUsers = [];
        this.currentUser = null;
    }
    
    // Load users from API
    async loadUsers() {
        try {
            console.log('📡 Loading users from API...');
            const users = await this.api.getUsers();
            console.log('📡 Raw users from API:', users);
            
            this.testUsers = users.map(user => ({
                id: user.id,
                name: user.name,
                createdDate: user.created_at
            }));
            console.log('✅ Users loaded:', this.testUsers.length, this.testUsers);
        } catch (error) {
            console.error('❌ Failed to load users:', error);
            throw error;
        }
    }
    
    // Create a new test user
    async createUser() {
        const userNameInput = document.getElementById('newUserName');
        if (!userNameInput) return;
        
        const userName = userNameInput.value.trim();
        
        if (!userName) {
            alert('Please enter a name for the test user.');
            return;
        }
        
        try {
            const newUser = await this.api.createUser(userName);
            
            // Add to local array for immediate UI update
            this.testUsers.push({
                id: newUser.id,
                name: newUser.name,
                createdDate: new Date().toISOString()
            });
            
            this.currentUser = userName;
            
            userNameInput.value = '';
            this.updateTesterDropdown();
            this.renderUserTiles();
            
            alert(`Welcome, ${userName}! You are now logged in as a test user.`);
        } catch (error) {
            if (error.message.includes('already exists')) {
                alert('A user with this name already exists.');
            } else {
                alert(`Failed to create user: ${error.message}`);
            }
        }
    }
    
    // Select a user
    selectUser(userName) {
        this.currentUser = userName;
        this.updateTesterDropdown();
        this.renderUserTiles();
    }
    
    // Delete a user
    async deleteUser(userName, event) {
        event.stopPropagation(); // Prevent tile selection
        
        if (confirm(`Are you sure you want to delete user "${userName}"? This will also remove all their test results.`)) {
            try {
                // Find user ID
                const user = this.testUsers.find(u => u.name === userName);
                if (!user) {
                    alert('User not found.');
                    return;
                }
                
                // Delete user from database
                await this.api.deleteUser(user.id);
                
                // Remove user from local array
                this.testUsers = this.testUsers.filter(u => u.name !== userName);
            
                // Remove user's test results from all tests
                app.testManager.testCases.forEach(test => {
                    test.userResults = test.userResults.filter(result => result.tester !== userName);
                    test.consolidatedStatus = app.testManager.calculateConsolidatedStatus(test.userResults);
                });
                
                // If deleted user was current user, clear current user
                if (this.currentUser === userName) {
                    this.currentUser = null;
                }
                
                this.updateTesterDropdown();
                this.renderUserTiles();
                app.testManager.renderTests();
                app.updateStats();
                
                alert(`User "${userName}" has been deleted.`);
            } catch (error) {
                alert(`Failed to delete user: ${error.message}`);
            }
        }
    }
    
    // Switch to a different user
    switchUser() {
        this.currentUser = null;
        this.updateTesterDropdown();
        this.renderUserTiles();
    }
    
    // Reset all user data
    resetUserData() {
        if (confirm('Are you sure you want to reset all user data? This will:\n\n• Delete all test users\n• Remove all test results\n• Reset all test statuses to pending\n\nThis action cannot be undone.')) {
            // Clear all user data
            this.testUsers = [];
            this.currentUser = null;
            
            // Clear all test results
            app.testManager.testCases.forEach(test => {
                test.userResults = [];
                test.consolidatedStatus = 'pending';
            });
            
            // Update UI
            this.updateTesterDropdown();
            this.renderUserTiles();
            app.testManager.renderTests();
            app.updateStats();
            
            alert('All user data has been reset successfully.');
        }
    }
    
    // Get user test statistics
    getUserTestStats(userName) {
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;
        
        app.testManager.testCases.forEach(test => {
            const userResult = test.userResults.find(result => result.tester === userName);
            if (userResult) {
                totalTests++;
                if (userResult.status === 'pass') passedTests++;
                if (userResult.status === 'fail') failedTests++;
            }
        });
        
        return { totalTests, passedTests, failedTests };
    }
    
    // Render user tiles
    renderUserTiles() {
        // Render user tiles in Settings page
        const userTilesContainer = document.getElementById('userTilesSettings');
        
        if (this.testUsers.length === 0) {
            userTilesContainer.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">No test users created yet</p>';
            return;
        }
        
        const tilesHtml = this.testUsers.map(user => {
            const stats = this.getUserTestStats(user.name);
            const isSelected = this.currentUser === user.name;
            
            return `
                <div class="user-tile ${isSelected ? 'selected' : ''}" onclick="app.userManager.selectUser('${user.name}')">
                    <button class="delete-btn" onclick="app.userManager.deleteUser('${user.name}', event)" title="Delete user">×</button>
                    <div class="user-name">${user.name}</div>
                    <div class="user-stats">
                        ${stats.totalTests} tests<br>
                        ${stats.passedTests} passed, ${stats.failedTests} failed
                    </div>
                </div>
            `;
        }).join('');
        
        userTilesContainer.innerHTML = tilesHtml;
    }
    
    // Update tester dropdown in modal
    updateTesterDropdown() {
        const testerSelect = document.getElementById('testerName');
        if (!testerSelect) {
            console.log('❌ Tester select element not found');
            return;
        }
        
        console.log('🔄 Updating tester dropdown with', this.testUsers.length, 'users');
        console.log('Users:', this.testUsers);
        
        testerSelect.innerHTML = '<option value="">Select a test user...</option>';
        
        // If no users loaded, try to refresh from API
        if (this.testUsers.length === 0) {
            console.log('⚠️ No users loaded, attempting to refresh from API...');
            this.loadUsers().then(() => {
                this.populateDropdownOptions(testerSelect);
            }).catch(error => {
                console.error('❌ Failed to refresh users:', error);
            });
        } else {
            this.populateDropdownOptions(testerSelect);
        }
    }
    
    // Helper method to populate dropdown options
    populateDropdownOptions(testerSelect) {
        this.testUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.name;
            option.textContent = user.name;
            if (user.name === this.currentUser) {
                option.selected = true;
            }
            testerSelect.appendChild(option);
        });
        
        console.log('✅ Tester dropdown updated with', this.testUsers.length, 'options');
    }
    
    // Refresh user list from API (useful for debugging)
    async refreshUsers() {
        try {
            console.log('🔄 Refreshing user list from API...');
            await this.loadUsers();
            this.updateTesterDropdown();
            this.renderUserTiles();
            console.log('✅ User list refreshed successfully');
        } catch (error) {
            console.error('❌ Failed to refresh user list:', error);
        }
    }
}
