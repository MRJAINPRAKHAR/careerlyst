const db = require('../config/db');

const pingDatabase = async () => {
    try {
        await db.query('SELECT 1');
        console.log(`[Keep-Alive] Database ping successful at ${new Date().toISOString()}`);
    } catch (err) {
        console.error(`[Keep-Alive] Database ping failed:`, err.message);
    }
};

const startKeepAlive = () => {
    // Ping immediately on start
    pingDatabase();
    
    // Ping every 10 minutes (600,000 milliseconds)
    const INTERVAL = 10 * 60 * 1000;
    setInterval(pingDatabase, INTERVAL);
    console.log(`[Keep-Alive] Started database keep-alive interval (${INTERVAL}ms)`);
};

module.exports = {
    startKeepAlive
};
