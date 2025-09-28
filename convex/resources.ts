import { ConvexError, v } from "convex/values";
import { httpAction, mutation, query } from "./_generated/server";

import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { GenericActionCtx } from "convex/server";


export const createResource = mutation({
    args: {
        projectId: v.string(),
        resourceName: v.string(),
        data: v.array(v.any()),
    },
    handler: async (ctx, { projectId, resourceName, data }) => {
        try {
            const identity = await ctx.auth.getUserIdentity();

            if (!identity) {
                throw new ConvexError("User not authenticated");
            }

            const user = await ctx.db.query("users").filter(q => q.eq(q.field("email"), identity.email)).collect();
            if (user.length === 0) {
                throw new ConvexError("User not found");
            }

            if (!user[0]?.isPro && user[0]?.resourceCount! >= 2) {
                throw new ConvexError("You have reached the maximum number of projects");
            }

            // Insert the resource into the resources table
            const resourceId = await ctx.db.insert("resources", {
                userId: user[0]._id,
                projectId,
                resourceName,
                data,
                live: false, // Set to false by default as requested
            });

            await ctx.db.patch(user[0]._id, {
                resourceCount: user[0].resourceCount! + 1
            })



            return resourceId;
        } catch (error) {
            console.error('Error occurred during resource creation:', error);
            throw new ConvexError("Error occurred during resource creation");
        }
    },
});

export const reduceJsonGenerationCount = mutation({
    args: {
        clerkId: v.string(),
    }, handler: async (ctx, args) => {
        try {
            const identity = await ctx.auth.getUserIdentity();

            if (!identity) {
                throw new ConvexError("User not authenticated");
            }

            const user = await ctx.db.query("users").filter(q => q.eq(q.field("email"), identity.email)).collect();
            if (user.length === 0) {
                throw new ConvexError("User not found");
            }

            if (!user[0]?.isPro && user[0]?.resourceCount! >= 2) {
                throw new ConvexError("You have reached the maximum number of projects");
            }

            await ctx.db.patch(user[0]._id, {
                jsonGenerationCount: user[0].jsonGenerationCount! - 10
            })

            return { success: true }

        } catch (error) {
            console.error('Error occurred during resource creation:', error);
            throw new ConvexError("Error occurred during resource creation");
        }

    }
})
export const getResourceByID = query({
    args: {
        resourceId: v.id("resources"),
    },
    handler: async (ctx, { resourceId }) => {
        try {
            const resource = await ctx.db
                .query("resources")
                .filter(q => q.eq(q.field("_id"), resourceId))
                .first();

            if (!resource) {
                return null;
            }

            // Also fetch the user data
            const user = await ctx.db.get(resource.userId);

            return {
                ...resource,
                user: user // Include user data in the response
            };
        } catch (error) {
            console.error('Error occurred while fetching the resource by ID:', error);
            throw new Error("Failed to fetch resource");
        }
    },
});

export const getResources = query({

    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        if (!args.projectId) {
            throw new ConvexError("Project ID is required");
        }
        const resource = await ctx.db.query("resources").filter(q => q.eq(q.field("projectId"), args.projectId)).collect();
        if (!resource) {
            return [];
        }
        return resource;
    }

});

export const toggleProjectLive = mutation({
    args: {
        projectId: v.id("projects"),

    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("User not authenticated");
        }

        const user = await ctx.db.query("users").filter(q => q.eq(q.field("email"), identity.email)).collect();
        if (user.length === 0) {
            throw new ConvexError("User not found");
        }

        const resource = await ctx.db.query("resources").filter(q => q.eq(q.field("projectId"), args.projectId)).first();
        if (!resource) {
            throw new Error("Resource not found")
        }
        const newLiveStatus = !resource.live;
        await ctx.db.patch(resource._id, { live: newLiveStatus });

        return { success: true, live: newLiveStatus };
    }
});

