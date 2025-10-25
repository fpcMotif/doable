import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Add any custom middleware logic here if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes except Stack Auth handler
    "/api/((?!teams/create|teams/\\[teamId\\]/sync).*)",
    // Match all dashboard routes
    "/dashboard/:path*",
  ],
};
