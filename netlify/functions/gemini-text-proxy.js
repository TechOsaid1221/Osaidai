// netlify/functions/gemini-text-proxy.js
const { GoogleGenerativeAI } = require('@google/genai');

exports.handler = async (event) => {
    // 1. Get the securely stored API Key from Netlify Environment Variables
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Serverless Function Error: API key not configured on Netlify.' })
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing prompt in request body.' }) };
    }

    try {
        const ai = new GoogleGenerativeAI(apiKey);
        // Use a stable, high-performance model for text
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const responseText = result.text;

        // Return the AI response to your website
        return {
            statusCode: 200,
            body: JSON.stringify({ text: responseText }),
        };
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        // Return a generic error to the client without exposing internal details
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'AI Analysis Error: Exceeded Quota or Internal Server Issue.' }),
        };
    }
};
