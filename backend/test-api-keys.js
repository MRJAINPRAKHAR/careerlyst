const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGroq(apiKey) {
  console.log('Testing Groq API Key...');
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Groq API Key is VALID.');
  } catch (error) {
    console.error(
      '❌ Groq API Key Failed:',
      error.response?.data?.error?.message || error.message
    );
  }
}

async function testGemini(apiKey) {
  console.log('\nTesting Gemini API Key...');
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello');
    console.log('✅ Gemini API Key is VALID.');
  } catch (error) {
    console.error('❌ Gemini API Key Failed:', error.message);
  }
}

async function runTests() {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!groqKey) {
    console.log('⚠️ No GROQ_API_KEY found in environment.');
  } else {
    await testGroq(groqKey);
  }

  if (!geminiKey) {
    console.log('⚠️ No GEMINI_API_KEY found in environment.');
  } else {
    await testGemini(geminiKey);
  }
}

runTests();
