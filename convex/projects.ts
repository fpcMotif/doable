import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import auth from "./auth";

/**
 * Get all Projects for a team
 */
export const listProjects = query({
  args: { teamId: v.id("teams") },
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      key: v.string(),
      color: v.string(),
      icon: v.optional(v.string()),
      status: v.string(),
      teamId: v.id("teams"),
      leadId: v.optional(v.string()),
      lead: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      return [];
    }

    return await ctx.db
      .query("projects")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

/**
 * Get Project by ID
 */
export const getProject = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      key: v.string(),
      color: v.string(),
      icon: v.optional(v.string()),
      status: v.string(),
      teamId: v.id("teams"),
      leadId: v.optional(v.string()),
      lead: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return null;
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", project.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      return null;
    }

    return project;
  },
});

/**
 * Create Project
 */
export const createProject = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    description: v.optional(v.string()),
    key: v.string(),
    color: v.string(),
    icon: v.optional(v.string()),
    leadId: v.optional(v.string()),
    lead: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role === "viewer") {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      key: args.key,
      color: args.color,
      icon: args.icon,
      status: "active",
      teamId: args.teamId,
      leadId: args.leadId,
      lead: args.lead,
    });
  },
});

/**
 * Update Project
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    key: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    status: v.optional(v.string()),
    leadId: v.optional(v.string()),
    lead: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", project.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role === "viewer") {
      throw new Error("Unauthorized");
    }

    const updates: Partial<typeof project> = {};
    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.description !== undefined) {
      updates.description = args.description;
    }
    if (args.key !== undefined) {
      updates.key = args.key;
    }
    if (args.color !== undefined) {
      updates.color = args.color;
    }
    if (args.icon !== undefined) {
      updates.icon = args.icon;
    }
    if (args.status !== undefined) {
      updates.status = args.status;
    }
    if (args.leadId !== undefined) {
      updates.leadId = args.leadId;
    }
    if (args.lead !== undefined) {
      updates.lead = args.lead;
    }

    await ctx.db.patch(args.projectId, updates);
    return null;
  },
});

/**
 * Delete Project
 */
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", project.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role === "viewer") {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.projectId);
    return null;
  },
});
