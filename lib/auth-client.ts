"use client"

import { createAuthClient } from "better-auth/react"
import type { components } from "@/lib/auth"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
})

export type Session = components["schemas"]["Session"]

// Export specific methods for easier use
export const { signIn, signUp, signOut, useSession } = authClient

