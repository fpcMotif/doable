/**
 * Convex Client for Server-Side Usage
 * Provides ConvexHttpClient for use in API routes and server components
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

/**
 * Create a server-side Convex client
 * This should be created per-request to avoid connection pooling issues
 */
export function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }

  return new ConvexHttpClient(convexUrl);
}

// Export API for convenience
export { api };
