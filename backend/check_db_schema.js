
require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('Connected to database.');

        const [rows] = await connection.execute('DESCRIBE users');
        console.log('Schema for users table:');
        console.table(rows);

        // Check specifically for google_uid
        const googleUid = rows.find(row => row.Field === 'google_uid');
        if (googleUid) {
            console.log('✅ google_uid column exists.');
        } else {
            console.log('❌ google_uid column is MISSING!');
        }

        const isVerified = rows.find(row => row.Field === 'is_verified');
        if (isVerified) {
            console.log('✅ is_verified column exists.');
        } else {
            console.log('❌ is_verified column is MISSING!');
        }

        await connection.end();
    } catch (err) {
        console.error('Error checking schema:', err);
    }
}

checkSchema();
