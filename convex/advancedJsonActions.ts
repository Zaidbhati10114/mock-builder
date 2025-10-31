import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Helper function to generate advanced prompt
function generateAdvancedPrompt(
    inputValue: string,
    objectsCount: number
): string {
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
        let cleanedText = responseText.trim();

        // Remove markdown code blocks
        cleanedText = cleanedText
            .replace(/```(?:json)?\s*/g, "")
            .replace(/```\s*$/g, "");

        // Remove text before/after array
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

        return validatedData;
    } catch (error: any) {
        throw new Error(`Failed to process AI response: ${error.message}`);
    }
}

// Main action to generate advanced JSON data
export const generateAdvancedJsonData = action({
    args: {
        jobId: v.id("jsonJobs"),
        prompt: v.string(),
        objectsCount: v.number(),
        model: v.string(),
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

            // Get API key
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("GEMINI_API_KEY not configured");
            }

            // Generate full prompt
            const fullPrompt = generateAdvancedPrompt(args.prompt, args.objectsCount);

            // Call Gemini API (using 2.0-flash-exp as in your original)
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: fullPrompt
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: Math.min(4096, args.objectsCount * 200),
                            topP: 0.8,
                            topK: 40,
                        }
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            // Extract text from Gemini response
            let responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (!responseText) {
                throw new Error("Empty response from Gemini API");
            }

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

            // Reduce user's JSON generation count
            await ctx.runMutation(api.resources.reduceJsonGenerationCount, {
                clerkId: "", // Not needed, uses auth identity
            });

            return {
                success: true,
                itemCount: validatedData.length,
                processingTime,
                model: args.model,
            };

        } catch (error: any) {
            const processingTime = Date.now() - startTime;

            console.error("Advanced JSON generation error:", error);

            // Update job with error
            await ctx.runMutation(api.jsonJobs.updateJobStatus, {
                jobId: args.jobId,
                status: "failed",
                error: error.message || "Unknown error occurred",
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

// Optional: Retry failed job
export const retryAdvancedJob = action({
    args: {
        jobId: v.id("jsonJobs"),
    },
    handler: async (ctx, args) => {
        const job = await ctx.runQuery(api.advancedJsonJobs.getAdvancedJob, {
            jobId: args.jobId,
        });

        if (!job) {
            throw new Error("Job not found");
        }

        if (job.status !== "failed") {
            throw new Error("Can only retry failed jobs");
        }

        // Trigger generation again
        await generateAdvancedJsonData(ctx, {
            jobId: args.jobId,
            prompt: job.prompt,
            objectsCount: job.objectsCount,
            model: job.model || "gemini",
            userId: job.userId,
        });
    },
});