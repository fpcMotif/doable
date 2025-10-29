import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import auth from "./auth";

/**
 * Get all Chat Conversations for a user in a team
 * If conversationId is provided, returns only that conversation
 */
export const listConversations = query({
  args: {
    teamId: v.optional(v.id("teams")),
    userId: v.optional(v.string()),
    conversationId: v.optional(v.id("chatConversations")),
  },
  returns: v.array(
    v.object({
      _id: v.id("chatConversations"),
      _creationTime: v.number(),
      teamId: v.id("teams"),
      userId: v.string(),
      title: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    // If specific conversation requested, return it
    if (args.conversationId) {
      const conversation = await ctx.db.get(args.conversationId);
      return conversation ? [conversation] : [];
    }

    const userId = args.userId || (await auth.getUserId(ctx));
    if (!userId) {
      return [];
    }

    // If teamId provided, filter by team
    if (args.teamId) {
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
        .query("chatConversations")
        .withIndex("by_teamId_and_userId", (q) =>
          q.eq("teamId", args.teamId).eq("userId", userId)
        )
        .collect();
    }

    // Return all conversations for user
    return await ctx.db
      .query("chatConversations")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});

/**
 * Create Chat Conversation
 */
export const createConversation = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
    title: v.optional(v.string()),
  },
  returns: v.id("chatConversations"),
  handler: async (ctx, args) => {
    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("chatConversations", {
      teamId: args.teamId,
      userId: args.userId,
      title: args.title,
    });
  },
});

/**
 * Update Conversation title
 */
export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Only the conversation owner can update it
    if (conversation.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, { title: args.title });
    return null;
  },
});

/**
 * Delete Conversation
 */
export const deleteConversation = mutation({
  args: {
    conversationId: v.id("chatConversations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Only the conversation owner can delete it
    if (conversation.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Delete all messages in the conversation
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.conversationId);
    return null;
  },
});
