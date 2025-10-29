import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import auth from "./auth";

/**
 * Get all teams for user
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

    // Query teams belonging to user
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
 * Get team by ID
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

    // Verify user is team member
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
 * Create new team
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

    // Get user information
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Create team
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      key: args.key,
    });

    // Add creator as admin
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
 * Update team settings
 */
export const updateTeam = mutation({
  args: {
    teamId: v.id("teams"),
    groqApiKey: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify user is admin
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const updates: Partial<{ groqApiKey: string | undefined }> = {};
    if (args.groqApiKey !== undefined) {
      updates.groqApiKey =
        args.groqApiKey === null ? undefined : args.groqApiKey;
    }

    await ctx.db.patch(args.teamId, updates);
    return null;
  },
});

/**
 * Delete team
 */
export const deleteTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify user is admin
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Delete all related data
    // Note: Convex doesn't have cascading deletes, so we need to manually delete related data

    // Delete team members
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
    await Promise.all(members.map((m) => ctx.db.delete(m._id)));

    // Delete issues
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
    await Promise.all(issues.map((i) => ctx.db.delete(i._id)));

    // Delete projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
    await Promise.all(projects.map((p) => ctx.db.delete(p._id)));

    // Delete workflow states
    const workflowStates = await ctx.db
      .query("workflowStates")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
    await Promise.all(workflowStates.map((ws) => ctx.db.delete(ws._id)));

    // Delete labels
    const labels = await ctx.db
      .query("labels")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
    await Promise.all(labels.map((l) => ctx.db.delete(l._id)));

    // Delete chat conversations
    const conversations = await ctx.db
      .query("chatConversations")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
    for (const conv of conversations) {
      // Delete messages first
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
        .collect();
      await Promise.all(messages.map((m) => ctx.db.delete(m._id)));
      await ctx.db.delete(conv._id);
    }

    // Delete invitations
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
    await Promise.all(invitations.map((inv) => ctx.db.delete(inv._id)));

    // Finally, delete the team
    await ctx.db.delete(args.teamId);
    return null;
  },
});

/**
 * Get team statistics
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

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Unauthorized");
    }

    // Collect statistics
    const allIssues = await ctx.db
      .query("issues")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    const completedWorkflowStates = await ctx.db
      .query("workflowStates")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("type"), "completed"))
      .collect();

    const completedStateIds = new Set(
      completedWorkflowStates.map((s) => s._id)
    );
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
