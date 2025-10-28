import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth.config";

/**
 * 获取团队的所有 Workflow States
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

    // 验证权限
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      return [];
    }

    // 按 position 排序
    const states = await ctx.db
      .query("workflowStates")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    return states.sort((a, b) => a.position - b.position);
  },
});

/**
 * 创建 Workflow State
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

    // 验证权限
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

