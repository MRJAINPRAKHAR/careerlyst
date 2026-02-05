const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const initDatabase = async () => {
    let connection;
    try {
        console.log('🔌 Connecting to Aiven MySQL...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 25160,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'defaultdb',
            multipleStatements: true
        });

        console.log('✅ Connected.');

        // 1. Create Users Table
        console.log('🛠 Creating Users table...');
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255),
                google_uid VARCHAR(255),
                is_verified BOOLEAN DEFAULT FALSE,
                otp_code VARCHAR(10),
                otp_expires_at DATETIME,
                role ENUM('user', 'admin') DEFAULT 'user',
                job_title VARCHAR(255),
                mobile_no VARCHAR(20),
                experience VARCHAR(50),
                skills LONGTEXT,
                education LONGTEXT,
                work_history LONGTEXT,
                certificates LONGTEXT,
                achievements LONGTEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                country VARCHAR(100),
                bio LONGTEXT,
                dob DATE,
                resume_url VARCHAR(500),
                banner_url VARCHAR(500),
                profile_pic VARCHAR(500),
                username VARCHAR(100) UNIQUE,
                username_last_changed DATETIME,
                linkedin VARCHAR(255),
                twitter VARCHAR(255),
                github VARCHAR(255),
                leetcode VARCHAR(255),
                hackerrank VARCHAR(255),
                daily_resume_scans INT DEFAULT 0,
                last_resume_scan_date DATE,
                last_analysis_result LONGTEXT,
                google_access_token TEXT,
                google_refresh_token TEXT,
                google_token_expiry BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createUsersTable);
        console.log('   ✅ Users table ready.');

        // 2. Create Applications Table
        console.log('🛠 Creating Applications table...');
        const createApplicationsTable = `
            CREATE TABLE IF NOT EXISTS applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                company VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'Applied',
                date_applied DATETIME,
                ai_chance INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await connection.query(createApplicationsTable);
        console.log('   ✅ Applications table ready.');

        // 3. Create Events Table
        console.log('🛠 Creating Events table...');
        const createEventsTable = `
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                event_type VARCHAR(50) DEFAULT 'meeting',
                event_date DATETIME NOT NULL,
                source VARCHAR(50) DEFAULT 'manual',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await connection.query(createEventsTable);
        console.log('   ✅ Events table ready.');

        // 4. Create Feedback Table
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

        console.log('✨ Database Initialization COMPLETE!');

    } catch (err) {
        console.error('❌ Error during database init:', err);
    } finally {
        if (connection) await connection.end();
    }
};

initDatabase();
