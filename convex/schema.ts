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
        // NEW FIELDS FOR API TRACKING
        apiRequestsThisMonth: v.optional(v.number()),
        apiRequestsResetDate: v.optional(v.string()), // Format: "YYYY-M" like "2024-8"
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_subscriptionId", ["subscriptionId"]),

    // NEW TABLE FOR API REQUEST LOGGING
    apiRequests: defineTable({
        resourceId: v.id("resources"),
        userId: v.id("users"),
        timestamp: v.number(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        responseStatus: v.number(),
        responseTime: v.optional(v.number()), // milliseconds
    })
        .index("by_user_id", ["userId"])
        .index("by_resource_id", ["resourceId"])
        .index("by_timestamp", ["timestamp"])
        .index("by_user_and_timestamp", ["userId", "timestamp"]) // For efficient user analytics
        .index("by_resource_and_timestamp", ["resourceId", "timestamp"]), // For resource analytics

    // OPTIONAL: Daily aggregated stats for better performance on large datasets
    dailyApiStats: defineTable({
        userId: v.id("users"),
        resourceId: v.id("resources"),
        date: v.string(), // Format: "YYYY-MM-DD"
        requestCount: v.number(),
        uniqueIPs: v.number(),
        avgResponseTime: v.optional(v.number()),
    })
        .index("by_user_and_date", ["userId", "date"])
        .index("by_resource_and_date", ["resourceId", "date"])
        .index("by_date", ["date"]),
});