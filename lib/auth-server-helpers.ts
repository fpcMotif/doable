import { auth } from "./auth"
import { headers } from "next/headers"

/**
 * Get the current session from Better Auth
 */
export async function getSession() {
  return await auth.api.getSession({
    headers: await headers()
  })
}

/**
 * Get the current user ID (throws if not authenticated)
 */
export async function getUserId() {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session.user.id
}

/**
 * Get the current user object (throws if not authenticated)
 */
export async function getUser() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session.user
}

/**
 * Check if user is authenticated (returns null if not)
 */
export async function getSessionOrNull() {
  return await getSession()
}

