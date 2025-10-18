import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge'; // Use Edge Runtime
export const maxDuration = 60; // Pro plan only

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function generatePrompt(prompt: string, count: number): string {
    return `Generate exactly ${count} JSON objects for: ${prompt}

RULES:
- Each object needs: id (number), title (string), description (string)
- Start id from 1
- Keep descriptions under 100 chars
- Return ONLY JSON array, no markdown
Example: [{"id":1,"title":"Example","description":"Short text."}]`;
}

export async function POST(req: NextRequest) {
    try {
        const { prompt, objectsCount = 10 } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Limit for free tier
        if (objectsCount > 15) {
            return NextResponse.json(
                { error: "Max 15 items on free tier" },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: Math.min(2048, objectsCount * 150),
            }
        });

        const fullPrompt = generatePrompt(prompt, objectsCount);

        // Set aggressive timeout for free tier
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        try {
            const result = await model.generateContent(fullPrompt);
            clearTimeout(timeoutId);

            let responseText = result.response.text();

            // Clean response
            responseText = responseText.trim()
                .replace(/```(?:json)?\s*/g, "")
                .replace(/```\s*$/g, "")
                .replace(/^[^[]*/, "")
                .replace(/[^\]]*$/, "");

            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error("No valid JSON found");
            }

            const parsedData = JSON.parse(jsonMatch[0]);

            if (!Array.isArray(parsedData) || parsedData.length === 0) {
                throw new Error("Invalid data structure");
            }

            // Validate and fix items
            const validatedData = parsedData.map((item, index) => ({
                id: typeof item.id === 'number' ? item.id : index + 1,
                title: item.title?.toString() || `Item ${index + 1}`,
                description: item.description?.toString() || "No description",
                ...item
            }));

            return NextResponse.json({
                status: "success",
                data: validatedData,
                message: `Generated ${validatedData.length} items`
            });

        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                return NextResponse.json(
                    {
                        status: "error",
                        error: "Request timed out. Try fewer items or simpler prompt."
                    },
                    { status: 408 }
                );
            }
            throw error;
        }

    } catch (error: any) {
        console.error("Generation error:", error);

        return NextResponse.json(
            {
                status: "error",
                error: error.message || "Failed to generate data"
            },
            { status: 500 }
        );
    }
}