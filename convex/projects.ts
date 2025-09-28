import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// small slugify helper (optional, used for suggestion)
function slugify(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\- ]+/g, "")
        .replace(/\s+/g, "-")
        .replace(/\-+/g, "-")
        .replace(/^\-|\-$/g, "");
}

/**
 * Lightweight availability check for client-side typing UX.
 * Uses auth identity to find the user, then checks whether a project
 * with the exact (trimmed) projectName already exists for that user.
 *
 * Returns { available: boolean, reason?: string, suggestion?: string }
 */


export const checkNameAvailability = query({
    args: { projectName: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return { available: false, reason: "not_authenticated" };
        }

        const user = await ctx.db.query("users")
            .filter(q => q.eq(q.field("email"), identity.email))
            .first();

        if (!user) {
            return { available: false, reason: "user_not_found" };
        }

        const trimmed = args.projectName.trim();
        if (!trimmed) {
            return { available: false, reason: "empty" };
        }

        // Try exact-match lookup (fast if you added an index by_user_and_name)
        const existing = await ctx.db.query("projects")
            .filter(q => q.eq(q.field("userId"), user._id) && q.eq(q.field("projectName"), trimmed))
            .first();

        if (!existing) {
            return { available: true, suggestion: slugify(trimmed) };
        }

        // Suggest a small suffix (rarely needed; keep the loop short)
        const base = slugify(trimmed) || "project";
        let suggestion: string | undefined;
        for (let i = 1; i <= 5; i++) {
            const candidateName = `${trimmed}-${i}`;
            const found = await ctx.db.query("projects")
                .filter(q => q.eq(q.field("userId"), user._id) && q.eq(q.field("projectName"), candidateName))
                .first();
            if (!found) {
                suggestion = candidateName;
                break;
            }
        }

        return { available: false, reason: "exists", suggestion };
    },
});



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

            const u = user[0];

            if (!u?.isPro && (u?.projectCount ?? 0) >= 2) {
                throw new ConvexError("You have reached the maximum number of projects");
            }

            const trimmed = args.projectName.trim();
            if (!trimmed) {
                throw new ConvexError("Project name is required");
            }

            // Authoritative uniqueness check (server-side).
            // Attempt to find any existing project for this user with the same name.
            const existing = await ctx.db.query("projects")
                .filter(q => q.eq(q.field("userId"), u._id) && q.eq(q.field("projectName"), trimmed))
                .first();

            if (existing) {
                // Friendly, clear validation error for the client to show
                throw new ConvexError("Project name already exists");
            }

            // Insert project
            const projects = await ctx.db.insert("projects", {
                projectName: trimmed,
                userId: u._id,
            });

            // Update projectCount safely
            await ctx.db.patch(u._id, {
                projectCount: (u.projectCount ?? 0) + 1,
            });

            return projects;
        } catch (error) {
            // If it's a ConvexError we rethrow; otherwise wrap as generic message
            if (error instanceof ConvexError) throw error;
            console.error("Error occurred during project creation:", error);
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
            return null;
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


