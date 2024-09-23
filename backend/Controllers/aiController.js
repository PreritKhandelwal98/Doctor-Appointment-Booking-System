import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const aiPrompt = async (req, res) => {
    try {

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const { prompt } = req.body; // Extract the prompt from the request body
        const result = await model.generateContent(prompt);

        // Inspect the structure of the result object
        if (result && result.response && typeof result.response.text === 'function') {
            const text = result.response.text();
            res.status(200).json({ response: text });
        } else {
            console.error("Unexpected result structure:", result);
            res.status(500).json({ error: "Unexpected result structure" });
        }
    } catch (error) {
        console.error("Error generating AI response:", error);
        res.status(500).json({ error: "Failed to generate AI response" });
    }
};
