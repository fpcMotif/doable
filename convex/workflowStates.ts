import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import auth from "./auth";

/**
 * Get all Workflow States for a team
 */
export const listStates = query({
  args: { teamId: v.id("teams") },
  returns: v.array(
    v.object({
      _id: v.id("workflowStates"),
      _creationTime: v.number(),
      name: v.string(),
      type: v.string(),
      color: v.string(),
      position: v.number(),
      teamId: v.id("teams"),
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

    // Sort by position
    const states = await ctx.db
      .query("workflowStates")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    return states.sort((a, b) => a.position - b.position);
  },
});

/**
 * Create Workflow State
 */
export const createState = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    type: v.string(),
    color: v.string(),
    position: v.number(),
  },
  returns: v.id("workflowStates"),
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

    return await ctx.db.insert("workflowStates", {
      name: args.name,
      type: args.type,
      color: args.color,
      position: args.position,
      teamId: args.teamId,
    });
  },
});

/**
 * Update Workflow State
 */
export const updateState = mutation({
  args: {
    stateId: v.id("workflowStates"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    color: v.optional(v.string()),
    position: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const state = await ctx.db.get(args.stateId);
    if (!state) {
      throw new Error("Workflow state not found");
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", state.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role === "viewer") {
      throw new Error("Unauthorized");
    }

    const updates: Partial<typeof state> = {};
    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.type !== undefined) {
      updates.type = args.type;
    }
    if (args.color !== undefined) {
      updates.color = args.color;
    }
    if (args.position !== undefined) {
      updates.position = args.position;
    }

    await ctx.db.patch(args.stateId, updates);
    return null;
  },
});

/**
 * Delete Workflow State
 */
export const deleteState = mutation({
  args: {
    stateId: v.id("workflowStates"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const state = await ctx.db.get(args.stateId);
    if (!state) {
      throw new Error("Workflow state not found");
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", state.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role === "viewer") {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.stateId);
    return null;
  },
});
