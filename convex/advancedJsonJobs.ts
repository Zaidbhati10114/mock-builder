import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new advanced job with model and resource type
export const createAdvancedJob = mutation({
    args: {
        projectId: v.string(),
        model: v.string(),
        resources: v.string(),
        resourceName: v.string(),
        objectsCount: v.number(),
        prompt: v.string(),
        fields: v.array(v.object({
            label: v.string(),
            type: v.string(),
        })),
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
            // Store additional metadata
            metadata: {
                model: args.model,
                resources: args.resources,
                resourceName: args.resourceName,
                fields: args.fields,
            },
        });

        return jobId;
    },
});

// Get job with metadata
export const getAdvancedJob = query({
    args: {
        jobId: v.id("jsonJobs"),
    },
    handler: async (ctx, args) => {
        const job = await ctx.db.get(args.jobId);
        if (!job) return null;

        // Parse metadata if it exists
        return {
            ...job,
            model: job.metadata?.model,
            resources: job.metadata?.resources,
            resourceName: job.metadata?.resourceName,
            fields: job.metadata?.fields,
        };
    },
});

// Get latest job for project with metadata
export const getLatestAdvancedJobForProject = query({
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

        if (!job) return null;

        return {
            ...job,
            model: job.metadata?.model,
            resources: job.metadata?.resources,
            resourceName: job.metadata?.resourceName,
            fields: job.metadata?.fields,
        };
    },
});