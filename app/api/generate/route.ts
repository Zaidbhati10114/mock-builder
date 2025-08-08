
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const initializeAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }
    return new GoogleGenerativeAI(apiKey);
};

const requestSchema = z.object({
    inputValue: z.string().min(1, "Input value is required"),
    model: z.enum(["genesis", "explorer"]).optional(),
    resources: z.string().min(1, "Resource type is required"),
    objectsCount: z.number().min(1).max(100),
});

export async function POST(request: Request) {
    try {
        const genAI = initializeAI();
        const body = await request.json();
        //console.log('Received request body:', body);

        const validatedData = requestSchema.parse(body);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Construct a more specific prompt that enforces JSON structure
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

        //console.log('Sending prompt:', structuredPrompt);

        const result = await model.generateContent(structuredPrompt);
        const response = await result.response;
        const text = await response.text();

        console.log('Raw AI response:', text);

        // Clean the response to ensure it's valid JSON
        const cleanedText = text
            .replace(/```json\n?|\n?```/g, '') // Remove code blocks
            .replace(/^\s*\n/gm, '') // Remove empty lines
            .trim();

        try {
            // Try to parse the cleaned response
            const parsedData = JSON.parse(cleanedText);

            // Validate that it's an array
            if (!Array.isArray(parsedData)) {
                throw new Error('Response is not an array');
            }

            // Validate array length
            if (parsedData.length !== validatedData.objectsCount) {
                // If count doesn't match, fix the array
                const adjustedData = adjustArraySize(parsedData, validatedData.objectsCount);
                return NextResponse.json({ message: adjustedData, status: 'success' });
            }

            return NextResponse.json({ message: parsedData, status: 'success' });

        } catch (parseError) {
            console.error('Parse error:', parseError);

            // Attempt to fix malformed JSON
            const fallbackData = generateFallbackData(validatedData.objectsCount);
            return NextResponse.json({
                message: fallbackData,
                status: 'success',
                warning: 'Used fallback data due to parsing error'
            });
        }

    } catch (error) {
        console.error('Generation error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Validation error',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal server error'
        }, { status: 500 });
    }
}

// Helper function to adjust array size if needed
function adjustArraySize(array: any[], targetSize: number): any[] {
    if (array.length === targetSize) return array;

    if (array.length < targetSize) {
        // Add more items
        const template = array[0] || {};
        while (array.length < targetSize) {
            const newItem = { ...template, id: array.length + 1 };
            array.push(newItem);
        }
    } else {
        // Remove extra items
        array = array.slice(0, targetSize);
    }

    return array;
}

// Helper function to generate fallback data
function generateFallbackData(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`
    }));
}
