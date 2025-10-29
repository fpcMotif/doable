import { NextResponse } from "next/server";
import { getSessionOrNull } from "@/lib/auth-server-helpers";
import { api, getConvexClient } from "@/lib/convex";

export async function GET() {
  try {
    // Get the current user from Better Auth
    const session = await getSessionOrNull();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user teams from Convex
    const convex = getConvexClient();
    const teams = await convex.query(api.teams.getUserTeams, {});

    return NextResponse.json(teams);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
