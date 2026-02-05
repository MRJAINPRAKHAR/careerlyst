const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/ai.controller');
const { verifyToken } = require('../middleware/authMiddleware');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPDF = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
        return {
            folder: 'careerlyst/temp_scans',
            resource_type: isPDF ? 'raw' : 'auto',
            type: 'upload',  // 'upload' type is public by default
            public_id: `resume-${Date.now()}`,
            format: isPDF ? 'pdf' : undefined
        };
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
