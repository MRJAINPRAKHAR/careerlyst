require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const db = require('./config/db');
const automationRoutes = require('./routes/automation.routes');
const aiRoutes = require('./routes/ai.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const applicationRoutes = require('./routes/applications.routes');
const calendarRoutes = require('./routes/calendar.routes');
const supportRoutes = require('./routes/support.routes');

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'https://careerlyst.in',
            'https://www.careerlyst.in',
            process.env.FRONTEND_URL
        ].filter(Boolean);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', require('./routes/admin.routes'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    try {
        await db.query('SELECT 1 + 1 AS result');
        console.log(`✅ Database Connected Successfully!`);
    } catch (err) {
        console.error("❌ Database Connection FAILED:", err.message);
    }
});