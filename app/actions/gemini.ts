"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
    }
});

// Input validation schema
const requestSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    model: z.enum(["genesis", "explorer"]).optional(),
    objectsCount: z.number().min(1).max(100).default(10),
});

// Generate structured prompt for Gemini with dynamic count
function generateStructuredPrompt(prompt: string, count: number): string {
    return `
Generate exactly ${count} JSON objects based on the following requirements:
${prompt}

Requirements:
1. Each object MUST have a unique numeric 'id' field (starting from 1).
2. Include 'title' and 'description' fields.
3. Keep descriptions concise (1-2 sentences max).
4. Dates should be in ISO format if needed.
5. Numbers should be reasonable for their context.
6. Return ONLY the JSON array with no additional text, markdown, or explanations.

Response Format:
[
  {
    "id": 1,
    "title": "Example Title",
    "description": "Example description here."
  }
]
`;
}

// Timeout wrapper for promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
        ),
    ]);
}

// Simplified generation with timeout
async function generateWithTimeout(prompt: string) {
    try {
        const generatePromise = model.generateContent(prompt);
        // Set timeout to 8 seconds to stay under Vercel's 10-second limit
        const result = await withTimeout(generatePromise, 8000);
        return result.response.text();
    } catch (error: any) {
        console.error("Generation error:", error);
        if (error.message === 'Request timeout') {
            throw new Error("AI generation timed out. Please try with a smaller object count or simpler prompt.");
        }
        throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`);
    }
}

// Process and clean AI response
function processAIResponse(responseText: string) {
    try {
        // Clean the response text
        let cleanedText = responseText.trim();

        // Remove markdown code blocks if present
        cleanedText = cleanedText.replace(/```json\s*|\s*```/g, "");

        // Find JSON array in the response
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            cleanedText = jsonMatch[0];
        }

        const parsedData = JSON.parse(cleanedText);

        if (!Array.isArray(parsedData)) {
            throw new Error("Response is not an array");
        }

        // Validate each item has required fields
        parsedData.forEach((item, index) => {
            if (typeof item !== 'object' || item === null) {
                throw new Error(`Item at index ${index} is not an object`);
            }
            if (!item.hasOwnProperty('id') || !item.hasOwnProperty('title') || !item.hasOwnProperty('description')) {
                throw new Error(`Item at index ${index} is missing required fields (id, title, or description)`);
            }
            // Ensure id is a number
            if (typeof item.id !== 'number') {
                item.id = index + 1;
            }
        });

        return parsedData;
    } catch (error: any) {
        console.error("Processing error:", error);
        throw new Error(`Failed to process AI response: ${error.message}`);
    }
}

// Main server action with comprehensive error handling
export const generateStructuredData = async (input: unknown) => {
    try {
        console.log("Starting generation with input:", input);

        // Validate input
        const validatedData = requestSchema.parse(input);
        console.log("Validated data:", validatedData);

        // Generate prompt
        const prompt = generateStructuredPrompt(
            validatedData.prompt,
            validatedData.objectsCount
        );

        // Generate content with timeout
        const responseText = await generateWithTimeout(prompt);
        console.log("AI response received, length:", responseText.length);

        // Process the response
        const processedData = processAIResponse(responseText);
        console.log("Data processed successfully, items:", processedData.length);

        return {
            status: "success",
            data: processedData,
            message: `Generated ${processedData.length} items successfully`
        };

    } catch (error: any) {
        console.error("Generation error:", error);

        // Handle validation errors
        if (error instanceof z.ZodError) {
            return {
                status: "error",
                error: "Invalid input data",
                details: error.errors.map(e => e.message).join(", ")
            };
        }

        // Handle timeout errors
        if (error.message?.includes('timeout')) {
            return {
                status: "error",
                error: "Request timed out. Try reducing the number of objects or simplifying your prompt."
            };
        }

        // Handle API key errors
        if (error.message?.includes('API key')) {
            return {
                status: "error",
                error: "AI service configuration error. Please contact support."
            };
        }

        // Generic error handling
        return {
            status: "error",
            error: error.message || "Failed to generate data. Please try again."
        };
    }
};