const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const verifyToken = (req, res, next) => {
  // Get token from the 'Authorization' header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adds user id to req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query("SELECT role FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    // Ensure role is 'admin'
    if (rows[0].role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin rights required." });
    }

    next();
  } catch (err) {
    console.error("Admin Verify Error:", err);
    return res.status(500).json({ message: "Server error verifying admin capability" });
  }
};

module.exports = { verifyToken, verifyAdmin };