import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth.config";

/**
 * 获取用户的所有团队
 */
export const getUserTeams = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("teams"),
      _creationTime: v.number(),
      name: v.string(),
      key: v.string(),
      groqApiKey: v.optional(v.string()),
      role: v.string(),
    })
  ),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    // 查询用户所属的团队
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const teams = [];
    for (const membership of memberships) {
      const team = await ctx.db.get(membership.teamId);
      if (team) {
        teams.push({
          ...team,
          role: membership.role,
        });
      }
    }

    return teams;
  },
});

/**
 * 根据 ID 获取团队
 */
export const getTeam = query({
  args: { teamId: v.id("teams") },
  returns: v.union(
    v.object({
      _id: v.id("teams"),
      _creationTime: v.number(),
      name: v.string(),
      key: v.string(),
      groqApiKey: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    // 验证用户是否为团队成员
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      return null;
    }

    return await ctx.db.get(args.teamId);
  },
});

/**
 * 创建新团队
 */
export const createTeam = mutation({
  args: {
    name: v.string(),
    key: v.string(),
  },
  returns: v.id("teams"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // 获取用户信息
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // 创建团队
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      key: args.key,
    });

    // 添加创建者为管理员
    await ctx.db.insert("teamMembers", {
      teamId,
      userId,
      userEmail: user.email,
      userName: user.name,
      role: "admin",
    });

    return teamId;
  },
});

/**
 * 获取团队统计信息
 */
export const getTeamStats = query({
  args: { teamId: v.id("teams") },
  returns: v.object({
    totalIssues: v.number(),
    completedIssues: v.number(),
    activeIssues: v.number(),
    totalProjects: v.number(),
    totalMembers: v.number(),
  }),
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

    if (!membership) {
      throw new Error("Unauthorized");
    }

    // 统计数据
    const allIssues = await ctx.db
      .query("issues")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    const completedWorkflowStates = await ctx.db
      .query("workflowStates")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("type"), "completed"))
      .collect();

    const completedStateIds = new Set(completedWorkflowStates.map((s) => s._id));
    const completedIssues = allIssues.filter((i) =>
      completedStateIds.has(i.workflowStateId)
    );

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    return {
      totalIssues: allIssues.length,
      completedIssues: completedIssues.length,
      activeIssues: allIssues.length - completedIssues.length,
      totalProjects: projects.length,
      totalMembers: members.length,
    };
  },
});

