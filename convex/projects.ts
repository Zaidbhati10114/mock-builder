import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { redirect } from "next/navigation";


export const createProject = mutation({
    args: {
        projectName: v.string(),
    },
    handler: async (ctx, args) => {
        try {
            const identity = await ctx.auth.getUserIdentity();

            if (!identity) {
                throw new ConvexError("User not authenticated");
            }

            const user = await ctx.db.query("users").filter(q => q.eq(q.field("email"), identity.email)).collect();
            if (user.length === 0) {
                throw new ConvexError("User not found");
            }

            if (!user[0]?.isPro && user[0]?.projectCount! >= 2) {
                throw new ConvexError("You have reached the maximum number of projects");
            }

            const projects = await ctx.db.insert("projects", {
                projectName: args.projectName,
                userId: user[0]._id,
            });

            await ctx.db.patch(user[0]._id, {
                projectCount: user[0].projectCount! + 1
            });

            return projects;


        } catch (error) {
            console.error('Error occurred during project creation:', error);
            throw new ConvexError("Error occurred during project creation");
        }
    },
});



export const getProjects = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const { clerkId } = args;

        // Find the user by clerkId
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        // Fetch projects for this user
        const projects = await ctx.db
            .query("projects")
            .filter(q => q.eq(q.field("userId"), user._id))
            .collect();

        return projects;
    }
});



export const getProject = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        if (!project) {
            redirect("/dashboard/empty");
        }
        return project;
    },
});

export const deleteProject = mutation({
    args: {
        id: v.id('projects'),
        clerkId: v.string()
    },
    handler: async (ctx, args) => {
        const { id, clerkId } = args;

        // Find the user
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            throw new ConvexError("User not found");
        }

        // Get the project
        const project = await ctx.db.get(id);
        if (!project) {
            throw new ConvexError("Project not found");
        }

        // Ensure the project belongs to the user
        if (project.userId !== user._id) {
            throw new ConvexError("You don't have permission to delete this project");
        }

        // Delete all resources associated with this project
        const resources = await ctx.db
            .query("resources")
            .filter(q => q.eq(q.field("projectId"), id))
            .collect();

        for (const resource of resources) {
            await ctx.db.delete(resource._id);
        }

        // Delete the project
        await ctx.db.delete(id);

        // Decrement the user's project count
        await ctx.db.patch(user._id, {
            projectCount: Math.max(0, user?.projectCount! - 1) // Ensure it doesn't go below 0
        });

        return { success: true };
    }
});



export const deleteAllProjectsForUser = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const { clerkId } = args;

        // Find the user
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) {
            throw new ConvexError("User not found");
        }

        // Get all projects for the user
        const projects = await ctx.db
            .query("projects")
            .filter((q) => q.eq(q.field("userId"), user._id))
            .collect();

        for (const project of projects) {
            // Delete all resources associated with each project
            const resources = await ctx.db
                .query("resources")
                .filter((q) => q.eq(q.field("projectId"), project._id))
                .collect();

            for (const resource of resources) {
                await ctx.db.delete(resource._id);
            }

            // Delete the project
            await ctx.db.delete(project._id);
        }

        return { success: true };
    },
});


