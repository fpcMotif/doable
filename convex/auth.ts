/**
 * Convex Auth Helper
 */

import type { MutationCtx, QueryCtx } from "./_generated/server";

export const auth = {
  getUserId: async (ctx: QueryCtx | MutationCtx): Promise<string | null> => {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.subject ?? null;
  },
};

export default auth;
