import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import auth from "./auth";

/**
 * Get all Issues for a team (supports filtering and sorting)
 */
export const listIssues = query({
  args: {
    teamId: v.id("teams"),
    filters: v.optional(
      v.object({
        status: v.optional(v.array(v.id("workflowStates"))),
        assignee: v.optional(v.array(v.string())),
        project: v.optional(v.array(v.id("projects"))),
        priority: v.optional(v.array(v.string())),
        label: v.optional(v.array(v.id("labels"))),
        search: v.optional(v.string()),
      })
    ),
    sort: v.optional(
      v.object({
        field: v.string(),
        direction: v.union(v.literal("asc"), v.literal("desc")),
      })
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("issues"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      number: v.number(),
      priority: v.string(),
      estimate: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      teamId: v.id("teams"),
      projectId: v.optional(v.id("projects")),
      workflowStateId: v.id("workflowStates"),
      assigneeId: v.optional(v.string()),
      assignee: v.optional(v.string()),
      creatorId: v.string(),
      creator: v.string(),
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

    // Base query
    const issuesQuery = ctx.db
      .query("issues")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId));

    let issues = await issuesQuery.collect();

    // Apply filters
    if (args.filters) {
      const { status, assignee, project, priority, search } = args.filters;

      if (status?.length) {
        issues = issues.filter((i) => status.includes(i.workflowStateId));
      }

      if (assignee?.length) {
        issues = issues.filter(
          (i) => i.assigneeId && assignee.includes(i.assigneeId)
        );
      }

      if (project?.length) {
        issues = issues.filter(
          (i) => i.projectId && project.includes(i.projectId)
        );
      }

      if (priority?.length) {
        issues = issues.filter((i) => priority.includes(i.priority));
      }

      if (search) {
        const searchLower = search.toLowerCase();
        issues = issues.filter(
          (i) =>
            i.title.toLowerCase().includes(searchLower) ||
            i.description?.toLowerCase().includes(searchLower)
        );
      }
    }

    // Apply sorting
    if (args.sort) {
      const { field, direction } = args.sort;
      issues.sort((a, b) => {
        const aVal = a[field as keyof typeof a];
        const bVal = b[field as keyof typeof b];
        const aStr = String(aVal ?? "");
        const bStr = String(bVal ?? "");
        const comparison = aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        return direction === "asc" ? comparison : -comparison;
      });
    }

    return issues;
  },
});

/**
 * Get Issue by ID
 */
export const getIssue = query({
  args: {
    issueId: v.id("issues"),
  },
  returns: v.union(
    v.object({
      _id: v.id("issues"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      number: v.number(),
      priority: v.string(),
      estimate: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      teamId: v.id("teams"),
      projectId: v.optional(v.id("projects")),
      workflowStateId: v.id("workflowStates"),
      assigneeId: v.optional(v.string()),
      assignee: v.optional(v.string()),
      creatorId: v.string(),
      creator: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      return null;
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", issue.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      return null;
    }

    return issue;
  },
});

/**
 * Create new Issue
 */
export const createIssue = mutation({
  args: {
    teamId: v.id("teams"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.string(),
    workflowStateId: v.id("workflowStates"),
    projectId: v.optional(v.id("projects")),
    assigneeId: v.optional(v.string()),
    assignee: v.optional(v.string()),
    estimate: v.optional(v.number()),
  },
  returns: v.id("issues"),
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

    // Get next Issue number
    const existingIssues = await ctx.db
      .query("issues")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    const maxNumber = Math.max(0, ...existingIssues.map((i) => i.number));
    const number = maxNumber + 1;

    // Create Issue
    return await ctx.db.insert("issues", {
      title: args.title,
      description: args.description,
      number,
      priority: args.priority,
      estimate: args.estimate,
      teamId: args.teamId,
      projectId: args.projectId,
      workflowStateId: args.workflowStateId,
      assigneeId: args.assigneeId,
      assignee: args.assignee,
      creatorId: userId,
      creator: user.name,
    });
  },
});

/**
 * Update Issue
 */
export const updateIssue = mutation({
  args: {
    issueId: v.id("issues"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    workflowStateId: v.optional(v.id("workflowStates")),
    projectId: v.optional(v.id("projects")),
    assigneeId: v.optional(v.string()),
    assignee: v.optional(v.string()),
    estimate: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", issue.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Unauthorized");
    }

    // Update Issue
    const updates: Partial<typeof issue> = {};
    if (args.title !== undefined) {
      updates.title = args.title;
    }
    if (args.description !== undefined) {
      updates.description = args.description;
    }
    if (args.priority !== undefined) {
      updates.priority = args.priority;
    }
    if (args.workflowStateId !== undefined) {
      updates.workflowStateId = args.workflowStateId;
    }
    if (args.projectId !== undefined) {
      updates.projectId = args.projectId;
    }
    if (args.assigneeId !== undefined) {
      updates.assigneeId = args.assigneeId;
    }
    if (args.assignee !== undefined) {
      updates.assignee = args.assignee;
    }
    if (args.estimate !== undefined) {
      updates.estimate = args.estimate;
    }

    await ctx.db.patch(args.issueId, updates);
    return null;
  },
});

/**
 * Delete Issue
 */
export const deleteIssue = mutation({
  args: {
    issueId: v.id("issues"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", issue.teamId).eq("userId", userId)
      )
      .unique();

    if (
      !membership ||
      (membership.role !== "admin" && membership.role !== "developer")
    ) {
      throw new Error("Unauthorized");
    }

    // Delete related labels and comments
    const issueLabels = await ctx.db
      .query("issueLabels")
      .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
      .collect();

    for (const issueLabel of issueLabels) {
      await ctx.db.delete(issueLabel._id);
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete Issue
    await ctx.db.delete(args.issueId);
    return null;
  },
});
