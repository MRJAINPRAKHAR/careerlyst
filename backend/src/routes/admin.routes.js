const express = require('express');
const router = express.Router();
const { getStats, getUsers, getFeedback, updateFeedbackStatus } = require('../controllers/admin.controller');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(verifyAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/feedback', getFeedback);
router.patch('/feedback/:id', updateFeedbackStatus);

module.exports = router;
