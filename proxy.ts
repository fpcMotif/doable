import { type NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 requires using proxy.ts instead of middleware.ts
 *
 * Note: Convex Auth authentication logic is handled at the client Provider layer (useAuth hook)
 * Proxy only handles route-level redirects and request preprocessing
 */
export async function proxy(_request: NextRequest) {
  // Optional: Add request logging, header injection, etc
  // console.log(`[Proxy] ${request.method} ${request.nextUrl.pathname}`);

  // Convex Auth completes authentication on client, keep this simple
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
