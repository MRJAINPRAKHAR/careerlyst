const express = require('express');
const router = express.Router();
const { submitFeedback } = require('../controllers/support.controller');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/feedback', verifyToken, submitFeedback);

module.exports = router;
