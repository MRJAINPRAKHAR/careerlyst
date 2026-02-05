const express = require("express");
const { verifyToken: authMiddleware } = require("../middleware/authMiddleware");
const { getDashboardStats } = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/stats", authMiddleware, getDashboardStats);

module.exports = router;
