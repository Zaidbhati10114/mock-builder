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
    model: 'gemini-1.5-flash',
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
};

function stripMarkdown(text: string): string {
    // Remove Markdown code block syntax
    return text.replace(/^```json\n|```$/g, '').trim();
}

export async function POST(req: NextRequest) {
    try {
        const { inputValue } = await req.json();

        if (!inputValue) {
            return NextResponse.json({ error: 'No input value provided' }, { status: 400 });
        }

        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });

        const result = await chatSession.sendMessage(inputValue);
        let textResponse = await result.response.text();

        console.log('Raw AI response:', textResponse);

        // Strip Markdown syntax
        textResponse = stripMarkdown(textResponse);

        try {
            const jsonData = JSON.parse(textResponse);
            return NextResponse.json({ message: jsonData });
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            return NextResponse.json({
                error: 'Invalid JSON response from AI',
                rawResponse: textResponse
            }, { status: 422 });
        }
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json({
            error: 'Failed to generate response',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}