// --- 1. IMPORT FILE SYSTEM & DB
const pdf = require('pdf-parse'); // RESTORED
const fs = require('fs');
const pool = require("../config/db"); // Import DB connection
const { GoogleGenerativeAI } = require("@google/generative-ai");
const groqService = require("../services/groq.service");
const ollamaService = require("../services/ollama.service");

// Use a stable model version
// Use a stable model version
const MODEL_NAME = "gemini-1.5-flash";

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
    console.log("> [DEBUG] req.file content:", JSON.stringify(req.file, null, 2));

    const resumeUrl = req.file.path; // Cloudinary URL
    if (!resumeUrl) throw new Error("Cloudinary did not return a URL");

    // Update the user's profile with the resume URL immediately
    await pool.query("UPDATE users SET resume_url = ? WHERE id = ?", [resumeUrl, userId]);
    console.log(`> [DB] Resume URL saved for User ID: ${userId}`);

    const axios = require('axios');
    let dataBuffer = null;

    if (req.file.path && req.file.path.startsWith('http')) {
      console.log("> [DEBUG] Downloading from Cloudinary:", req.file.path);
      const response = await axios.get(req.file.path, { responseType: 'arraybuffer' });
      dataBuffer = Buffer.from(response.data);
    } else if (req.file.path) {
      dataBuffer = fs.readFileSync(req.file.path);
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
    let errorsCollected = [];
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
      const gErr = groqErr.response?.data?.error?.message || groqErr.message;
      errorsCollected.push(`Groq: ${gErr}`);
      console.log(`> [AI] 🟡 Groq failed (${gErr}). Trying Gemini (${MODEL_NAME})...`);
      
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "missing");
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(systemPrompt + "\n" + userPrompt);
        const response = await result.response;
        text = response.text();
      } catch (geminiErr) {
        let gemErr = geminiErr.message;
        if (gemErr.includes("401") || gemErr.includes("API key not valid")) {
           gemErr = "Invalid or Missing API Key";
        } else if (gemErr.includes("403") || gemErr.includes("Quota")) {
           gemErr = "Quota Exceeded / Permission Denied";
        }
        
        errorsCollected.push(`Gemini: ${gemErr}`);
        console.log(`> [AI] 🔴 Gemini failed (${gemErr}). Checking Ollama...`);
        
        try {
          const useOllama = await ollamaService.isOllamaRunning();
          if (useOllama) {
            console.log(`> [AI] 🟢 Falling back to Local Ollama`);
            text = await ollamaService.generateResponse(userPrompt, systemPrompt);
          } else {
            errorsCollected.push(`Ollama: Not Running`);
            throw new Error(`AI Chain Failed: ${errorsCollected.join(" | ")}`);
          }
        } catch (ollamaErr) {
          if (!errorsCollected.find(e => e.includes("Ollama"))) {
            errorsCollected.push(`Ollama: ${ollamaErr.message}`);
          }
          throw new Error(`AI Chain Failed: ${errorsCollected.join(" | ")}`);
        }
      }
    }

    // Clean JSON (remove ```json wrappers if Gemini/Ollama adds them)
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      console.error("Invalid AI Output:", text);
      throw new Error(`Invalid JSON extraction from AI | Last Provider Output: ${text.substring(0,100)}...`);
    }

    const cleanJson = text.substring(firstBrace, lastBrace + 1);
    const structuredData = JSON.parse(cleanJson);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`> [DEBUG] Success! AI took ${duration}s`);

    return res.json(structuredData);

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`> [ERR] Failed after ${duration}s:`, error.message);

    return res.status(502).json({
      message: "AI Processing Failed",
      error: error.message
    });
  }
};

module.exports = { parseResume };