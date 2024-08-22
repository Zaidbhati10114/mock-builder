import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash', // Ensure this model is correctly defined in the library
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain', // Ensure this is correct
};

export async function POST(req: NextRequest) {
    try {
        const { inputValue } = await req.json();

        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });

        const result = await chatSession.sendMessage(inputValue);
        const textResponse = result.response; // Ensure this matches the API structure

        return NextResponse.json({ message: textResponse });
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }
}
