import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth.config";

/**
 * 获取团队的所有 Projects
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

    return await ctx.db
      .query("projects")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

/**
 * 根据 ID 获取 Project
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

    // 验证权限
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
 * 创建 Project
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

