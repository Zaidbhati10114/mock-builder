import { ConvexError, v } from "convex/values";
import { internalMutation, query } from "./_generated/server";


export const createUser = internalMutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        imageUrl: v.string(),
        isPro: v.boolean(),
        projectCount: v.number(),
        resourceCount: v.number(),
        jsonGenerationCount: v.optional(v.number()),

    }, handler: async (ctx, args) => {
        await ctx.db.insert('users', {
            clerkId: args.clerkId,
            email: args.email,
            name: args.name,
            imageUrl: args.imageUrl,
            isPro: false,
            projectCount: 0,
            resourceCount: 0,
            jsonGenerationCount: 1000,
        })

    }
})

export const updateUser = internalMutation({
    args: {
        clerkId: v.string(),
        imageUrl: v.string(),
        email: v.string(),
    },
    async handler(ctx, args) {
    },
});

export const getUserById = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .unique();

        if (!user) {
            throw new ConvexError("User not found");
        }

        return user;
    },
});

export const deleteUser = internalMutation({
    args: { clerkId: v.string() },
    async handler(ctx, args) {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .unique();

        if (!user) {
            throw new ConvexError("User not found");
        }

        await ctx.db.delete(user._id);
    },
});