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
    responseMimeType: 'text/plain',
};

// Rate limiting configuration
const REQUEST_WINDOW = 60000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 10;
const requestTimestamps: number[] = [];

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Rate limiting function
function checkRateLimit(): boolean {
    const now = Date.now();
    // Remove timestamps older than the window
    while (
        requestTimestamps.length > 0 &&
        requestTimestamps[0] < now - REQUEST_WINDOW
    ) {
        requestTimestamps.shift();
    }

    if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }

    requestTimestamps.push(now);
    return true;
}

// Sleep function for delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = MAX_RETRIES,
    initialDelay: number = INITIAL_RETRY_DELAY
): Promise<T> {
    let retries = 0;

    while (true) {
        try {
            return await operation();
        } catch (error: any) {
            if (
                retries >= maxRetries ||
                (error?.status !== 503 && error?.status !== 429)
            ) {
                throw error;
            }

            retries++;
            const delay = initialDelay * Math.pow(2, retries - 1);
            console.log(`Retry attempt ${retries} after ${delay}ms delay`);
            await sleep(delay);
        }
    }
}

function stripMarkdown(text: string): string {
    return text
        .replace(/^```[\w]*\n|```$/gm, '')
        .trim()
        .replace(/\n+/g, '\n');
}

export async function POST(req: NextRequest) {
    try {
        // Check rate limit
        if (!checkRateLimit()) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const { inputValue } = await req.json();

        if (!inputValue) {
            return NextResponse.json(
                { error: 'No input value provided' },
                { status: 400 }
            );
        }

        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });

        // Use retry mechanism for the API call
        const result = await retryWithBackoff(async () => {
            return await chatSession.sendMessage(inputValue);
        });

        let textResponse = await result.response.text();
        console.log('Raw AI response:', textResponse);

        textResponse = stripMarkdown(textResponse);
        console.log('Cleaned response:', textResponse);

        try {
            if (!textResponse.startsWith('[') && !textResponse.startsWith('{')) {
                throw new Error('Response is not in JSON format');
            }

            const jsonData = JSON.parse(textResponse);
            return NextResponse.json({ message: jsonData });
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            return NextResponse.json(
                {
                    error: 'Invalid JSON response from AI',
                    rawResponse: textResponse,
                    parseError: parseError instanceof Error ? parseError.message : String(parseError)
                },
                { status: 422 }
            );
        }
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate response',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}