
const db = require('./db');

const checkSchema = async () => {
    try {
        console.log('🔄 Checking database schema...');

        // Check users table columns
        const [columns] = await db.query('DESCRIBE users');
        const existingColumns = columns.map(col => col.Field);

        const updates = [
            {
                col: 'google_uid',
                sql: "ADD COLUMN google_uid VARCHAR(255) UNIQUE DEFAULT NULL"
            },
            {
                col: 'is_verified',
                sql: "ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"
            },
            {
                col: 'google_access_token',
                sql: "ADD COLUMN google_access_token TEXT DEFAULT NULL"
            },
            {
                col: 'google_refresh_token',
                sql: "ADD COLUMN google_refresh_token TEXT DEFAULT NULL"
            },
            {
                col: 'google_token_expiry',
                sql: "ADD COLUMN google_token_expiry BIGINT DEFAULT NULL"
            }
        ];

        let updatedCount = 0;

        for (const update of updates) {
            if (!existingColumns.includes(update.col)) {
                console.log(`⚠️ Missing column: ${update.col}. Adding...`);
                await db.query(`ALTER TABLE users ${update.sql}`);
                console.log(`✅ Added column: ${update.col}`);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            console.log(`✅ Schema update complete. Added ${updatedCount} columns.`);
        } else {
            console.log('✅ Schema is up to date.');
        }

    } catch (err) {
        console.error('❌ Schema check failed:', err.message);
    }
};

module.exports = checkSchema;
