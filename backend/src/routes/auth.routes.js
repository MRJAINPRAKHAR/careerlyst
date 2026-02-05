const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');


const {
  register,
  login,
  googleLogin,
  completeOnboarding,
  getMe,
  updateResume,
  updateProfile,
  uploadAvatar,
  uploadBanner,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  connectGoogle,
  googleCallback,
  updatePassword,
  deleteAccount
} = require('../controllers/auth.controller');

const { parseResume } = require('../controllers/resume.controller');
const { verifyToken } = require('../middleware/authMiddleware');


const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Configuration
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn("> [WARN] CLOUDINARY_CLOUD_NAME is missing in environment variables!");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("> [SYS] Cloudinary Storage Initialized with Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    return {
      folder: 'careerlyst',
      resource_type: 'auto',
      public_id: `${file.fieldname}-${Date.now()}`,
      format: isPDF ? 'pdf' : undefined
    };
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});


router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/google/connect', verifyToken, connectGoogle);
router.get('/google/callback', googleCallback);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', verifyToken, getMe);


router.post('/complete-onboarding', verifyToken, completeOnboarding);
router.post('/update-resume', verifyToken, upload.single('resume'), updateResume);
router.post('/parse', verifyToken, upload.single('resume'), parseResume);


router.post('/update-password', verifyToken, updatePassword);
router.delete('/delete-account', verifyToken, deleteAccount);
router.post('/update-profile', verifyToken, updateProfile);
router.post('/upload-avatar', verifyToken, upload.single('avatar'), uploadAvatar);
router.post('/upload-banner', verifyToken, upload.single('banner'), uploadBanner);

module.exports = router;