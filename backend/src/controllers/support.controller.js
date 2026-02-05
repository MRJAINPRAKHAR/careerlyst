const pool = require("../config/db");

// SUBMIT FEEDBACK
const submitFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: "Subject and message are required" });
        }

        await pool.query(
            "INSERT INTO feedback (user_id, type, subject, message) VALUES (?, ?, ?, ?)",
            [userId, type || 'feedback', subject, message]
        );

        res.status(201).json({ message: "Feedback submitted successfully" });

    } catch (err) {
        console.error("Feedback Error:", err);
        res.status(500).json({ message: "Server error submitting feedback" });
    }
};

module.exports = {
    submitFeedback
};
