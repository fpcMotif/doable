import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import auth from "./auth";

/**
 * Get all Team Members for a team
 */
export const listMembers = query({
  args: { teamId: v.id("teams") },
  returns: v.array(
    v.object({
      _id: v.id("teamMembers"),
      _creationTime: v.number(),
      role: v.string(),
      teamId: v.id("teams"),
      userId: v.string(),
      userEmail: v.string(),
      userName: v.string(),
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
      .query("teamMembers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

/**
 * Add Team Member
 */
export const addMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    role: v.string(),
  },
  returns: v.id("teamMembers"),
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new Error("Unauthorized");
    }

    // Verify permission (only admins can add members)
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", currentUserId)
      )
      .unique();

    if (!membership || membership.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: args.userId,
      userEmail: args.userEmail,
      userName: args.userName,
      role: args.role,
    });
  },
});

/**
 * Update Team Member role
 */
export const updateMemberRole = mutation({
  args: {
    memberId: v.id("teamMembers"),
    role: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    // Verify permission (only admins can update roles)
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", member.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.memberId, { role: args.role });
    return null;
  },
});

/**
 * Remove Team Member
 */
export const removeMember = mutation({
  args: {
    memberId: v.id("teamMembers"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    // Verify permission (only admins can remove members)
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", member.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.memberId);
    return null;
  },
});
