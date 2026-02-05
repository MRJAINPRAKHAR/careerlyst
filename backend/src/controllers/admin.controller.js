const pool = require("../config/db");

// 1. GET ADMIN STATS
const getStats = async (req, res) => {
    try {
        // Total Users
        const [userRows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
        const totalUsers = userRows[0].count;

        // Feedback Counts
        const [feedbackRows] = await pool.query(`
            SELECT 
                SUM(CASE WHEN type = 'bug' THEN 1 ELSE 0 END) as bugs,
                SUM(CASE WHEN type = 'feedback' THEN 1 ELSE 0 END) as feedback,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            FROM feedback
        `);

        // Recent Activity (Last 5 users)
        const [recentUsers] = await pool.query("SELECT id, full_name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5");

        res.json({
            stats: {
                totalUsers,
                totalBugs: feedbackRows[0].bugs || 0,
                totalFeedback: feedbackRows[0].feedback || 0,
                pendingItems: feedbackRows[0].pending || 0
            },
            recentUsers
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching stats" });
    }
};

// 2. GET ALL USERS (Paginated)
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const [users] = await pool.query(`
            SELECT id, full_name, email, role, is_verified, created_at, 
                   (SELECT COUNT(*) FROM feedback WHERE user_id = users.id) as feedback_count
            FROM users 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const [countResult] = await pool.query("SELECT COUNT(*) as count FROM users");

        res.json({
            users,
            pagination: {
                total: countResult[0].count,
                page,
                pages: Math.ceil(countResult[0].count / limit)
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching users" });
    }
};

// 3. GET FEEDBACK
const getFeedback = async (req, res) => {
    try {
        const filter = req.query.filter || 'all'; // 'all', 'pending', 'resolved'
        let query = `
            SELECT f.*, u.full_name, u.email 
            FROM feedback f 
            LEFT JOIN users u ON f.user_id = u.id
        `;

        const params = [];
        if (filter !== 'all') {
            query += " WHERE f.status = ?";
            params.push(filter);
        }

        query += " ORDER BY f.created_at DESC";

        const [feedback] = await pool.query(query, params);
        res.json(feedback);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching feedback" });
    }
};

// 4. UPDATE FEEDBACK STATUS
const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'reviewed', 'resolved'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        await pool.query("UPDATE feedback SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: "Feedback status updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error updating feedback" });
    }
};

module.exports = {
    getStats,
    getUsers,
    getFeedback,
    updateFeedbackStatus
};
