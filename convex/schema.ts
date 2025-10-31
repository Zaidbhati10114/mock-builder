import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    projects: defineTable({
        projectName: v.string(),
        userId: v.id("users"),
    }).searchIndex('project_name', { searchField: 'projectName' }),

    resources: defineTable({
        projectId: v.string(),
        userId: v.id('users'),
        resourceName: v.string(),
        data: v.array(v.any()),
        live: v.boolean(),
    }),

    // NEW: JSON Generation Jobs Table
    jsonJobs: defineTable({
        userId: v.id("users"),
        projectId: v.string(),
        prompt: v.string(),
        objectsCount: v.number(),
        status: v.union(
            v.literal("queued"),
            v.literal("processing"),
            v.literal("completed"),
            v.literal("failed")
        ),
        result: v.optional(v.array(v.any())),
        error: v.optional(v.string()),
        createdAt: v.number(),
        completedAt: v.optional(v.number()),
        processingTime: v.optional(v.number()), // milliseconds
        // Optional metadata for advanced generator
        metadata: v.optional(v.object({
            model: v.optional(v.string()),
            resources: v.optional(v.string()),
            resourceName: v.optional(v.string()),
            fields: v.optional(v.array(v.object({
                label: v.string(),
                type: v.string(),
            }))),
        })),
    })
        .index("by_user", ["userId"])
        .index("by_project", ["projectId"])
        .index("by_status", ["status"])
        .index("by_user_and_status", ["userId", "status"]),

    users: defineTable({
        email: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        name: v.string(),
        isPro: v.boolean(),
        subscriptionId: v.optional(v.union(v.string(), v.null())),
        subscriptionEndDate: v.optional(v.union(v.number(), v.null())),
        projectCount: v.optional(v.number()),
        resourceCount: v.optional(v.number()),
        jsonGenerationCount: v.optional(v.number()),
        apiRequestsThisMonth: v.optional(v.number()),
        apiRequestsResetDate: v.optional(v.string()),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_subscriptionId", ["subscriptionId"]),

    apiRequests: defineTable({
        resourceId: v.id("resources"),
        userId: v.id("users"),
        timestamp: v.number(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        responseStatus: v.number(),
        responseTime: v.optional(v.number()),
    })
        .index("by_user_id", ["userId"])
        .index("by_resource_id", ["resourceId"])
        .index("by_timestamp", ["timestamp"])
        .index("by_user_and_timestamp", ["userId", "timestamp"])
        .index("by_resource_and_timestamp", ["resourceId", "timestamp"]),

    dailyApiStats: defineTable({
        userId: v.id("users"),
        resourceId: v.id("resources"),
        date: v.string(),
        requestCount: v.number(),
        uniqueIPs: v.number(),
        avgResponseTime: v.optional(v.number()),
    })
        .index("by_user_and_date", ["userId", "date"])
        .index("by_resource_and_date", ["resourceId", "date"])
        .index("by_date", ["date"]),
});