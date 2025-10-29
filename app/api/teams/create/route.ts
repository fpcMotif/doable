import { type NextRequest, NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { getUserId } from "@/lib/auth-server-helpers";
import { api, getConvexClient } from "@/lib/convex";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName } = body;

    if (!displayName) {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      );
    }

    // Get the current user from Better Auth
    await getUserId();

    // Generate unique team key
    // Use first 3 chars of name + random 3 char suffix to ensure uniqueness
    const baseKey = displayName
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, "A")
      .padEnd(3, "A");
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase();
    const teamKey = `${baseKey}${randomSuffix}`;

    // Create team via Convex
    const convex = getConvexClient();
    const teamId = await convex.mutation(api.teams.createTeam, {
      name: displayName,
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
          teamId: teamId as Id<"teams">,
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
          teamId: teamId as Id<"teams">,
          ...label,
        })
      )
    );

    // Fetch the created team
    const team = await convex.query(api.teams.getTeam, {
      teamId: teamId as Id<"teams">,
    });

    return NextResponse.json(team, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
