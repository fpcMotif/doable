import { type NextRequest, NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { getUserId } from "@/lib/auth-server-helpers";
import { api, getConvexClient } from "@/lib/convex";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const userId = await getUserId();

    const convex = getConvexClient();

    // Check if team exists and get members
    const [team, members] = await Promise.all([
      convex.query(api.teams.getTeam, { teamId: teamId as Id<"teams"> }),
      convex.query(api.teamMembers.listMembers, {
        teamId: teamId as Id<"teams">,
      }),
    ]);

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is an admin of the team
    const member = members.find((m) => m.userId === userId);
    if (!member || member.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can delete teams" },
        { status: 403 }
      );
    }

    // Delete the team via Convex
    await convex.mutation(api.teams.deleteTeam, {
      teamId: teamId as Id<"teams">,
    });

    return NextResponse.json({ message: "Team deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }
}
