import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';
export const maxDuration = 60; // Pro plan only

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Generate prompt based on input
function generatePrompt(inputValue: string, objectsCount: number): string {
    return `${inputValue}

CRITICAL RULES:
1. Generate EXACTLY ${objectsCount} objects
2. Each object MUST have a unique numeric 'id' field starting from 1
3. Follow the field specifications exactly as described
4. Keep descriptions concise and realistic
5. Return ONLY a valid JSON array with no markdown, no explanations, no additional text
6. Format: [{"id":1,...},{"id":2,...}]

Generate the ${objectsCount} objects now:`;
}

// Process and validate response
function processAIResponse(responseText: string, expectedCount: number) {
    try {
        // Clean the response
        let cleanedText = responseText.trim();

        // Remove markdown code blocks
        cleanedText = cleanedText
            .replace(/```(?:json)?\s*/g, "")
            .replace(/```\s*$/g, "");

        // Remove text before array
        cleanedText = cleanedText.replace(/^[^[]*/, "");
        cleanedText = cleanedText.replace(/[^\]]*$/, "");

        // Extract JSON array
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error("No valid JSON array found in response");
        }

        const parsedData = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(parsedData)) {
            throw new Error("Response is not an array");
        }

        if (parsedData.length === 0) {
            throw new Error("Generated array is empty");
        }

        // Validate and fix each item
        const validatedData = parsedData.map((item, index) => {
            if (typeof item !== 'object' || item === null) {
                throw new Error(`Item at index ${index} is not an object`);
            }

            // Ensure id exists and is a number
            if (!item.id || typeof item.id !== 'number') {
                item.id = index + 1;
            }

            return item;
        });

        console.log(`Validated ${validatedData.length} items (expected ${expectedCount})`);
        return validatedData;
    } catch (error: any) {
        console.error("Processing error:", error);
        throw new Error(`Failed to process AI response: ${error.message}`);
    }
}

// Generate with Gemini
async function generateWithGemini(prompt: string, objectsCount: number) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: Math.min(4096, objectsCount * 200),
            topP: 0.8,
            topK: 40,
        }
    });

    // Dynamic timeout based on object count
    const baseTimeout = 6000;
    const timeoutPerObject = 200;
    const timeout = Math.min(baseTimeout + (objectsCount * timeoutPerObject), 9000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        console.log(`Generating with Gemini 2.0 Flash, timeout: ${timeout}ms`);
        const result = await model.generateContent(prompt);
        clearTimeout(timeoutId);
        return result.response.text();
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error("Request timed out. Try fewer items or simpler prompt.");
        }
        throw error;
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { inputValue, model, resources, objectsCount = 10 } = body;

        // Validate input
        if (!inputValue) {
            return NextResponse.json(
                { error: "Input value is required" },
                { status: 400 }
            );
        }

        // Limit for Vercel free tier
        if (objectsCount > 15) {
            return NextResponse.json(
                {
                    error: "Please generate 15 or fewer items at a time to avoid timeouts on Vercel free tier."
                },
                { status: 400 }
            );
        }

        if (objectsCount < 1) {
            return NextResponse.json(
                { error: "Objects count must be at least 1" },
                { status: 400 }
            );
        }

        console.log(`Starting generation: model=${model}, resources=${resources}, count=${objectsCount}`);

        // Generate the prompt
        const fullPrompt = generatePrompt(inputValue, objectsCount);

        let responseText: string;

        // Generate using Gemini
        try {
            responseText = await generateWithGemini(fullPrompt, objectsCount);
            console.log(`Gemini response received, length: ${responseText.length}`);

            // Process and validate the response
            const validatedData = processAIResponse(responseText, objectsCount);

            console.log(`Successfully generated ${validatedData.length} items`);

            return NextResponse.json({
                success: true,
                message: validatedData,
                model: "gemini-2.0-flash-exp",
                resources: resources,
                count: validatedData.length
            });

        } catch (aiError: any) {
            console.error("Gemini generation error:", aiError);

            // Handle specific errors
            if (aiError.message?.includes('timeout') || aiError.message?.includes('timed out')) {
                return NextResponse.json(
                    {
                        error: aiError.message || "Generation timed out. Try fewer items or simpler prompt."
                    },
                    { status: 408 }
                );
            }

            if (aiError.message?.includes('quota') || aiError.message?.includes('rate limit')) {
                return NextResponse.json(
                    {
                        error: "API rate limit reached. Please wait and try again."
                    },
                    { status: 429 }
                );
            }

            if (aiError.message?.includes('API key')) {
                return NextResponse.json(
                    { error: "Gemini API key configuration error. Please contact support." },
                    { status: 500 }
                );
            }

            throw aiError;
        }

    } catch (error: any) {
        console.error("Request processing error:", error);

        return NextResponse.json(
            {
                error: error.message || "Failed to generate data. Please try again.",
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

// Optional: Add a GET method for health check
export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "JSON Generator API is running",
        model: "gemini-2.0-flash-exp",
        maxObjects: 15
    });
}