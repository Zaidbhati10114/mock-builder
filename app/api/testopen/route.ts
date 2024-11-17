import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
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
    inputValue: z.string().min(1, "Prompt is required"),
    model: z.enum(["genesis", "explorer"]).optional(),
    resources: z.string().min(1, "Resource type is required"),
    objectsCount: z.number().min(1).max(100),
});

// Type definitions
type GenerationRequest = z.infer<typeof requestSchema>;
type FieldDefinition = {
    label: string;
    type: string;
    required?: boolean;
};

// Response validation schema builder
const createResponseSchema = (fields: FieldDefinition[]) => {
    const schemaFields: Record<string, z.ZodType<any>> = {
        id: z.number(),
    };

    fields.forEach(field => {
        const fieldSchema = (() => {
            switch (field.type.toLowerCase()) {
                case 'string':
                    return z.string();
                case 'number':
                    return z.number();
                case 'boolean':
                    return z.boolean();
                case 'date':
                    return z.string().datetime();
                case 'email':
                    return z.string().email();
                case 'url':
                    return z.string().url();
                default:
                    return z.string();
            }
        })();

        schemaFields[field.label] = field.required ? fieldSchema : fieldSchema.optional();
    });

    return z.array(z.object(schemaFields));
};

export async function POST(request: Request) {
    try {
        // Initialize AI service
        const genAI = initializeAI();

        // Parse and validate request body
        const body = await request.json();
        const validatedData = requestSchema.parse(body);

        // Select appropriate model
        const modelName = validatedData.model === 'genesis' ? 'gemini-pro' : 'gemini-pro';
        const model = genAI.getGenerativeModel({ model: modelName });

        // Generate prompt with specific constraints
        const prompt = generateStructuredPrompt(validatedData);

        // Generate content with retry mechanism
        const response = await generateWithRetry(model, prompt);

        // Process and validate the response
        const processedData = await processAIResponse(response, validatedData);

        return NextResponse.json({
            message: processedData,
            status: 'success'
        });

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

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }

    throw lastError || new Error('Failed to generate content after multiple attempts');
}

function generateStructuredPrompt({ inputValue, objectsCount, resources }: GenerationRequest): string {
    return `
Generate exactly ${objectsCount} JSON objects based on the following requirements:
${inputValue}

Requirements:
1. Each object MUST have a unique numeric 'id' field
2. All values must be realistic and contextually appropriate
3. Dates should be in ISO format
4. Numbers should be reasonable for their context
5. Return ONLY the JSON array with no additional text or formatting

Response Format:
[
  {
    "id": number,
    ... (other fields based on requirements)
  }
]
`;
}

async function processAIResponse(response: any, requestData: GenerationRequest) {
    const text = await response.text();

    // Clean the response text
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

        // Validate each object has required fields
        parsedData.forEach((item, index) => {
            if (typeof item !== 'object' || item === null) {
                throw new Error(`Item at index ${index} is not an object`);
            }
            if (!('id' in item)) {
                throw new Error(`Item at index ${index} is missing required 'id' field`);
            }
        });

        // Ensure exact count of objects
        if (parsedData.length !== requestData.objectsCount) {
            throw new Error(`Expected ${requestData.objectsCount} objects, got ${parsedData.length}`);
        }

        return parsedData;

    } catch (error) {
        throw new Error(`Failed to process AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}