import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import auth from "./auth";

/**
 * Get all Invitations for a team
 */
export const listInvitations = query({
  args: { teamId: v.id("teams") },
  returns: v.array(
    v.object({
      _id: v.id("invitations"),
      _creationTime: v.number(),
      email: v.string(),
      role: v.string(),
      status: v.string(),
      invitedBy: v.string(),
      expiresAt: v.number(),
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
      .query("invitations")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

/**
 * Create Invitation
 */
export const createInvitation = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    role: v.string(),
    expiresAt: v.number(),
  },
  returns: v.id("invitations"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify permission (only admins can invite)
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("invitations", {
      email: args.email,
      role: args.role,
      status: "pending",
      invitedBy: userId,
      expiresAt: args.expiresAt,
      teamId: args.teamId,
    });
  },
});

/**
 * Update Invitation status
 */
export const updateInvitationStatus = mutation({
  args: {
    invitationId: v.id("invitations"),
    status: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    await ctx.db.patch(args.invitationId, { status: args.status });
    return null;
  },
});

/**
 * Delete Invitation
 */
export const deleteInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Verify permission
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_teamId_and_userId", (q) =>
        q.eq("teamId", invitation.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership || membership.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.invitationId);
    return null;
  },
});
