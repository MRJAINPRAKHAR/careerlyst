const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require('../utils/emailService');
const gmailService = require('../services/gmail.service');

const checkOnboardingStatus = (user) => {
  return user.job_title && user.mobile_no && user.education ? true : false;
};

const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: "All fields are required" });

    // Password Strength Check
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 chars, include uppercase, lowercase, number, and special char."
      });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password, otp_code, otp_expires_at, is_verified) VALUES (?, ?, ?, ?, ?, FALSE)",
      [fullName, email, passwordHash, otp, otpExpires]
    );

    // Send Email
    const emailSent = await sendEmail(email, "Verify Your Account - Careerlyst", `
        <h3>Welcome to Careerlyst!</h3>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 5px; color: #6366f1;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
    `);

    if (!emailSent) {
      return res.status(500).json({ message: "User registered but failed to send OTP. Please try login to resend." });
    }

    return res.status(201).json({ message: "OTP sent to email. Please verify.", userId: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 1.5 VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) return res.status(404).json({ message: "User not found" });
    const user = users[0];

    if (user.otp_code !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (new Date() > new Date(user.otp_expires_at)) return res.status(400).json({ message: "OTP Expired" });

    await pool.query("UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE id = ?", [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({ message: "Email verified successfully!", token, isOnboarded: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// 1.6 RESEND OTP
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    //    if (users[0].is_verified) return res.status(400).json({ message: "Account already verified. Please login." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query("UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?", [otp, otpExpires, users[0].id]);

    await sendEmail(email, "Resend Verification Code", `<h3>Your new code is: ${otp}</h3>`);

    return res.json({ message: "OTP resent successfully." });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query("UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?", [otp, otpExpires, users[0].id]);

    const sent = await sendEmail(email, "Reset Your Password - Careerlyst", `
        <h3>Password Reset Request</h3>
        <p>Your password reset code is:</p>
        <h1 style="letter-spacing: 5px; color: #f43f5e;">${otp}</h1>
        <p>This code expires in 10 minutes. If you did not request this, ignore this email.</p>
    `);

    if (!sent) {
      return res.status(500).json({ message: "Email service failed to send." });
    }

    res.json({ message: "Password reset OTP sent to email." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 1.8 RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });
    const user = users[0];

    if (user.otp_code !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (new Date() > new Date(user.otp_expires_at)) return res.status(400).json({ message: "OTP Expired" });

    // Validate Password Strength
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({ message: "Password weak. Needs 8+ chars, Uppercase, Lowercase, Number, Special char." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = ?, otp_code = NULL, otp_expires_at = NULL WHERE id = ?",
      [passwordHash, user.id]
    );

    res.json({ message: "Password reset successfully. Please login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = users[0];
    if (user.password === 'GOOGLE_AUTH') return res.status(400).json({ message: "Please sign in with Google" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.is_verified) {
      return res.status(403).json({ message: "Email not verified", email: user.email, requireVerification: true });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const isOnboarded = checkOnboardingStatus(user);

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
      isOnboarded
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 3. GOOGLE LOGIN
const googleLogin = async (req, res) => {
  const { email, name, fullName, googleUid } = req.body;
  const userName = name || fullName || "Google User";

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user = null;
    let isNewUser = false;

    if (users.length > 0) {
      user = users[0];
      // If user logged in with password but now uses Google, we auto-verify them
      if (!user.is_verified) await pool.query("UPDATE users SET is_verified = TRUE WHERE id = ?", [user.id]);
      if (!user.google_uid) await pool.query('UPDATE users SET google_uid = ? WHERE id = ?', [googleUid, user.id]);
    } else {
      const [result] = await pool.query(
        'INSERT INTO users (full_name, email, password, google_uid, is_verified) VALUES (?, ?, ?, ?, TRUE)',
        [userName, email, 'GOOGLE_AUTH', googleUid]
      );
      const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newUser[0];
      isNewUser = true;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const isOnboarded = checkOnboardingStatus(user);

    res.json({
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email },
      isNewUser,
      isOnboarded
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 4. COMPLETE ONBOARDING
const completeOnboarding = async (req, res) => {
  try {
    const {
      fullName, mobileNo, jobTitle, experienceRange,
      skills, education, workHistory, certifications, achievements,
      city, state, country, bio
    } = req.body;

    const userId = req.user.id;

    const formatJson = (data) => {
      if (typeof data === 'string') return data;
      return JSON.stringify(data || []);
    };

    const query = `
      UPDATE users 
      SET 
        full_name = ?, 
        mobile_no = ?, 
        job_title = ?, 
        experience = ?, 
        skills = ?, 
        education = ?, 
        work_history = ?, 
        certificates = ?, 
        achievements = ?,
        city = ?,
        state = ?,
        country = ?,
        bio = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(query, [
      fullName, mobileNo, jobTitle, experienceRange,
      formatJson(skills), formatJson(education), formatJson(workHistory), formatJson(certifications), formatJson(achievements),
      city, state, country, bio,
      userId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Profile synchronized successfully!", isOnboarded: true });
  } catch (err) {
    console.error("ONBOARDING ERROR:", err.message);
    return res.status(500).json({ message: "Error saving profile details", error: err.message });
  }
};

// 5. GET CURRENT USER
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
            SELECT id, full_name, email, job_title, mobile_no, experience,
                   skills, education, work_history, certificates, achievements,
                   city, state, country,
                   username, bio, profile_pic, banner_url, resume_url,
                   linkedin, twitter, github, leetcode, hackerrank,
                   username_last_changed,
                   daily_resume_scans, last_resume_scan_date, last_analysis_result
            FROM users WHERE id = ?`,
      [userId]
    );

    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    const user = rows[0];

    res.json({
      ...user,
      fullName: user.full_name, // Mapping for frontend
      jobTitle: user.job_title,
      mobileNo: user.mobile_no,
      city: user.city,
      state: user.state,
      country: user.country,
      bio: user.bio,
      resumeUrl: user.resume_url,
      bannerUrl: user.banner_url || null,
      profilePic: user.profile_pic || `https://ui-avatars.com/api/?name=${(user.full_name || "User").split(" ").join("+")}&background=6366f1&color=fff`,
      links: {
        linkedin: user.linkedin,
        twitter: user.twitter,
        github: user.github,
        leetcode: user.leetcode,
        hackerrank: user.hackerrank
      },
      usage: {
        dailyScans: user.daily_resume_scans || 0,
        lastScanDate: user.last_resume_scan_date,
        lastAnalysis: user.last_analysis_result // Will be auto-parsed by mysql2 driver if JSON type
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ... (Rest of file) ...


const updateResume = async (req, res) => {
  try {
    if (!req.file) {
      console.log("> [DEBUG] No file found in updateResume request body:", req.body);
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("> [DEBUG] req.file content in updateResume:", JSON.stringify(req.file, null, 2));
    const userId = req.user.id;
    const resumeUrl = req.file.path; // Cloudinary URL
    if (!resumeUrl) throw new Error("Cloudinary did not return a URL during profile update");

    await pool.query("UPDATE users SET resume_url = ? WHERE id = ?", [resumeUrl, userId]);

    res.json({ message: "Resume updated successfully", resumeUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 7. UPDATE PROFILE (FULL UPDATE)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName, bio, dob, jobTitle, username, links,
      mobileNo, city, state, country,
      skills, education, workHistory, certifications, achievements
    } = req.body;

    const validDob = dob === "" ? null : dob;

    const formatJson = (data) => typeof data === 'string' ? data : JSON.stringify(data || []);

    let sql = `
      UPDATE users SET 
        full_name=?, bio=?, job_title=?, 
        linkedin=?, twitter=?, github=?, leetcode=?, hackerrank=?,
        mobile_no=?, city=?, state=?, country=?,
        skills=?, education=?, work_history=?, certificates=?, achievements=?
      WHERE id=?
    `;

    let params = [
      fullName, bio, jobTitle,
      links?.linkedin, links?.twitter, links?.github, links?.leetcode, links?.hackerrank,
      mobileNo, city, state, country,
      formatJson(skills), formatJson(education), formatJson(workHistory), formatJson(certifications), formatJson(achievements),
      userId
    ];

    // Check if username is being updated (and is different)
    if (username) {
      const [currentUserRows] = await pool.query("SELECT username, username_last_changed FROM users WHERE id = ?", [userId]);
      const currentUser = currentUserRows[0];

      if (username !== currentUser.username) {
        // Check username availability
        const [taken] = await pool.query("SELECT id FROM users WHERE username = ? AND id != ?", [username, userId]);
        if (taken.length > 0) return res.status(400).json({ message: "Username already taken." });

        // Check 30-day rule
        const lastChanged = currentUser.username_last_changed ? new Date(currentUser.username_last_changed) : null;

        if (lastChanged) {
          const daysDiff = (new Date() - lastChanged) / (1000 * 60 * 60 * 24);
          if (daysDiff < 30) {
            return res.status(400).json({ message: `You can change username again in ${Math.ceil(30 - daysDiff)} days.` });
          }
        }

        // Use SQL that updates username & timestamp
        sql = `
            UPDATE users SET 
              full_name=?, bio=?, job_title=?, 
              linkedin=?, twitter=?, github=?, leetcode=?, hackerrank=?,
              mobile_no=?, city=?, state=?, country=?,
              skills=?, education=?, work_history=?, certificates=?, achievements=?,
              username=?, username_last_changed=NOW()
            WHERE id=?
          `;
        params = [
          fullName, bio, jobTitle,
          links?.linkedin, links?.twitter, links?.github, links?.leetcode, links?.hackerrank,
          mobileNo, city, state, country,
          formatJson(skills), formatJson(education), formatJson(workHistory), formatJson(certifications), formatJson(achievements),
          username,
          userId
        ];
      }
    }

    await pool.query(sql, params);
    res.json({ message: "Profile updated successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// 8. UPLOAD AVATAR
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const userId = req.user.id;
    const avatarUrl = req.file.path; // Cloudinary URL

    await pool.query("UPDATE users SET profile_pic = ? WHERE id = ?", [avatarUrl, userId]);
    res.json({ message: "Avatar updated", avatarUrl });
  } catch (err) {
    console.error("Avatar Upload Error:", err);
    res.status(500).json({ message: "Upload failed: " + err.message });
  }
};

// 9. CONNECT GMAIL OAUTH
const connectGoogle = (req, res) => {
  try {
    const url = gmailService.getAuthUrl(req.user.id.toString()); // Pass user ID as state
    res.redirect(url);
  } catch (err) {
    console.error("Link Google Error:", err);
    res.status(500).json({ message: "Failed to generate auth url" });
  }
};

// 8.5 UPLOAD BANNER
const uploadBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const userId = req.user.id;
    const bannerUrl = req.file.path; // Cloudinary URL

    await pool.query("UPDATE users SET banner_url = ? WHERE id = ?", [bannerUrl, userId]);
    res.json({ message: "Banner updated", bannerUrl });
  } catch (err) {
    console.error("Banner Upload Error:", err);
    res.status(500).json({ message: "Upload failed: " + err.message });
  }
};

// 10. GOOGLE CALLBACK
const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    if (!code || !userId) {
      return res.status(400).send("Invalid request");
    }

    // Get tokens
    const tokens = await gmailService.setCredentials(code);

    // Save tokens to DB
    // We trust the state parameter here because we initiated it. 
    // In production, sign/verify state or use session to prevent CSRF.

    const query = `
            UPDATE users 
            SET 
                google_access_token = ?, 
                google_refresh_token = COALESCE(?, google_refresh_token), 
                google_token_expiry = ?
            WHERE id = ?
        `;

    // Expiry is usually in ms from now, or seconds? 
    // Google tokens usually have 'expiry_date' (ms timestamp)

    await pool.query(query, [
      tokens.access_token,
      tokens.refresh_token || null, // refresh_token might not be returned if not prompt=consent
      tokens.expiry_date,
      userId
    ]);

    // Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard?status=connected`);

  } catch (err) {
    console.error("Google Callback Error:", err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard?status=failed`);
  }
};

// 11. UPDATE PASSWORD
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password required" });
    }

    // Get user
    const [users] = await pool.query("SELECT password FROM users WHERE id = ?", [userId]);
    const user = users[0];

    // Check if Google User (no password)
    if (user.password === 'GOOGLE_AUTH') {
      return res.status(400).json({ message: "You are logged in via Google. You cannot set a password." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    // Validate New Password Strength
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({ message: "Password too weak. Needs 8+ chars, Uppercase, Lowercase, Number, Special char." });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = ? WHERE id = ?", [passwordHash, userId]);

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Update Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 12. DELETE ACCOUNT
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete Account Error:", err);
    res.status(500).json({ message: "Server error deleting account" });
  }
};

module.exports = {
  register, login, googleLogin, completeOnboarding, getMe, updateResume, updateProfile, uploadAvatar, uploadBanner, verifyEmail, resendOtp, forgotPassword, resetPassword,
  connectGoogle, googleCallback, updatePassword, deleteAccount
};