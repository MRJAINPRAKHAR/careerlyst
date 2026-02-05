const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('../config/db');

const fixSchema = async () => {
    try {
        console.log("🛠️  Fixing Database Schema...");

        const queries = [
            "ALTER TABLE users MODIFY COLUMN education LONGTEXT",
            "ALTER TABLE users MODIFY COLUMN work_history LONGTEXT",
            "ALTER TABLE users MODIFY COLUMN skills LONGTEXT",
            "ALTER TABLE users MODIFY COLUMN certificates LONGTEXT",
            "ALTER TABLE users MODIFY COLUMN achievements LONGTEXT",
            "ALTER TABLE users MODIFY COLUMN bio LONGTEXT"
        ];

        for (const q of queries) {
            await pool.query(q);
            console.log(`✅  Executed: ${q}`);
        }

        console.log("🎉  Schema Fixed Successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌  Error fixing schema:", err.message);
        process.exit(1);
    }
};

fixSchema();
