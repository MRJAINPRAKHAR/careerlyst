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


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, 'file-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
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