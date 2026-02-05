const express = require("express");
const { verifyToken: authMiddleware } = require("../middleware/authMiddleware");
const {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
} = require("../controllers/applications.controller");

const router = express.Router();

router.post("/", authMiddleware, createApplication);
router.get("/", authMiddleware, getApplications);
router.put("/:id", authMiddleware, updateApplication);
router.delete("/:id", authMiddleware, deleteApplication);

module.exports = router;
