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
        jsonGenerationCount: v.optional(v.number())
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_subscriptionId", ["subscriptionId"])
});