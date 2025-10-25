const Database = require('./database');

class TestSeeder {
    constructor() {
        this.db = new Database();
    }

    async seedAllTests() {
        try {
            console.log('🌱 Seeding all 30 tests...');
            
            // Initialize database
            const dbInitialized = await this.db.init();
            if (!dbInitialized) {
                throw new Error('Failed to initialize database');
            }

            // Clear existing tests
            const existingTests = await this.db.getTests();
            if (existingTests.length > 0) {
                console.log('🗑️ Clearing existing tests...');
                for (const test of existingTests) {
                    await this.db.deleteTest(test.id);
                }
            }

            const tests = [
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {},
          {}
];

            // Seed the tests
            for (const test of tests) {
                try {
                    await this.db.createTest(test);
                    console.log(`✅ Seeded test: ${test.id}`);
                } catch (error) {
                    console.error(`❌ Failed to seed test ${test.id}:`, error.message);
                }
            }

            console.log('🌱 All tests seeded successfully!');
            
        } catch (error) {
            console.error('❌ Seeding failed:', error);
            throw error;
        } finally {
            this.db.close();
        }
    }
}

// Run if called directly
if (require.main === module) {
    const seeder = new TestSeeder();
    seeder.seedAllTests().catch(console.error);
}

module.exports = TestSeeder;