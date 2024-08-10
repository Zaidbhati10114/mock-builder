import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query, action, internalQuery, internalAction } from "./_generated/server";
import { Stripe } from "stripe"
import { internal } from "./_generated/api";
//import { clerkClient } from "@clerk/nextjs/server";


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
    args: { clerkId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .unique();

        if (!user) {
            return undefined;
        }

        return user;
    },
});

export const deleteUser = mutation({
    args: { clerkId: v.string() },
    async handler(ctx, args) {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .unique();

        if (!user) {
            throw new ConvexError("User not found");
        }

        // check for subscription if yes then cancel it
        await ctx.db.delete(user._id);

        //await clerkClient.users.deleteUser(user._id);

        return { success: true }
    },
});

// In your users.ts or similar file
export const getUserByEmail = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .unique();
    },
});

export const deleteUserFor = internalMutation({
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

export const updateSubscription = internalMutation({
    args: {
        subscriptionId: v.string(),
        clerkId: v.string(),
        subscriptionEndDate: v.number(),

    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query('users').withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId)).first();
        if (!user) {
            throw new Error("User not found");

        }
        await ctx.db.patch(user._id, {
            subscriptionId: args.subscriptionId,
            isPro: true,
            subscriptionEndDate: args.subscriptionEndDate,
            jsonGenerationCount: 10000,
        })


    }
})


export const updateSubscriptionUsingSubId = internalMutation({
    args: {
        subscriptionId: v.string(),
        subscriptionEndDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query('users').withIndex('by_subscriptionId', (q) => q.eq('subscriptionId', args.subscriptionId)).first();
        if (!user) {
            throw new Error("User not found");

        }
        await ctx.db.patch(user._id, {
            subscriptionEndDate: args.subscriptionEndDate,
        })


    }
});

export const getUser = query({
    args: {},
    handler: async (ctx, args) => {
        const user = await ctx.auth.getUserIdentity();
        if (!user) {
            return null;
        };
        return ctx.db.query('users').withIndex("by_clerk_id", (q) => q.eq("clerkId", user.subject)).first();

    }
});

export const getUserForStripe = internalQuery({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return ctx.db
            .query('users')
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
    }
});

export const cancelSubscription = action({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(internal.users.getUserForStripe, { clerkId: args.clerkId });

        if (!user || !user.subscriptionId) {
            throw new Error("No active subscription found");
        }

        const stripe = new Stripe(process.env.STRIPE_KEY!, {
            apiVersion: "2024-06-20",
        });

        try {
            // Cancel the subscription in Stripe
            const canceledSubscription = await stripe.subscriptions.cancel(user.subscriptionId);

            // Update user in Convex
            await ctx.runMutation(internal.users.updateSubscriptionStatus, {
                clerkId: args.clerkId,
                isPro: false,
                subscriptionId: null,
                subscriptionEndDate: canceledSubscription.cancel_at ? canceledSubscription.cancel_at * 1000 : null,
            });

            return { success: true, message: "Subscription cancelled successfully" };
        } catch (error) {
            console.error("Error cancelling subscription:", error);
            return { success: false, message: "Failed to cancel subscription" };
        }
    },
});


export const updateSubscriptionStatus = internalMutation({
    args: {
        clerkId: v.string(),
        isPro: v.boolean(),
        subscriptionId: v.union(v.string(), v.null()),
        subscriptionEndDate: v.union(v.number(), v.null()),
        jsonGenerationCount: v.optional(v.number()),

    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            isPro: args.isPro,
            subscriptionId: args.subscriptionId,
            subscriptionEndDate: args.subscriptionEndDate,
            jsonGenerationCount: args.jsonGenerationCount,
        });
    },
});





