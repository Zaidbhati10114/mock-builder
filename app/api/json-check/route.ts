import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { ZodTypeAny, z } from 'zod';

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

const determineSchemaType = (schema: any): string => {
    if (!schema.hasOwnProperty('type')) {
        if (Array.isArray(schema)) {
            return 'array';
        } else {
            return typeof schema;
        }
    }
    return schema.type;
};

const jsonSchemaToZod = (schema: any): ZodTypeAny => {
    const type = determineSchemaType(schema);
    switch (type) {
        case 'string':
            return z.string().nullable();
        case 'number':
            return z.number().nullable();
        case 'boolean':
            return z.boolean().nullable();
        case 'array':
            return z.array(jsonSchemaToZod(schema.items)).nullable();
        case 'object':
            const shape: Record<string, ZodTypeAny> = {};
            for (const key in schema) {
                if (key !== 'type') {
                    shape[key] = jsonSchemaToZod(schema[key]);
                }
            }
            return z.object(shape);
        default:
            throw new Error(`Unsupported schema type: ${type}`);
    }
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const genericSchema = z.object({
            data: z.string(),
            format: z.object({}).passthrough(),
        });
        const parsedBody = genericSchema.parse(body);

        const dynamicSchema = jsonSchemaToZod(parsedBody.format);

        // Modified content string
        const content = `DATA: \n"${parsedBody.data}"\n\n-----------\nExpected JSON format: ${JSON.stringify(
            parsedBody.format,
            null,
            2
        )}\n\n-----------\nPlease generate a single JSON object with random but realistic data that matches the given format. Do not return the schema definition.\n\nFor example, if the format is {"batteryLifeHrs": {"type": "number"}}, a valid response would be:\n{"batteryLifeHrs": 10}\n\nYour generated JSON:`;

        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });

        const result = await chatSession.sendMessage(content);
        const textResponse = await result.response.text();

        console.log('Raw text response:', textResponse);

        const cleanedResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        console.log('Cleaned response:', cleanedResponse);

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanedResponse);
        } catch (error) {
            console.error('Error parsing response:', error);
            return NextResponse.json({ error: 'Failed to parse response from the model' }, { status: 500 });
        }

        // Validate the parsed response against the dynamic schema
        try {
            const validationResult = dynamicSchema.parse(parsedResponse);
            return NextResponse.json({ message: validationResult });
        } catch (error) {
            console.error('Validation error:', error);
            return NextResponse.json({
                error: 'Generated data does not match the expected format',
                details: (error as Error).message
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }
}
