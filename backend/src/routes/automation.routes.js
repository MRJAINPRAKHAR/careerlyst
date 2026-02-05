const express = require('express');
const router = express.Router();
const gmailService = require('../services/gmail.service');
const parserService = require('../services/parser.service');
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Helper: Strict Filter for Job Emails
function isJobEmail(subject, snippet) {
    const text = (subject + " " + snippet).toLowerCase();

    // 1. Negative Keywords (Immediate Fail)
    const negativeKeywords = [
        "credit card", "statement", "bill", "invoice", "payment due",
        "score card", "exam result", "loan", "newsletter", "promotional",
        "verify your email", "password reset", "security alert", "otp",
        "left to apply", "recommended", "updates for you", "friend request",
        "people you may know", "shipping", "delivery", "order confirmed",
        "refund", "commission", "earnings", "points", "reward",
        "facebook", "instagram", "twitter", "linkedin notification",
        "commented", "tagged", "timeline"
    ];

    if (negativeKeywords.some(kw => text.includes(kw))) {
        console.log(`[Automation] Skipped (Negative Keyword): ${subject}`);
        return false;
    }

    // 2. Positive Keywords (Must have at least one)
    const positiveKeywords = [
        "application", "applied", "interview", "offer", "recruiter",
        "hiring", "opening", "team", "talent", "careers", "job", "position",
        "candidacy", "resume", "shortlist", "assessment", "submission",
        "round", "internship", "results", "challenge", "hackathon", "internship"
    ];

    if (!positiveKeywords.some(kw => text.includes(kw))) {
        console.log(`[Automation] Skipped (No Positive Keyword): ${subject}`);
        return false;
    }

    return true;
}

