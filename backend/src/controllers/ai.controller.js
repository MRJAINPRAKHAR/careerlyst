const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const groqService = require("../services/groq.service");
const ollamaService = require("../services/ollama.service");

const axios = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to get PDF buffer from either local or remote URL
const getPdfBuffer = async (resumeUrl) => {
    if (resumeUrl.startsWith('http')) {
        const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } else {
        const filename = resumeUrl.split('/uploads/').pop();
        const filePath = path.resolve(__dirname, '../../uploads', filename);
        if (!fs.existsSync(filePath)) {
            throw new Error("Local resume file missing");
        }
        return fs.readFileSync(filePath);
    }
};

exports.analyzeResume = async (req, res) => {
    try {
        const userId = req.user.id;

        const [userRows] = await db.query(
            "SELECT daily_resume_scans, last_resume_scan_date FROM users WHERE id = ?",
            [userId]
        );

        if (userRows.length > 0) {
            const user = userRows[0];
            const today = new Date().toLocaleDateString('en-CA');
            const lastDate = user.last_resume_scan_date ? new Date(user.last_resume_scan_date).toLocaleDateString('en-CA') : null;

            if (lastDate === today && user.daily_resume_scans >= 3) {
                return res.status(403).json({
                    message: "Daily scan limit reached (3/3). Please try again tomorrow."
                });
            }
        }

        let dataBuffer;
        let isTempFile = false;
        let tempFilePath = null;

        if (req.file) {
            tempFilePath = req.file.path;
            dataBuffer = fs.readFileSync(tempFilePath);
            isTempFile = true;
        } else {
            const [rows] = await db.query("SELECT resume_url FROM users WHERE id = ?", [userId]);

            if (rows.length === 0 || !rows[0].resume_url) {
                return res.status(400).json({ message: "No resume found. Please upload one." });
            }

            try {
                dataBuffer = await getPdfBuffer(rows[0].resume_url);
            } catch (err) {
                return res.status(404).json({ message: err.message });
            }
        }

        const pdfData = await pdfParse(dataBuffer);
        const resumeText = pdfData.text;

        if (!resumeText || resumeText.length < 50) {
            return res.status(400).json({ message: "Resume content is too short or unreadable." });
        }

        const { jobDescription } = req.body;

        let systemPrompt;
        let userPrompt;

        if (jobDescription && jobDescription.length > 10) {
            systemPrompt = `
                Act as an expert Recruiter and ATS Algorithm.
                Compare the Candidate's Resume against the provided Job Description.
                
                Strictly output ONLY a JSON object with this exact schema:
                {
                    "score": number (0-100),
                    "summary": "Short verdict on fit (e.g. 'Strong Match' or 'High Gap')",
                    "strengths": ["Matched Skill 1", "Matched Skill 2"],
                    "weaknesses": ["Missing Keyword 1", "Missing Keyword 2"],
                    "action_plan": ["Specific advice to tailor resume for this job", "Add X keyword to summary", "Highlight Y experience"]
                }
            `;
            userPrompt = `
                JOB DESCRIPTION:
                ${jobDescription}

                RESUME TEXT:
                ${resumeText.substring(0, 10000)}
            `;
        } else {
            systemPrompt = `
                Act as an expert ATS (Applicant Tracking System) and Career Coach. 
                Analyze the following resume text.
                
                Strictly output ONLY a JSON object with this exact schema:
                {
                    "score": number (0-100),
                    "summary": "1-2 sentence high-level summary",
                    "strengths": ["string", "string", "string"],
                    "weaknesses": ["string", "string", "string"],
                    "action_plan": ["Specific step 1", "Specific step 2", "Specific step 3"]
                }
            `;
            userPrompt = `
                RESUME TEXT:
                ${resumeText.substring(0, 10000)}
            `;
        }

        let text = "";

        try {
            text = await groqService.generateResponse(userPrompt, systemPrompt);
        } catch (groqErr) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                const generateWithRetry = async (retries = 3, delay = 5000) => {
                    try {
                        const result = await model.generateContent(systemPrompt + "\n" + userPrompt);
                        return result;
                    } catch (err) {
                        if (err.status === 429 && retries > 0) {
                            await new Promise(resolve => setTimeout(resolve, delay));
                            return generateWithRetry(retries - 1, delay * 2);
                        }
                        throw err;
                    }
                };

                const result = await generateWithRetry();
                const response = await result.response;
                text = response.text();
            } catch (geminiErr) {
                try {
                    const useOllama = await ollamaService.isOllamaRunning();
                    if (useOllama) {
                        text = await ollamaService.generateResponse(userPrompt, systemPrompt);
                    } else {
                        throw new Error("Ollama not running");
                    }
                } catch (ollamaErr) {
                    return res.status(500).json({ message: "AI services unavailable" });
                }
            }
        }

        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1) {
            console.error("Failed to parse AI response (No JSON found):", text);
            return res.status(500).json({ message: "AI Analysis failed to generate valid JSON." });
        }

        const cleanJson = text.substring(firstBrace, lastBrace + 1);

        let analysis;
        try {
            analysis = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse AI JSON:", cleanJson);
            return res.status(500).json({ message: "AI analysis return invalid JSON format." });
        }

        if (isTempFile && tempFilePath) {
            fs.unlinkSync(tempFilePath);
        }

        const todayStr = new Date().toLocaleDateString('en-CA');
        const lastDateStr = userRows[0].last_resume_scan_date ? new Date(userRows[0].last_resume_scan_date).toLocaleDateString('en-CA') : null;

        let newCount = 1;
        if (lastDateStr === todayStr) {
            newCount = (userRows[0].daily_resume_scans || 0) + 1;
        }

        await db.query(`
            UPDATE users 
            SET daily_resume_scans = ?,
                last_resume_scan_date = ?,
                last_analysis_result = ?
            WHERE id = ?
        `, [newCount, todayStr, JSON.stringify(analysis), userId]);
        res.json({
            analysis: analysis,
            usage: {
                dailyScans: newCount,
                lastScanDate: todayStr
            }
        });

    } catch (err) {
        console.error("Resume Analysis Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

exports.chatWithAI = async (req, res) => {
    try {
        let { message, history } = req.body;
        const files = req.files || [];
        const userId = req.user.id;

        if (!message && files.length === 0) {
            return res.status(400).json({ message: "Message or file is required" });
        }

        let userContext = "";
        try {
            const [statusRows] = await db.query(
                `SELECT status, COUNT(*) AS count FROM applications WHERE user_id = ? GROUP BY status`,
                [userId]
            );
            const stats = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0, Total: 0 };
            statusRows.forEach(row => {
                stats[row.status] = row.count;
                stats.Total += row.count;
            });

            const [recentApps] = await db.query(
                `SELECT company, role, status, created_at FROM applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`,
                [userId]
            );

            const recentList = recentApps.map(app =>
                `- ${app.role} at ${app.company} (${app.status})`
            ).join("\n");

            userContext = `
                DASHBOARD CONTEXT:
                - Total Applications: ${stats.Total}
                - Breakdown: Applied(${stats.Applied || 0}), Interview(${stats.Interview || 0}), Offer(${stats.Offer || 0}), Rejected(${stats.Rejected || 0}).
                
                RECENT ACTIVITY:
                ${recentApps.length > 0 ? recentList : "No applications recorded yet."}
            `;
        } catch (dbErr) {
            userContext = "User context unavailable.";
        }

        let fileContext = "";
        if (files.length > 0) {
            for (const file of files) {
                try {
                    let fileText = "";
                    if (file.mimetype === 'application/pdf') {
                        const dataBuffer = fs.readFileSync(file.path);
                        const pdfData = await pdfParse(dataBuffer);
                        fileText = pdfData.text;
                    } else if (file.mimetype.startsWith('text/') || file.mimetype === 'application/json' || file.mimetype.includes('javascript')) {
                        fileText = fs.readFileSync(file.path, 'utf-8');
                    } else {
                        fileText = `[File: ${file.originalname} - Type: ${file.mimetype} (Content processing skipped)]`;
                    }
                    fileContext += `\n\n--- FILE ATTACHMENT: ${file.originalname} ---\n${fileText.substring(0, 20000)}\n--- END FILE ---\n`;
                    fs.unlinkSync(file.path);
                } catch (err) {
                    console.error(`Error processing file ${file.originalname}:`, err);
                    fileContext += `\n[Error reading file ${file.originalname}]\n`;
                }
            }
        }

        const fullMessage = message + (fileContext ? `\n\nCONTEXT FROM UPLOADED FILES:${fileContext}` : "");

        const systemPrompt = `
            You are "Nova", a smart AI companion for this Careerlyst app.
            
            YOUR CAPABILITIES:
            1. Explain App Features (Pipeline, AI Coach, Extension).
            2. Career Advice (Resumes, Interviews).
            3. DOCUMENT ANALYSIS: Analyze uploaded text/code.
            4. USER AWARENESS: Use the dashboard stats below.
            
            ====== DASHBOARD DATA (SOURCE OF TRUTH) ======
            ${userContext}
            ==============================================

            CRITICAL RULES:
            - IGNORE chat history if it contradicts Dashboard Data.
            - If Total Applications = 0, encourage starting.
            - Reply in the same language as the user.
            - Be concise, friendly, and motivating. Use emojis.
        `;

        let parsedHistory = [];
        try {
            parsedHistory = typeof history === 'string' ? JSON.parse(history) : (history || []);
        } catch (e) {
            console.error("Failed to parse chat history:", e);
            parsedHistory = [];
        }

        const historyText = parsedHistory
            .slice(-5)
            .map(m => `${m.sender === 'user' ? 'User' : 'Nova'}: ${m.text}`)
            .join("\n");

        const finalPrompt = `
            ${systemPrompt}
            
            CHAT HISTORY:
            ${historyText}
            
            CURRENT USER MESSAGE:
            ${fullMessage}
        `;

        let reply = "";

        try {
            reply = await groqService.generateResponse(finalPrompt);
        } catch (groqErr) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                const chatHistory = (typeof history === 'string' ? JSON.parse(history) : history || []).slice(-10).map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }));

                const chat = model.startChat({
                    history: [
                        {
                            role: "user",
                            parts: [{ text: systemPrompt }]
                        },
                        {
                            role: "model",
                            parts: [{ text: "Understood. Ready to help." }]
                        },
                        ...chatHistory
                    ]
                });

                const sendMessageWithRetry = async (msg, retries = 5, delay = 5000) => {
                    try {
                        return await chat.sendMessage(msg);
                    } catch (err) {
                        if (err.status === 429 && retries > 0) {
                            await new Promise(resolve => setTimeout(resolve, delay));
                            return sendMessageWithRetry(msg, retries - 1, delay * 2);
                        }
                        throw err;
                    }
                };

                const result = await sendMessageWithRetry(fullMessage);
                reply = (await result.response).text();
            } catch (geminiErr) {
                try {
                    const useOllama = await ollamaService.isOllamaRunning();
                    if (useOllama) {
                        reply = await ollamaService.generateResponse(finalPrompt);
                    } else {
                        throw new Error("Ollama not running");
                    }
                } catch (ollamaErr) {
                    return res.status(500).json({ message: "Nova is currently unavailable." });
                }
            }
        }

        res.json({ reply });

    } catch (err) {
        console.error("ChatBot Error:", err);
        if (err.status === 429) {
            return res.status(429).json({ message: "Nova is very popular! 🚦 Please wait a minute or start Ollama for unlimited speed." });
        }
        res.status(500).json({ message: "Nova is offline. Try checking your connection." });
    }
};

