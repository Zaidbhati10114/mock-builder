import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Helper function to generate prompt
function generatePrompt(prompt: string, count: number): string {
    return `Generate exactly ${count} JSON objects for: ${prompt}

RULES:
- Each object needs: id (number), title (string), description (string)
- Start id from 1
- Keep descriptions under 100 chars
- Return ONLY JSON array, no markdown
Example: [{"id":1,"title":"Example","description":"Short text."}]`;
}

// Main action to generate JSON data
export const generateJsonData = action({
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

            // Get API key from environment
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("GEMINI_API_KEY not configured");
            }

            // Call Gemini API
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
                                text: generatePrompt(args.prompt, args.objectsCount)
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: Math.min(2048, args.objectsCount * 150),
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

            // Clean and parse JSON
            responseText = responseText.trim()
                .replace(/```(?:json)?\s*/g, "")
                .replace(/```\s*$/g, "")
                .replace(/^[^[]*/, "")
                .replace(/[^\]]*$/, "");

            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error("No valid JSON array found in response");
            }

            const parsedData = JSON.parse(jsonMatch[0]);

            if (!Array.isArray(parsedData) || parsedData.length === 0) {
                throw new Error("Invalid data structure - expected non-empty array");
            }

            // Validate and fix items
            const validatedData = parsedData.map((item, index) => ({
                id: typeof item.id === 'number' ? item.id : index + 1,
                title: item.title?.toString() || `Item ${index + 1}`,
                description: item.description?.toString() || "No description",
                ...item
            }));

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
                clerkId: "", // Not needed in the mutation, it uses auth
            });

            return {
                success: true,
                itemCount: validatedData.length,
                processingTime,
            };

        } catch (error: any) {
            const processingTime = Date.now() - startTime;

            console.error("JSON generation error:", error);

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

// Optional: Retry a failed job
export const retryFailedJob = action({
    args: {
        jobId: v.id("jsonJobs"),
    },
    handler: async (ctx, args) => {
        // Get job details
        const job = await ctx.runQuery(api.jsonJobs.getJob, {
            jobId: args.jobId,
        });

        if (!job) {
            throw new Error("Job not found");
        }

        if (job.status !== "failed") {
            throw new Error("Can only retry failed jobs");
        }

        // Trigger generation again
        await generateJsonData(ctx, {
            jobId: args.jobId,
            prompt: job.prompt,
            objectsCount: job.objectsCount,
            userId: job.userId,
        });
    },
});