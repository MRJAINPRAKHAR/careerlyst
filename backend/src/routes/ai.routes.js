const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/ai.controller');
const { verifyToken } = require('../middleware/authMiddleware');

const path = require('path');


// TEMPORARY: Using local storage due to Cloudinary 401 authentication issues
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Protected route: Upload resume for analysis
router.post('/resume-score', verifyToken, upload.single('resume'), aiController.analyzeResume);

// Protected route: AI Chatbot
router.post('/chat', verifyToken, upload.array('files', 2), aiController.chatWithAI);

// Protected route: Match Job Description to Resume (RAG)
router.post('/match-job', verifyToken, aiController.matchJobToResume);

module.exports = router;
