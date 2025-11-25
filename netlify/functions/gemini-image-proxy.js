// netlify/functions/gemini-image-proxy.js
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

    const { prompt, mimeType, data } = JSON.parse(event.body);

    if (!prompt || !mimeType || !data) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing prompt, mimeType, or data in request body.' }) };
    }

    try {
        const ai = new GoogleGenerativeAI(apiKey);
        // Use a model capable of handling multimodal content
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

        const imagePart = {
            inlineData: {
                data: data,
                mimeType: mimeType
            }
        };

        const result = await model.generateContent({
            contents: [{ parts: [{ text: prompt }, imagePart] }]
        });

        const responseText = result.text;

        return {
            statusCode: 200,
            body: JSON.stringify({ text: responseText }),
        };
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'AI Analysis Error: Exceeded Quota or Internal Server Issue.' }),
        };
    }
};
