import { type NextRequest, NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { getUserId } from "@/lib/auth-server-helpers";
import { api, getConvexClient } from "@/lib/convex";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    // Get the current user from Better Auth
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const convex = getConvexClient();

    // Check if team already exists in Convex
    const existingTeam = await convex.query(api.teams.getTeam, {
      teamId: teamId as Id<"teams">,
    });

    if (existingTeam) {
      return NextResponse.json(existingTeam);
    }

    // Get team name from request body or default
    const body = await request.json().catch(() => ({}));
    const teamName = body.name || `Team ${teamId.substring(0, 8)}`;
    const teamKey = teamName.substring(0, 3).toUpperCase();

    // Create team in Convex
    const newTeamId = await convex.mutation(api.teams.createTeam, {
      name: teamName,
      key: teamKey,
    });

    // Create default workflow states for the team
    const defaultWorkflowStates = [
      {
        name: "Backlog",
        type: "backlog" as const,
        color: "#64748b",
        position: 0,
      },
      {
        name: "Todo",
        type: "unstarted" as const,
        color: "#3b82f6",
        position: 1,
      },
      {
        name: "In Progress",
        type: "started" as const,
        color: "#f59e0b",
        position: 2,
      },
      {
        name: "Done",
        type: "completed" as const,
        color: "#10b981",
        position: 3,
      },
    ];

    await Promise.all(
      defaultWorkflowStates.map((state) =>
        convex.mutation(api.workflowStates.createState, {
          teamId: newTeamId,
          ...state,
        })
      )
    );

    // Create default labels for the team
    const defaultLabels = [
      { name: "Bug", color: "#ef4444" },
      { name: "Feature", color: "#8b5cf6" },
      { name: "Enhancement", color: "#06b6d4" },
      { name: "Documentation", color: "#84cc16" },
    ];

    await Promise.all(
      defaultLabels.map((label) =>
        convex.mutation(api.labels.createLabel, {
          teamId: newTeamId,
          ...label,
        })
      )
    );

    // Fetch the created team
    const team = await convex.query(api.teams.getTeam, { teamId: newTeamId });

    return NextResponse.json(team, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to sync team" }, { status: 500 });
  }
}
