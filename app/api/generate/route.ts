import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY!;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
};

export async function POST(req: NextRequest) {
    try {
        //console.log('Received request');
        const { inputValue } = await req.json();
        console.log('Input Value:', inputValue);

        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });

        //console.log('Sending message to Generative AI');
        const result = await chatSession.sendMessage(inputValue);
        //console.log('Received response from Generative AI');

        const textResponse = await result.response.text();
        console.log('Text Response:', textResponse);

        return NextResponse.json({ message: textResponse });
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }
}
