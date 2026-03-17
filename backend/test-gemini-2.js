const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini(apiKey) {
  console.log('\nTesting Gemini API Key...');
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say hello');
    console.log('✅ Gemini API Key is VALID.');
    console.log('Response:', result.response.text());
  } catch (error) {
    console.error('❌ Gemini API Key Failed:', error.message);
  }
}

testGemini('AIzaSyA-rMzXXi8zqTN8Wn52Ob9EcTQ1thUEsT8');
