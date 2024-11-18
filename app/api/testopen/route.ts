import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Initialize Google AI with error handling
const initializeAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }
    return new GoogleGenerativeAI(apiKey);
};

// Input validation schema
const requestSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    model: z.enum(['genesis', 'explorer']).optional(),
    objectsCount: z.number().min(1).max(100).default(10),
});

type GenerationRequest = z.infer<typeof requestSchema>;

// Generate structured prompt for Gemini
function generateStructuredPrompt(prompt: string): string {
    return `
Generate exactly 10 JSON objects based on the following requirements:
${prompt}

Requirements:
1. Each object MUST have a unique numeric 'id' field.
2. Include 'title' and 'description' fields.
3. Dates should be in ISO format.
4. Numbers should be reasonable for their context.
5. Return ONLY the JSON array with no additional text.

Response Format:
[
  {
    "id": number,
    "title": string,
    "description": string
  }
]
`;
}

// Retry mechanism for generating content
async function generateWithRetry(model: any, prompt: string, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response;
        } catch (error) {
            lastError = error;
            if (attempt === maxRetries) break;
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }

    throw lastError || new Error('Failed to generate content after multiple attempts');
}

// Process and clean AI response
async function processAIResponse(response: any) {
    const text = await response.text();
    const cleanedText = text
        .replace(/```json|```/g, '')
        .trim()
        .replace(/(\r\n|\n|\r)/gm, '')
        .replace(/^(?!\[).*?\[/, '[')
        .replace(/\].*$/, ']');

    try {
        const parsedData = JSON.parse(cleanedText);

        if (!Array.isArray(parsedData)) {
            throw new Error('Response is not an array');
        }

        // Validate structure
        parsedData.forEach((item, index) => {
            if (!item.id || !item.title || !item.description) {
                throw new Error(`Item at index ${index} is missing required fields`);
            }
        });

        return parsedData;
    } catch (error) {
        throw new Error(`Failed to process AI response: ${error}`);
    }
}

// Main handler for API requests
export async function POST(request: Request) {
    try {
        const genAI = initializeAI();

        const body = await request.json();
        const validatedData = requestSchema.parse(body);

        const modelName = validatedData.model === 'genesis' ? 'gemini-pro' : 'gemini-pro';
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = generateStructuredPrompt(validatedData.prompt);
        const response = await generateWithRetry(model, prompt);
        const processedData = await processAIResponse(response);

        return NextResponse.json({ data: processedData, status: 'success' });
    } catch (error) {
        console.error('Generation error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
