// API Client for database operations
class APIClient {
    constructor() {
        // Use absolute URL for localhost when running locally
        this.baseURL = window.location.protocol === 'file:' 
            ? 'http://localhost:3000/api' 
            : '/api';
    }

    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                credentials: 'same-origin', // Include session cookies
                ...options
            });

            console.log(`📡 API Response: ${response.status} ${response.statusText}`);
            
            // Handle authentication errors
            if (response.status === 401) {
                console.log('🔒 Authentication required, redirecting to login...');
                window.location.href = '/login';
                return;
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ API Error Response:`, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log(`✅ API Success:`, data);
            return data;
        } catch (error) {
            console.error('❌ API request failed:', {
                endpoint,
                method: options.method || 'GET',
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    // User operations
    async getUsers() {
        const response = await this.request('/users');
        return response.users;
    }

    async createUser(name) {
        const response = await this.request('/users', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
        return response.user;
    }

    async updateUser(id, name) {
        const response = await this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name })
        });
        return response.user;
    }

    async deleteUser(id) {
        const response = await this.request(`/users/${id}`, {
            method: 'DELETE'
        });
        return response;
    }

    // Test operations
    async getTests() {
        const response = await this.request('/tests');
        return response.tests;
    }

    async getTest(id) {
        const response = await this.request(`/tests/${id}`);
        return response.test;
    }

    async createTest(testData) {
        const response = await this.request('/tests', {
            method: 'POST',
            body: JSON.stringify(testData)
        });
        return response;
    }

    async updateTest(id, testData) {
        const response = await this.request(`/tests/${id}`, {
            method: 'PUT',
            body: JSON.stringify(testData)
        });
        return response;
    }

    async deleteTest(id) {
        const response = await this.request(`/tests/${id}`, {
            method: 'DELETE'
        });
        return response;
    }

    // Test result operations
    async getTestResults() {
        const response = await this.request('/test-results');
        return response.testResults;
    }

    async getTestResultsByTestId(testId) {
        const response = await this.request(`/tests/${testId}/results`);
        return response.testResults;
    }

    async createTestResult(testId, resultData) {
        const response = await this.request('/test-results', {
            method: 'POST',
            body: JSON.stringify({ testId, ...resultData })
        });
        return response.testResult;
    }

    async updateTestResult(id, resultData) {
        const response = await this.request(`/test-results/${id}`, {
            method: 'PUT',
            body: JSON.stringify(resultData)
        });
        return response.testResult;
    }

    async deleteTestResult(id) {
        const response = await this.request(`/test-results/${id}`, {
            method: 'DELETE'
        });
        return response;
    }

    // Statistics
    async getStats() {
        const response = await this.request('/stats');
        return response.stats;
    }

    async getUserStats(userId) {
        const response = await this.request(`/users/${userId}/stats`);
        return response.stats;
    }
}
