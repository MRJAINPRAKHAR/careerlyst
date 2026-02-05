const axios = require('axios');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const EMBED_URL = 'http://localhost:11434/api/embeddings';
const MODEL = 'llama3.1';

const isOllamaRunning = async () => {
    try {
        await axios.get('http://localhost:11434');
        return true;
    } catch (error) {
        return false;
    }
};

const generateResponse = async (prompt, systemPrompt = "") => {
    try {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt;

        const response = await axios.post(OLLAMA_URL, {
            model: "llama3.1",
            prompt: fullPrompt,
            stream: false,
            options: {
                num_ctx: 4096,
                temperature: 0.2,
                top_k: 20
            }
        });

        return response.data.response;
    } catch (error) {
        console.error("Ollama Gen Error:", error.message);
        throw error;
    }
};

const generateEmbedding = async (text) => {
    try {
        const response = await axios.post(EMBED_URL, {
            model: MODEL,
            prompt: text
        });
        return response.data.embedding;
    } catch (error) {
        console.error("Ollama Embed Error:", error.message);
        throw error;
    }
};

module.exports = {
    isOllamaRunning,
    generateResponse,
    generateEmbedding
};
