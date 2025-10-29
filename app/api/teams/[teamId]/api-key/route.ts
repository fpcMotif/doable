import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { getTeamSettings, updateTeamSettings } from "@/lib/api/chat";
import { getUserId } from "@/lib/auth-server-helpers";
import { api, getConvexClient } from "@/lib/convex";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a team member
    const convex = getConvexClient();
    const members = await convex.query(api.teamMembers.listMembers, {
      teamId: teamId as Id<"teams">,
    });

    const teamMember = members.find((m) => m.userId === userId);

    if (!teamMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get team with API key
    const team = await convex.query(api.teams.getTeam, {
      teamId: teamId as Id<"teams">,
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Return masked API key
    const maskedKey = team.groqApiKey
      ? `${team.groqApiKey.substring(0, 8)}...${team.groqApiKey.substring(team.groqApiKey.length - 4)}`
      : null;

    return NextResponse.json({ apiKey: maskedKey, hasKey: !!team.groqApiKey });
  } catch (error) {
    console.error("Error fetching API key:", error);
    return NextResponse.json(
      { error: "Failed to fetch API key" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const userId = await getUserId();
    const body = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a team member with admin role
    const convex = getConvexClient();
    const members = await convex.query(api.teamMembers.listMembers, {
      teamId: teamId as Id<"teams">,
    });

    const teamMember = members.find(
      (m) =>
        m.userId === userId && (m.role === "admin" || m.role === "developer")
    );

    if (!teamMember) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Validate API key format
    if (!body.apiKey || typeof body.apiKey !== "string") {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 400 }
      );
    }

    if (!body.apiKey.startsWith("gsk_")) {
      return NextResponse.json(
        { error: "Invalid Groq API key format (should start with gsk_)" },
        { status: 400 }
      );
    }

    // Update team API key
    await updateTeamSettings(teamId, { groqApiKey: body.apiKey });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json(
      { error: "Failed to update API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a team member with admin role
    const convex = getConvexClient();
    const members = await convex.query(api.teamMembers.listMembers, {
      teamId: teamId as Id<"teams">,
    });

    const teamMember = members.find(
      (m) =>
        m.userId === userId && (m.role === "admin" || m.role === "developer")
    );

    if (!teamMember) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Remove team API key
    await updateTeamSettings(teamId, { groqApiKey: null });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing API key:", error);
    return NextResponse.json(
      { error: "Failed to remove API key" },
      { status: 500 }
    );
  }
}
