import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Get all Chat Messages for a conversation
 */
export const listMessages = query({
  args: { conversationId: v.id("chatConversations") },
  returns: v.array(
    v.object({
      _id: v.id("chatMessages"),
      _creationTime: v.number(),
      conversationId: v.id("chatConversations"),
      role: v.string(),
      content: v.string(),
      toolCalls: v.optional(v.any()),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return [];
    }

    // Only the conversation owner can view messages
    if (conversation.userId !== userId) {
      return [];
    }

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
  },
});

/**
 * Create Chat Message
 */
export const createMessage = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    role: v.string(),
    content: v.string(),
    toolCalls: v.optional(v.any()),
  },
  returns: v.id("chatMessages"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Only the conversation owner can add messages
    if (conversation.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      toolCalls: args.toolCalls,
    });
  },
});

/**
 * Delete Chat Message
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("chatMessages"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Only the conversation owner can delete messages
    if (conversation.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.messageId);
    return null;
  },
});
