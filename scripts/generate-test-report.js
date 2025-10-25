#!/usr/bin/env node

const Database = require('../src/models/database');
const fs = require('fs-extra');
const path = require('path');

class TestReportGenerator {
    constructor() {
        this.db = new Database();
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

    async generateReport() {
        try {
            console.log('🚀 Starting test case report generation...');
            
            // Initialize database
            const initialized = await this.db.init();
            if (!initialized) {
                throw new Error('Failed to initialize database');
            }

            // Get all tests
            const tests = await this.db.getTests();
            console.log(`📊 Found ${tests.length} test cases`);

            // Group tests by category
            const testsByCategory = this.groupTestsByCategory(tests);
            
            // Generate markdown content
            const markdown = this.generateMarkdown(testsByCategory, tests.length);
            
            // Write to file
            const outputPath = path.join(__dirname, 'test-case-report.md');
            await fs.writeFile(outputPath, markdown);
            
            console.log(`✅ Test case report generated: ${outputPath}`);
            console.log(`📄 Report contains ${tests.length} test cases across ${Object.keys(testsByCategory).length} categories`);
            
            // Close database connection
            this.db.close();
            
        } catch (error) {
            console.error('❌ Error generating report:', error);
            process.exit(1);
        }
    }

    groupTestsByCategory(tests) {
        const grouped = {};
        
        tests.forEach(test => {
            const category = test.category || 'uncategorized';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(test);
        });

        // Sort tests within each category by ID
        Object.keys(grouped).forEach(category => {
            grouped[category].sort((a, b) => {
                const aNum = parseInt(a.id.replace(/\D/g, '')) || 0;
                const bNum = parseInt(b.id.replace(/\D/g, '')) || 0;
                return aNum - bNum;
            });
        });

        return grouped;
    }

    generateMarkdown(testsByCategory, totalTests) {
        const timestamp = new Date().toISOString().split('T')[0];
        
        let markdown = `# Test Case Report\n\n`;
        markdown += `**Generated:** ${timestamp}\n`;
        markdown += `**Total Test Cases:** ${totalTests}\n\n`;

        // Executive Summary
        markdown += `## Executive Summary\n\n`;
        markdown += `| Category | Test Count | Priority Distribution |\n`;
        markdown += `|----------|------------|----------------------|\n`;
        
        Object.keys(testsByCategory).forEach(category => {
            const tests = testsByCategory[category];
            const priorityCounts = this.getPriorityCounts(tests);
            const categoryName = this.categoryNames[category] || category;
            
            markdown += `| ${categoryName} | ${tests.length} | High: ${priorityCounts.High || 0}, Medium: ${priorityCounts.Medium || 0}, Low: ${priorityCounts.Low || 0} |\n`;
        });
        
        markdown += `\n`;

        // Detailed Test Cases by Category
        Object.keys(testsByCategory).forEach(category => {
            const tests = testsByCategory[category];
            const categoryName = this.categoryNames[category] || category;
            
            markdown += `## ${categoryName}\n\n`;
            markdown += `**Test Count:** ${tests.length}\n\n`;
            
            tests.forEach(test => {
                markdown += this.generateTestMarkdown(test);
                markdown += `\n---\n\n`;
            });
        });

        // Footer
        markdown += `## Report Notes\n\n`;
        markdown += `This report was generated from the test case database and can be used to:\n`;
        markdown += `- Compare against ADRs (Architecture Decision Records)\n`;
        markdown += `- Identify gaps in test coverage\n`;
        markdown += `- Remove irrelevant test cases\n`;
        markdown += `- Plan test case updates based on product requirements\n\n`;
        markdown += `**Next Steps:**\n`;
        markdown += `1. Review each category against your ADRs\n`;
        markdown += `2. Identify missing test cases for new requirements\n`;
        markdown += `3. Flag outdated or irrelevant test cases for removal\n`;
        markdown += `4. Update test cases to match current product specifications\n`;

        return markdown;
    }

    generateTestMarkdown(test) {
        let markdown = `### ${test.id}: ${test.title}\n\n`;
        
        // Basic Information
        markdown += `**Story:** ${test.story || 'N/A'}\n\n`;
        markdown += `**Priority:** ${test.priority || 'N/A'}\n\n`;
        markdown += `**Estimated Time:** ${test.estimated_time || 'N/A'}\n\n`;
        markdown += `**Prerequisites:** ${test.prerequisites || 'N/A'}\n\n`;

        // Test Steps - handle both parsed and unparsed data
        let testSteps = test.test_steps;
        if (typeof testSteps === 'string') {
            try {
                testSteps = JSON.parse(testSteps);
            } catch (e) {
                testSteps = [];
            }
        }
        
        if (testSteps && Array.isArray(testSteps) && testSteps.length > 0) {
            markdown += `**Test Steps:**\n`;
            testSteps.forEach((step, index) => {
                markdown += `${index + 1}. ${step}\n`;
            });
            markdown += `\n`;
        }

        // Acceptance Criteria - handle both parsed and unparsed data
        let acceptanceCriteria = test.acceptance_criteria;
        if (typeof acceptanceCriteria === 'string') {
            try {
                acceptanceCriteria = JSON.parse(acceptanceCriteria);
            } catch (e) {
                acceptanceCriteria = [];
            }
        }
        
        if (acceptanceCriteria && Array.isArray(acceptanceCriteria) && acceptanceCriteria.length > 0) {
            markdown += `**Acceptance Criteria:**\n`;
            acceptanceCriteria.forEach((criteria, index) => {
                markdown += `- ${criteria}\n`;
            });
            markdown += `\n`;
        }

        // Status Guidance - handle both parsed and unparsed data
        let statusGuidance = test.status_guidance;
        if (typeof statusGuidance === 'string') {
            try {
                statusGuidance = JSON.parse(statusGuidance);
            } catch (e) {
                statusGuidance = {};
            }
        }
        
        if (statusGuidance && typeof statusGuidance === 'object' && Object.keys(statusGuidance).length > 0) {
            markdown += `**Status Guidance:**\n`;
            Object.keys(statusGuidance).forEach(status => {
                markdown += `- **${status.charAt(0).toUpperCase() + status.slice(1)}:** ${statusGuidance[status]}\n`;
            });
            markdown += `\n`;
        }

        return markdown;
    }

    getPriorityCounts(tests) {
        const counts = {};
        tests.forEach(test => {
            const priority = test.priority || 'Unknown';
            counts[priority] = (counts[priority] || 0) + 1;
        });
        return counts;
    }
}

// Run the generator if this script is executed directly
if (require.main === module) {
    const generator = new TestReportGenerator();
    generator.generateReport();
}

module.exports = TestReportGenerator;
