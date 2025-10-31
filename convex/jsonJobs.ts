import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";


// Create a new job
export const createJob = mutation({
    args: {
        projectId: v.string(),
        prompt: v.string(),
        objectsCount: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("User not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("email"), identity.email))
            .first();

        if (!user) {
            throw new ConvexError("User not found");
        }

        // Check if user has enough credits
        const currentCount = user.jsonGenerationCount || 0;
        if (currentCount < 10 && !user.isPro) {
            throw new ConvexError("Insufficient JSON generation credits");
        }

        // Create job record
        const jobId = await ctx.db.insert("jsonJobs", {
            userId: user._id,
            projectId: args.projectId,
            prompt: args.prompt,
            objectsCount: args.objectsCount,
            status: "queued",
            createdAt: Date.now(),
        });

        return jobId;
    },
});

// Get a specific job by ID
export const getJob = query({
    args: {
        jobId: v.id("jsonJobs"),
    },
    handler: async (ctx, args) => {
        const job = await ctx.db.get(args.jobId);
        return job;
    },
});

// Get the latest job for a project
export const getLatestJobForProject = query({
    args: {
        projectId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("email"), identity.email))
            .first();

        if (!user) {
            return null;
        }

        const job = await ctx.db
            .query("jsonJobs")
            .withIndex("by_user_and_status")
            .filter(q =>
                q.and(
                    q.eq(q.field("userId"), user._id),
                    q.eq(q.field("projectId"), args.projectId)
                )
            )
            .order("desc")
            .first();

        return job;
    },
});

// Update job status
export const updateJobStatus = mutation({
    args: {
        jobId: v.id("jsonJobs"),
        status: v.union(
            v.literal("queued"),
            v.literal("processing"),
            v.literal("completed"),
            v.literal("failed")
        ),
        result: v.optional(v.array(v.any())),
        error: v.optional(v.string()),
        processingTime: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { jobId, status, result, error, processingTime } = args;

        const updateData: any = {
            status,
        };

        if (status === "completed" || status === "failed") {
            updateData.completedAt = Date.now();
        }

        if (result) {
            updateData.result = result;
        }

        if (error) {
            updateData.error = error;
        }

        if (processingTime) {
            updateData.processingTime = processingTime;
        }

        await ctx.db.patch(jobId, updateData);

        return { success: true };
    },
});

// Clean up old completed/failed jobs (optional - can be called periodically)
export const cleanupOldJobs = mutation({
    args: {
        daysOld: v.optional(v.number()), // Default: 7 days
    },
    handler: async (ctx, args) => {
        const daysOld = args.daysOld || 7;
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

        const oldJobs = await ctx.db
            .query("jsonJobs")
            .filter(q =>
                q.and(
                    q.or(
                        q.eq(q.field("status"), "completed"),
                        q.eq(q.field("status"), "failed")
                    ),
                    q.lt(q.field("createdAt"), cutoffTime)
                )
            )
            .collect();

        for (const job of oldJobs) {
            await ctx.db.delete(job._id);
        }

        return { deleted: oldJobs.length };
    },
});