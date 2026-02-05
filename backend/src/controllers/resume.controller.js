// --- 1. IMPORT FILE SYSTEM & DB
const pdf = require('pdf-parse'); // RESTORED
const fs = require('fs');
const pool = require("../config/db"); // Import DB connection
const { GoogleGenerativeAI } = require("@google/generative-ai");
const groqService = require("../services/groq.service");
const ollamaService = require("../services/ollama.service");

// Use a stable model version
const MODEL_NAME = "gemini-2.5-flash-lite";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseResume = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      console.error("> [ERR] No file received.");
      return res.status(400).json({ message: "No document found." });
    }

    console.log(`> [SYS] ${new Date().toISOString()} - Initializing PDF Extraction...`);

    // --- 1.5 SAVE RESUME URL TO DB ---
    const userId = req.user.id;
    const resumeUrl = req.file.path; // Cloudinary URL

    // Update the user's profile with the resume URL immediately
    await pool.query("UPDATE users SET resume_url = ? WHERE id = ?", [resumeUrl, userId]);
    console.log(`> [DB] Resume URL saved for User ID: ${userId}`);

    const axios = require('axios');
    let dataBuffer = req.file.buffer;

    if (!dataBuffer && req.file.path) {
      if (req.file.path.startsWith('http')) {
        // Handle Cloudinary URL
        const response = await axios.get(req.file.path, { responseType: 'arraybuffer' });
        dataBuffer = Buffer.from(response.data, 'binary');
      } else {
        // Handle local path fallback
        dataBuffer = fs.readFileSync(req.file.path);
      }
    }

    if (!dataBuffer) {
      throw new Error("Unable to read file buffer. Upload failed.");
    }

    // 3. Extract raw text from the buffer
    const data = await pdf(dataBuffer);
    const resumeText = data.text;

    if (!resumeText || resumeText.trim().length < 10) {
      throw new Error("PDF extraction empty.");
    }

    console.log(`> [AI] Text extracted (${resumeText.length} chars). Checking Ollama...`);

    // 4. Hybrid AI Strategy (Groq -> Gemini -> Ollama)
    let text = "";
    const systemPrompt = `
      You are an expert HR data parser. Extract professional data from this resume text.
      Return ONLY a valid JSON object. Do not use Markdown formatting.
      
      Structure:
      {
        "fullName": "string",
        "mobileNo": "string",
        "email": "string",
        "intro": "string (short professional bio)",
        "jobTitle": "string",
        "experienceRange": "string (e.g. 0-1, 1-3, 3-5, 5+)",
        "skills": ["array", "of", "strings"],
        "education": [{"school": "string", "degree": "string", "start": "string", "end": "string"}],
        "workHistory": [{"company": "string", "role": "string", "start": "string", "end": "string", "description": "string"}],
        "certifications": [{"name": "string", "issuer": "string", "date": "string"}],
        "achievements": "string summary of key wins",
        "linkedin": "string",
        "github": "string"
      }
    `;

    const userPrompt = `
      Resume Text:
      ${resumeText.substring(0, 8000)}
    `;

    try {
      console.log(`> [AI] 🟢 Using Groq Cloud (Primary)`);
      text = await groqService.generateResponse(userPrompt, systemPrompt);
    } catch (groqErr) {
      console.log(`> [AI] 🟡 Groq failed. Trying Gemini (${MODEL_NAME})...`);
      try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(systemPrompt + "\n" + userPrompt);
        const response = await result.response;
        text = response.text();
      } catch (geminiErr) {
        console.log(`> [AI] 🔴 Gemini failed. Checking Ollama...`);
        try {
          const useOllama = await ollamaService.isOllamaRunning();
          if (useOllama) {
            console.log(`> [AI] 🟢 Falling back to Local Ollama`);
            text = await ollamaService.generateResponse(userPrompt, systemPrompt);
          } else {
            throw new Error("Ollama not running");
          }
        } catch (ollamaErr) {
          throw new Error("All AI engines failed or offline");
        }
      }
    }

    // Clean JSON (remove ```json wrappers if Gemini/Ollama adds them)
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      console.error("Invalid AI Output:", text);
      throw new Error("Invalid JSON extraction from AI");
    }

    const cleanJson = text.substring(firstBrace, lastBrace + 1);
    const structuredData = JSON.parse(cleanJson);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`> [DEBUG] Success! AI took ${duration}s`);

    return res.json(structuredData);

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`> [ERR] Failed after ${duration}s:`, error.message);

    return res.status(500).json({
      message: "AI Processing Failed",
      error: error.message
    });
  }
};

module.exports = { parseResume };