const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const createAdminUser = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const email = 'admin@careerlyst.ai';
        const password = 'AdminPassword123!';
        const hashedPassword = await bcrypt.hash(password, 10);
        const fullName = 'System Admin';

        // Check if exists
        const [existing] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);

        if (existing.length > 0) {
            console.log(`ℹ️ User ${email} already exists. Updating role and password...`);
            await connection.query(
                "UPDATE users SET role = 'admin', password = ?, is_verified = TRUE WHERE email = ?",
                [hashedPassword, email]
            );
            console.log("✅ Admin account updated.");
        } else {
            console.log(`Creating new admin user: ${email}...`);
            await connection.query(
                "INSERT INTO users (full_name, email, password, role, is_verified) VALUES (?, ?, ?, 'admin', TRUE)",
                [fullName, email, hashedPassword]
            );
            console.log("✅ Admin account created.");
        }

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (connection) await connection.end();
    }
};

createAdminUser();
