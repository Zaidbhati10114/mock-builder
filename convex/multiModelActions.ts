import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Helper to generate prompt
function generatePrompt(inputValue: string, objectsCount: number): string {
    return `${inputValue}

CRITICAL RULES:
1. Generate EXACTLY ${objectsCount} objects
2. Each object MUST have a unique numeric 'id' field starting from 1
3. Follow the field specifications exactly as described
4. Keep descriptions concise and realistic
5. Return ONLY a valid JSON array with no markdown, no explanations
6. Format: [{"id":1,...},{"id":2,...}]

Generate the ${objectsCount} objects now:`;
}

// Process AI response
function processAIResponse(responseText: string, expectedCount: number) {
    try {
        let cleanedText = responseText.trim()
            .replace(/```(?:json)?\s*/g, "")
            .replace(/```\s*$/g, "")
            .replace(/^[^[]*/, "")
            .replace(/[^\]]*$/, "");

        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error("No valid JSON array found");
        }

        const parsedData = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(parsedData) || parsedData.length === 0) {
            throw new Error("Invalid or empty array");
        }

        // Validate and fix items
        const validatedData = parsedData.map((item, index) => {
            if (typeof item !== 'object' || item === null) {
                throw new Error(`Item at index ${index} is not an object`);
            }
            if (!item.id || typeof item.id !== 'number') {
                item.id = index + 1;
            }
            return item;
        });

        return validatedData;
    } catch (error: any) {
        throw new Error(`Failed to process response: ${error.message}`);
    }
}

// Try Gemini 2.0 Flash Exp (fastest, but has rate limits)
async function tryGemini2Flash(prompt: string, objectsCount: number) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    console.log("Trying Gemini 2.0 Flash Exp...");

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: Math.min(4096, objectsCount * 200),
                    topP: 0.8,
                    topK: 40,
                }
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);

        // Check if it's a rate limit error
        if (response.status === 429 || errorData.error?.code === 429) {
            throw new Error("RATE_LIMIT");
        }
        throw new Error(`Gemini 2.0 error: ${response.status}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Try Gemini 1.5 Flash (more stable, higher quota)
async function tryGemini15Flash(prompt: string, objectsCount: number) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    console.log("Trying Gemini 1.5 Flash (fallback)...");

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: Math.min(8192, objectsCount * 250),
                }
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini 1.5 error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Try Gemini 1.5 Pro (highest quality, use as last resort)
async function tryGemini15Pro(prompt: string, objectsCount: number) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    console.log("Trying Gemini 1.5 Pro (final fallback)...");

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: Math.min(8192, objectsCount * 250),
                }
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini 1.5 Pro error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Smart generation with automatic fallback
async function generateWithSmartFallback(prompt: string, objectsCount: number) {
    const models = [
        { name: "Gemini 2.0 Flash Exp", fn: tryGemini2Flash },
        { name: "Gemini 1.5 Flash", fn: tryGemini15Flash },
        { name: "Gemini 1.5 Pro", fn: tryGemini15Pro },
    ];

    let lastError: Error | null = null;

    for (const model of models) {
        try {
            console.log(`Attempting generation with ${model.name}...`);
            const responseText = await model.fn(prompt, objectsCount);

            if (!responseText) {
                throw new Error("Empty response");
            }

            console.log(`✓ Success with ${model.name}`);
            return { responseText, modelUsed: model.name };
        } catch (error: any) {
            console.warn(`✗ ${model.name} failed:`, error.message);
            lastError = error;

            // If it's a rate limit, try next model immediately
            if (error.message === "RATE_LIMIT") {
                console.log("Rate limit detected, trying next model...");
                continue;
            }

            // For other errors, still try next model
            continue;
        }
    }

    // If all models failed, throw the last error
    throw new Error(
        `All models failed. Last error: ${lastError?.message || "Unknown error"}`
    );
}

// Main action with smart model fallback
export const generateWithAutoFallback = action({
    args: {
        jobId: v.id("jsonJobs"),
        prompt: v.string(),
        objectsCount: v.number(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const startTime = Date.now();

        try {
            // Update status to processing
            await ctx.runMutation(api.jsonJobs.updateJobStatus, {
                jobId: args.jobId,
                status: "processing",
            });

            // Generate full prompt
            const fullPrompt = generatePrompt(args.prompt, args.objectsCount);

            // Try models with smart fallback
            const { responseText, modelUsed } = await generateWithSmartFallback(
                fullPrompt,
                args.objectsCount
            );

            // Process and validate
            const validatedData = processAIResponse(responseText, args.objectsCount);

            const processingTime = Date.now() - startTime;

            // Update job with results
            await ctx.runMutation(api.jsonJobs.updateJobStatus, {
                jobId: args.jobId,
                status: "completed",
                result: validatedData,
                processingTime,
            });

            // Reduce user's credits
            await ctx.runMutation(api.resources.reduceJsonGenerationCount, {
                clerkId: "",
            });

            console.log(
                `✓ Job ${args.jobId} completed with ${modelUsed} in ${processingTime}ms`
            );

            return {
                success: true,
                itemCount: validatedData.length,
                processingTime,
                modelUsed,
            };

        } catch (error: any) {
            const processingTime = Date.now() - startTime;

            console.error("Generation error:", error);

            // Update job with error
            await ctx.runMutation(api.jsonJobs.updateJobStatus, {
                jobId: args.jobId,
                status: "failed",
                error: error.message || "All models exhausted. Please try again later.",
                processingTime,
            });

            return {
                success: false,
                error: error.message,
                processingTime,
            };
        }
    },
});

// Export for both simple and advanced generators
export const generateJsonWithFallback = generateWithAutoFallback;
export const generateAdvancedJsonWithFallback = generateWithAutoFallback;