exports.matchJobToResume = async (req, res) => {
    try {
        const { jobDescription } = req.body;
        const userId = req.user.id;

        if (!jobDescription || jobDescription.length < 50) {
            return res.status(400).json({ message: "Please provide a valid Job Description." });
        }

        // 1. Get Resume Content
        const [rows] = await db.query("SELECT resume_url FROM users WHERE id = ?", [userId]);
        if (rows.length === 0 || !rows[0].resume_url) {
            return res.status(404).json({ message: "No resume found. Please upload one first." });
        }

        let dataBuffer;
        try {
            dataBuffer = await getPdfBuffer(rows[0].resume_url);
        } catch (err) {
            return res.status(404).json({ message: err.message });
        }

        // 2. Parse Resume
        const pdfData = await pdfParse(dataBuffer);
        const resumeText = pdfData.text;

        // 3. AI Match (Using Ollama or Fallback)
        const useOllama = await ollamaService.isOllamaRunning();
        const systemPrompt = `
            Act as an expert Recruiter and ATS Algorithm.
            Compare the User's Resume against the Job Description.

            OUTPUT JSON ONLY:
            {
                "match_score": number (0-100),
                "missing_keywords": ["skill1", "tool2"],
                "verdict": "Short sentence summary"
            }
        `;

        const userPrompt = `
            JOB DESCRIPTION:
            ${jobDescription}

            RESUME:
            ${resumeText.substring(0, 10000)}
        `;

        let jsonResponse = "";

        try {
            jsonResponse = await groqService.generateResponse(userPrompt, systemPrompt);
        } catch (groqErr) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                const result = await model.generateContent(systemPrompt + "\n" + userPrompt);
                jsonResponse = result.response.text();
            } catch (geminiErr) {
                try {
                    const useOllama = await ollamaService.isOllamaRunning();
                    if (useOllama) {
                        jsonResponse = await ollamaService.generateResponse(userPrompt, systemPrompt);
                    } else {
                        throw new Error("Ollama not running");
                    }
                } catch (ollamaErr) {
                    return res.status(500).json({ message: "Matching service unavailable" });
                }
            }
        }

        // 4. Parse JSON
        const firstBrace = jsonResponse.indexOf('{');
        const lastBrace = jsonResponse.lastIndexOf('}');

        let matchData;
        if (firstBrace !== -1 && lastBrace !== -1) {
            const cleanJson = jsonResponse.substring(firstBrace, lastBrace + 1);
            try {
                matchData = JSON.parse(cleanJson);
            } catch (e) {
                console.error("Job Match JSON Parse Error:", cleanJson);
                matchData = { match_score: 0, missing_keywords: [], verdict: "AI response format error." };
            }
        } else {
            console.error("Job Match: No JSON found in response:", jsonResponse);
            matchData = { match_score: 0, missing_keywords: [], verdict: "AI response format error." };
        }

        res.json(matchData);

    } catch (err) {
        console.error("Job Match Error:", err);
        res.status(500).json({ message: "Analysis failed", error: err.message });
    }
};
