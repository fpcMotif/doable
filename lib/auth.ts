import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { db } from "./db"

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  // Only Google OAuth authentication
  socialProviders: {
    google: { 
      clientId: process.env.GOOGLE_CLIENT_ID as string, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
    }, 
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
  plugins: [
    nextCookies(), // Must be last plugin
  ],
})

export type Session = typeof auth.$Infer.Session

// Session helpers for server-side
export async function getAuthUser() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then(m => m.headers())
  })
  return session?.user?.id
}

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then(m => m.headers())
  })
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  
  return session.user.id
}

export async function currentUser() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then(m => m.headers())
  })
  return session?.user || null
}

// For backwards compatibility with existing code
export async function getAuthHeaders() {
  return {}
}
