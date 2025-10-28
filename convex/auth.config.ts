import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

/**
 * Convex Auth 配置
 * 替代 Better Auth，使用 Google OAuth
 */
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
});

