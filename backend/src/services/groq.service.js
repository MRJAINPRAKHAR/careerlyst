const axios = require('axios');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const generateResponse = async (prompt, systemPrompt = "") => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === 'your_groq_key_here') {
        throw new Error("GROQ_API_KEY missing or invalid");
    }

    try {
        const response = await axios.post(GROQ_URL, {
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 4096
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Groq Service Error:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    generateResponse
};
