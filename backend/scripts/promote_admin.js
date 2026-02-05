const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const promoteAdmin = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // Target the specific user
        const targetEmail = 'piyushjain3690@gmail.com';
        const [rows] = await connection.query("SELECT id, email, role FROM users WHERE email = ?", [targetEmail]);

        if (rows.length > 0) {
            const user = rows[0];
            console.log(`Found user: ${user.email} (Role: ${user.role})`);

            await connection.query("UPDATE users SET role = 'admin' WHERE id = ?", [user.id]);
            console.log(`✅ SUCCESS: Promoted ${user.email} to ADMIN.`);
        } else {
            console.log(`⚠️ User ${targetEmail} not found.`);
            // Fallback: List all users
            const [allUsers] = await connection.query("SELECT id, email, role FROM users");
            console.log("Existing users:", allUsers);
        }
    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        if (connection) await connection.end();
    }
};

promoteAdmin();
