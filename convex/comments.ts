import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import auth from "./auth";

/**
 * Get all Comments for an issue
 */
export const listComments = query({
  args: { issueId: v.id("issues") },
  returns: v.array(
    v.object({
      _id: v.id("comments"),
      _creationTime: v.number(),
      content: v.string(),
      issueId: v.id("issues"),
      userId: v.string(),
      user: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      return [];
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", issue.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      return [];
    }

    return await ctx.db
      .query("comments")
      .withIndex("by_issueId", (q) => q.eq("issueId", args.issueId))
      .collect();
  },
});

/**
 * Create Comment
 */
export const createComment = mutation({
  args: {
    issueId: v.id("issues"),
    content: v.string(),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Issue not found");
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
        q.eq("teamId", issue.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("comments", {
      content: args.content,
      issueId: args.issueId,
      userId,
      user: user.name,
    });
  },
});

/**
 * Update Comment
 */
export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only the comment author can update it
    if (comment.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.commentId, { content: args.content });
    return null;
  },
});

/**
 * Delete Comment
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only the comment author can delete it
    if (comment.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.commentId);
    return null;
  },
});