export const deleteResource = mutation({
    args: {
        resourceId: v.id("resources"),
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const { resourceId, clerkId } = args;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            throw new ConvexError("User not found");
        }


        const resource = await ctx.db.get(resourceId);
        if (!resource) {
            throw new ConvexError("Resource not found");
        }

        await ctx.db.delete(resourceId);

        await ctx.db.patch(user._id, {
            resourceCount: Math.max(0, user.resourceCount! - 1) // Ensure it doesn't go below 0
        });

        return { success: true }
    }
});

export const checkAndIncrementApiUsage = mutation({
    args: {
        userId: v.id("users"),
        resourceId: v.id("resources"),
        userAgent: v.string(),
        ipAddress: v.string(),
    },
    handler: async (ctx, { userId, resourceId, userAgent, ipAddress }) => {
        const user = await ctx.db.get(userId);
        if (!user) return false;

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
        const resetDate = user.apiRequestsResetDate;

        // Handle existing users who don't have these fields yet
        // OR reset counter if it's a new month
        if (!resetDate || resetDate !== currentMonth || user.apiRequestsThisMonth === undefined) {
            await ctx.db.patch(userId, {
                apiRequestsThisMonth: 0,
                apiRequestsResetDate: currentMonth
            });
            // Update the user object for the current function
            user.apiRequestsThisMonth = 0;
        }

        // Check limits (handle undefined gracefully)
        const limit = user.isPro ? 50000 : 1000;
        const currentUsage = user.apiRequestsThisMonth || 0; // Default to 0 if undefined

        if (currentUsage >= limit) {
            return false;
        }

        // Rest of your logic...
        await ctx.db.patch(userId, {
            apiRequestsThisMonth: currentUsage + 1
        });

        await ctx.db.insert("apiRequests", {
            resourceId,
            userId,
            timestamp: Date.now(),
            ipAddress,
            userAgent,
            responseStatus: 200
        });

        return {
            success: true,
            remaining: limit - (currentUsage + 1)
        };
    }
});



export const getResourceByIdHttp = httpAction(async (ctx: GenericActionCtx<any>, request: Request) => {
    const url = new URL(request.url);
    const resourceId = url.searchParams.get("resourceID");

    if (!resourceId) {
        return new Response(JSON.stringify({ error: 'resourceId is required' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        });
    }

    try {
        const resourceWithUser = await ctx.runQuery(api.resources.getResourceByID, {
            resourceId: resourceId as Id<"resources">
        });

        if (!resourceWithUser) {
            return new Response(JSON.stringify({ error: 'Resource not found' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 404
            });
        }

        if (!resourceWithUser.live) {
            return new Response(JSON.stringify({ error: 'Resource is not live' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400
            });
        }

        if (!resourceWithUser.user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            });
        }

        const user = resourceWithUser.user;

        // Check rate limits before serving data
        const isWithinLimit = await ctx.runMutation(api.resources.checkAndIncrementApiUsage, {
            userId: resourceWithUser.userId,
            resourceId: resourceId as Id<"resources">,
            userAgent: request.headers.get('user-agent') || '',
            ipAddress: getClientIP(request)
        });

        if (!isWithinLimit) {
            return new Response(JSON.stringify({
                error: 'API rate limit exceeded',
                message: user.isPro
                    ? 'You have exceeded your monthly limit of 50,000 requests. Please upgrade or wait for next month.'
                    : 'You have exceeded your monthly limit of 1,000 requests. Please upgrade to Pro for higher limits.'
            }), {
                headers: { 'Content-Type': 'application/json' },
                status: 429
            });
        }

        return new Response(JSON.stringify(resourceWithUser.data), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST',
                'Access-Control-Allow-Headers': 'Content-Type',
                'X-RateLimit-Remaining': isWithinLimit.remaining?.toString() || '0',
                'X-RateLimit-Limit': user.isPro ? '50000' : '1000',
            },
            status: 200
        });

    } catch (error: any) {
        console.error('Error fetching resource:', error);
        return new Response(JSON.stringify({ error: 'Server error' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
});



// Helper function to get client IP
function getClientIP(request: Request): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';
}

