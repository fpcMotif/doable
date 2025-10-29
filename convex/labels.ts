import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import auth from "./auth";

/**
 * Get all Labels for a team
 */
export const listLabels = query({
  args: { teamId: v.id("teams") },
  returns: v.array(
    v.object({
      _id: v.id("labels"),
      _creationTime: v.number(),
      name: v.string(),
      color: v.string(),
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

    return await ctx.db
      .query("labels")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

/**
 * Create Label
 */
export const createLabel = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    color: v.string(),
  },
  returns: v.id("labels"),
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

    return await ctx.db.insert("labels", {
      name: args.name,
      color: args.color,
      teamId: args.teamId,
    });
  },
});

/**
 * Update Label
 */
export const updateLabel = mutation({
  args: {
    labelId: v.id("labels"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const label = await ctx.db.get(args.labelId);
    if (!label) {
      throw new Error("Label not found");
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", label.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role === "viewer") {
      throw new Error("Unauthorized");
    }

    const updates: Partial<typeof label> = {};
    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.color !== undefined) {
      updates.color = args.color;
    }

    await ctx.db.patch(args.labelId, updates);
    return null;
  },
});

/**
 * Delete Label
 */
export const deleteLabel = mutation({
  args: {
    labelId: v.id("labels"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const label = await ctx.db.get(args.labelId);
    if (!label) {
      throw new Error("Label not found");
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", label.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role === "viewer") {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.labelId);
    return null;
  },
});
