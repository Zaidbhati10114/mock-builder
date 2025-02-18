"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Input validation schema
const requestSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    model: z.enum(["genesis", "explorer"]).optional(),
    objectsCount: z.number().min(1).max(100).default(10),
});

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
async function generateWithRetry(prompt: string, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            lastError = error;
            if (attempt === maxRetries) break;
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }

    throw lastError || new Error("Failed to generate content after multiple attempts");
}

// Process and clean AI response
function processAIResponse(responseText: string) {
    const cleanedText = responseText
        .replace(/```json|```/g, "")
        .trim()
        .replace(/^(?!\[).*?\[/, "[")
        .replace(/\].*$/, "]");

    try {
        const parsedData = JSON.parse(cleanedText);
        if (!Array.isArray(parsedData)) {
            throw new Error("Response is not an array");
        }
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

// Next.js server action for AI generation
export const generateStructuredData = async (input: unknown) => {
    try {
        const validatedData = requestSchema.parse(input);
        const prompt = generateStructuredPrompt(validatedData.prompt);
        const responseText = await generateWithRetry(prompt);
        const processedData = processAIResponse(responseText);

        return { status: "success", data: processedData };
    } catch (error) {
        console.error("Generation error:", error);
        if (error instanceof z.ZodError) {
            return { status: "error", error: "Validation error", details: error.errors };
        }
        return { status: "error", error: "Internal server error" };
    }
};