// Helper: Run Scan Logic
async function runScan(userId, customQuery = null) {
    console.log(`[Automation] Starting scan for User ID: ${userId}`);
    const query = customQuery || 'subject:(application OR applied OR "thank you" OR "interview" OR "offer" OR "rejected" OR "update" OR "status" OR "assessment" OR "round" OR "submission" OR "hiring") -credit -card -statement -newsletter -bill -invoice -alert -notification -from:me';
    const messages = await gmailService.listMessages(query);
    console.log(`[Automation] Found ${messages.length} messages.`);

    let addedCount = 0;

    for (const msg of messages) {
        try {
            const fullMsg = await gmailService.getMessage(msg.id);

            // STRICT FILTER CHECK
            const subject = fullMsg.payload.headers.find(h => h.name === 'Subject')?.value || "";
            const snippet = fullMsg.snippet || "";

            if (!isJobEmail(subject, snippet)) {
                continue;
            }

            const jobData = parserService.parse(fullMsg);

            if (jobData) {
                // SMART SYNC: Check if Company exists (fuzzy match could be better, but exact match for now)
                const [existing] = await db.query(
                    'SELECT id, status, date_applied, role FROM applications WHERE company LIKE ? AND user_id = ?',
                    [`%${jobData.company}%`, userId]
                );

                if (existing.length === 0) {
                    // NEW APPLICATION
                    const [result] = await db.query(
                        `INSERT INTO applications (user_id, company, role, status, date_applied, ai_chance) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [userId, jobData.company, jobData.role, jobData.status, jobData.date, jobData.aiChance]
                    );

                    if (jobData.status === 'Interview') {
                        await db.query(
                            "INSERT INTO events (user_id, application_id, title, description, event_type, event_date, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
                            [userId, result.insertId, `Interview with ${jobData.company}`, `Automatically detected from email. Role: ${jobData.role}`, 'interview', jobData.date, 'email_auto']
                        );
                        console.log(`[Automation] Created Calendar Event (New App): Interview with ${jobData.company}`);
                    }

                    addedCount++;
                } else {
                    // UPDATE EXISTING APPLICATION (Manual or Previous Sync)
                    const app = existing[0];
                    const currentStatus = app.status;
                    const newStatus = jobData.status;
                    const newDate = new Date(jobData.date);
                    const oldDate = new Date(app.date_applied);

                    console.log(`[Smart Sync] Found match for ${jobData.company}. Current: ${currentStatus}, New: ${newStatus}`);

                    const updates = [];
                    const params = [];

                    // 1. Status Update Priority
                    // Only update if new status is 'richer' or different (e.g. Applied -> Interview, or Interview -> Rejected)
                    // Don't overwrite 'Rejected' with 'Applied' unless it's a new application (by date?)
                    // For now, simpler logic: If new status != Applied, take it. If new status == Applied, keep existing unless existing is null.

                    let shouldUpdateStatus = false;
                    if (newStatus !== 'Applied' && newStatus !== currentStatus) {
                        shouldUpdateStatus = true;
                    }
                    // If currently "Applied" and we found "Applied" email from earlier date? No change.

                    if (shouldUpdateStatus) {
                        updates.push("status = ?");
                        params.push(newStatus);
                        console.log(`[Smart Sync] Updating status: ${currentStatus} -> ${newStatus}`);

                        // If Interview, create event if missing
                        if (newStatus === 'Interview') {
                            const [existingEvents] = await db.query(
                                "SELECT id FROM events WHERE user_id = ? AND title LIKE ? AND event_date = ?",
                                [userId, `Interview with ${jobData.company}%`, jobData.date]
                            );
                            if (existingEvents.length === 0) {
                                await db.query(
                                    "INSERT INTO events (user_id, application_id, title, description, event_type, event_date, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                    [userId, app.id, `Interview with ${jobData.company}`, `Automatically detected from email. Role: ${jobData.role}`, 'interview', jobData.date, 'email_auto']
                                );
                            }
                        }
                    }

                    // 2. Role Update (Enrichment)
                    // If manual entry had generic role or mismatched, maybe update? 
                    // Only if manual entry role is missing or generic.
                    // Skipping for now to respect user manual entry.

                    // 3. Date Correction
                    // If the email date is OLDER than the manual entry date (and not just today's sync date), 
                    // it might mean the user added it today but applied days ago.
                    // Or if existing date is 1970/null.
                    if (newDate < oldDate || !app.date_applied) {
                        updates.push("date_applied = ?");
                        params.push(jobData.date);
                    }

                    if (updates.length > 0) {
                        params.push(app.id);
                        const setClause = updates.join(", ");
                        await db.query(`UPDATE applications SET ${setClause} WHERE id = ?`, params);
                        console.log(`[Smart Sync] Updated Application ${app.id} (${jobData.company})`);
                    }
                }
            }
        } catch (e) {
            console.error("[Automation] Error parsing msg", e);
        }
    }
    return addedCount;
}

// 1. Start OAuth Flow
router.get('/auth/google', (req, res) => {
    // Expect userId from query (passed by /scan failure) or default to 1
    const userId = req.query.userId || '1';

    // Pass userId as state to preserve it
    const url = gmailService.getAuthUrl(userId.toString());
    res.redirect(url);
});

// 2. OAuth Callback
router.get('/callback', async (req, res) => {
    const { code, state } = req.query; // state is the userId
    try {
        const tokens = await gmailService.setCredentials(code);
        const userId = state || 1;

        // Save Tokens (Access + Refresh + Expiry)
        await db.query(
            `UPDATE users 
             SET google_access_token = ?, 
                 google_refresh_token = COALESCE(?, google_refresh_token), 
                 google_token_expiry = ? 
             WHERE id = ?`,
            [tokens.access_token, tokens.refresh_token || null, tokens.expiry_date, userId]
        );
        console.log(`[Automation] OAuth Tokens saved for User ${userId}`);

        // Run Initial Scan
        const count = await runScan(userId);

        res.redirect(`${process.env.FRONTEND_URL}/dashboard?sync=success&count=${count}`);

    } catch (error) {
        console.error("Auth Error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?sync=error`);
    }
});

// 3. Trigger Scan (Smart Sync) - Protected
router.post('/scan', verifyToken, async (req, res) => {
    try {
        console.log("👉 /api/automation/scan HIT");
        const userId = req.user.id; // From middleware
        console.log("👉 User ID from Token:", userId);

        // 1. Check DB for token
        const [users] = await db.query(
            "SELECT google_access_token, google_refresh_token, google_token_expiry FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            console.log("❌ User not found in DB for ID:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        const { google_access_token, google_refresh_token, google_token_expiry } = users[0];

        if (!google_refresh_token) {
            console.log("❌ Refresh Token missing for User:", userId);
            return res.status(401).json({
                message: "Auth required",
                authUrl: `${process.env.BACKEND_URL}/api/automation/auth/google?userId=${userId}`
            });
        }

        // 2. Set Credentials
        gmailService.oAuth2Client.setCredentials({
            access_token: google_access_token,
            refresh_token: google_refresh_token,
            expiry_date: google_token_expiry
        });

        // 3. Run Scan
        const { type } = req.body || {};
        let customQuery = null;

        if (type === 'linkedin') {
            customQuery = 'from:linkedin subject:(application OR applied)';
        }

        const count = await runScan(userId, customQuery);
        res.json({ message: "Scan complete", count });

    } catch (err) {
        console.error("Scan Error:", err);

        // Only force re-auth if it's actually an auth error
        if (err.message && (err.message.includes('invalid_grant') || err.message.includes('unauthorized') || err.message.includes('invalid_token') || err.response?.status === 401)) {
            return res.status(401).json({
                message: "Auth expired",
                authUrl: `${process.env.BACKEND_URL}/api/automation/auth/google?userId=${req.user.id}`
            });
        }

        // Otherwise return 500 so frontend doesn't redirect
        res.status(500).json({ message: "Scan failed", error: err.message });
    }
});


// 4. Extension Sync Endpoint
router.post('/extension-sync', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { jobs } = req.body; // Array of { company, role, status, date, source }

        if (!jobs || !Array.isArray(jobs)) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        console.log(`[Extension] Syncing ${jobs.length} jobs for User ${userId}`);
        let addedCount = 0;

        for (const job of jobs) {
            // Basic dupe check (Company + Role)
            const [existing] = await db.query(
                "SELECT id FROM applications WHERE company = ? AND role = ? AND user_id = ?",
                [job.company, job.role, userId]
            );

            if (existing.length === 0) {
                await db.query(
                    `INSERT INTO applications (user_id, company, role, status, date_applied, ai_chance, notes) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        userId,
                        job.company,
                        job.role,
                        'applied', // extension status map or default
                        new Date(), // or job.date if parsable
                        75, // Default AI Chance for manual/extension
                        'Synced via Chrome Extension'
                    ]
                );
                addedCount++;
            }
        }

        res.json({ message: "Sync successful", added: addedCount });

    } catch (err) {
        console.error("Extension Sync Error:", err);
        res.status(500).json({ message: "Sync failed" });
    }
});

// 5. Reset Data (Clear all applications)
router.post('/reset', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[Automation] RESETTING data for User ${userId}`);

        await db.query("DELETE FROM applications WHERE user_id = ?", [userId]);

        res.json({ message: "Data reset successful" });
    } catch (err) {
        console.error("Reset Error:", err);
        res.status(500).json({ message: "Reset failed" });
    }
});

module.exports = router;
