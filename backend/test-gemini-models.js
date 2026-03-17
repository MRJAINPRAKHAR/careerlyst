const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels(apiKey) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name));
  } catch (error) {
    console.error(error);
  }
}

listModels('AIzaSyA-rMzXXi8zqTN8Wn52Ob9EcTQ1thUEsT8');
