const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Robust path

const initAdmin = async () => {
    let connection;
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('✅ Connected.');

        // 1. Add 'role' column to users table if it doesn't exist
        console.log('🛠 Checking Users table for role column...');
        const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'role'");

        if (columns.length === 0) {
            console.log('   ➕ Adding role column to users table...');
            await connection.query("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user'");
            console.log('   ✅ Role column added.');
        } else {
            console.log('   ℹ️ Role column already exists.');
        }

        // 2. Create Feedback table
        console.log('🛠 Creating Feedback table...');
        const createFeedbackTable = `
            CREATE TABLE IF NOT EXISTS feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                type ENUM('feedback', 'bug') NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `;
        await connection.query(createFeedbackTable);
        console.log('   ✅ Feedback table ready.');

        // 3. Optional: Promote a user to admin (hardcoded for initial setup if needed)
        // You can uncomment this part to promote a specific email
        /*
        const adminEmail = 'mrjainprakhar@gmail.com'; 
        console.log(\`👑 Promoting \${adminEmail} to admin...\`);
        const [res] = await connection.query("UPDATE users SET role = 'admin' WHERE email = ?", [adminEmail]);
        if (res.affectedRows > 0) {
            console.log('   ✅ User promoted to Admin.');
        } else {
            console.log('   ⚠️ User not found or already admin.');
        }
        */

        console.log('✨ Admin setup complete!');

    } catch (err) {
        console.error('❌ Error during admin init:', err);
    } finally {
        if (connection) await connection.end();
    }
};

initAdmin();
