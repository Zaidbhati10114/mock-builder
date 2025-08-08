'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const initializeAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }
    return new GoogleGenerativeAI(apiKey);
};

const requestSchema = z.object({
    inputValue: z.string().min(1, 'Input value is required'),
    model: z.enum(['genesis', 'explorer']).optional(),
    resources: z.string().min(1, 'Resource type is required'),
    objectsCount: z.number().min(1).max(100),
});

export async function generateJSONActionWithData(request: unknown) {
    try {
        const genAI = initializeAI();
        const validatedData = requestSchema.parse(request);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const structuredPrompt = `
Generate a JSON array containing exactly ${validatedData.objectsCount} items based on this request: ${validatedData.inputValue}

Important requirements:
- Response must be ONLY a valid JSON array
- Each object must have an 'id' field
- No markdown, no explanations, just the JSON array
- Must be properly formatted JSON

Example format:
[
  {
    "id": 1,
    "name": "Example Name",
    "email": "example@email.com"
  }
]

Return ONLY the JSON array, no other text.`;

        const result = await model.generateContent(structuredPrompt);
        const response = await result.response;
        const text = await response.text();

        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

        try {
            const parsedData = JSON.parse(cleanedText);
            if (!Array.isArray(parsedData)) throw new Error('Response is not an array');
            if (parsedData.length !== validatedData.objectsCount) {
                return adjustArraySize(parsedData, validatedData.objectsCount);
            }
            return parsedData;
        } catch {
            return generateFallbackData(validatedData.objectsCount);
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: 'Validation error', details: error.errors };
        }
        return { error: error instanceof Error ? error.message : 'Internal server error' };
    } finally {
        revalidatePath('/');
    }
}

function adjustArraySize(array: any[], targetSize: number): any[] {
    if (array.length === targetSize) return array;
    if (array.length < targetSize) {
        const template = array[0] || {};
        while (array.length < targetSize) {
            array.push({ ...template, id: array.length + 1 });
        }
    } else {
        array = array.slice(0, targetSize);
    }
    return array;
}

function generateFallbackData(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
    }));
}
