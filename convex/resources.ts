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
            throw error; // Propagate the error back
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
                console.log("Resource not found");
                return null
            }

            return resource || null;
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

export const getResourceByIdHttp = httpAction(async (ctx: GenericActionCtx<any>, request: Request) => {
    const url = new URL(request.url);
    const resourceId = url.searchParams.get("resourceID");


    if (!resourceId) {
        return new Response(JSON.stringify({ error: 'resourceId is required' }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 400
        });
    }

    try {
        const resource = await ctx.runQuery(api.resources.getResourceByID, { resourceId: resourceId as Id<"resources"> });

        if (!resource) {
            return new Response(JSON.stringify({ error: 'Resource not found' }), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 404
            });
        }

        if (resource?.live === false) {
            return new Response(JSON.stringify({ error: 'Resource is not live' }), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 400
            });
        }

        return new Response(JSON.stringify(resource.data), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });
    } catch (error: any) {
        console.error('Error fetching resource:', error);
        return new Response(JSON.stringify({ error: 'Server error', details: error.message }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 500
        });
    }
});

