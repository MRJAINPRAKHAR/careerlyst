const pool = require("../config/db");

// ✅ Create new application
const createApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { company, role, status, jobLink, notes, appliedDate } = req.body;

    if (!company || !role) {
      return res.status(400).json({ message: "Company and role are required" });
    }

    // Generate random AI chance for manual entry (60-95%)
    const aiChance = Math.floor(Math.random() * 35) + 60;

    const [result] = await pool.query(
      `INSERT INTO applications (user_id, company, role, status, date_applied, ai_chance)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        company,
        role,
        status || "Applied",
        appliedDate || null,
        aiChance
      ]
    );

    return res.status(201).json({
      message: "Application created successfully",
      applicationId: result.insertId,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all applications for logged-in user
const getApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [apps] = await pool.query(
      `SELECT id, company, role, status, date_applied, ai_chance, created_at
       FROM applications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({ applications: apps });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update application
const updateApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { company, role, status, jobLink, notes, appliedDate } = req.body;

    const [result] = await pool.query(
      `UPDATE applications
       SET company = ?, role = ?, status = ?, date_applied = ?
       WHERE id = ? AND user_id = ?`,
      [
        company,
        role,
        status,
        appliedDate || null,
        id,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.json({ message: "Application updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete application
const deleteApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM applications WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.json({ message: "Application deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
};
