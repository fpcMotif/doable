import { type NextRequest, NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { createIssue, getIssueStats, getIssues } from "@/lib/api/issues";
import { getUser, getUserId } from "@/lib/auth-server-helpers";
import { api, getConvexClient } from "@/lib/convex";
import type { CreateIssueData } from "@/lib/types";

// Cache for team existence checks
const teamExistsCache = new Set<string>();

// Helper function to ensure team exists in Convex
async function ensureTeamExists(teamId: string) {
  // Check cache first
  if (teamExistsCache.has(teamId)) {
    return { id: teamId };
  }

  const convex = getConvexClient();
  const team = await convex.query(api.teams.getTeam, {
    teamId: teamId as Id<"teams">,
  });

  if (!team) {
    throw new Error("Team not found");
  }

  // Cache the team existence
  teamExistsCache.add(teamId);
  return team;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const { teamId } = await params;

    // Ensure team exists in local database
    await ensureTeamExists(teamId);

    // Parse filters from query params
    const filters = {
      status: searchParams.getAll("status"),
      assignee: searchParams.getAll("assignee"),
      project: searchParams.getAll("project"),
      label: searchParams.getAll("label"),
      priority: searchParams.getAll("priority"),
      search: searchParams.get("search") || undefined,
    };

    // Parse sort from query params
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortDirection = (searchParams.get("sortDirection") || "desc") as
      | "asc"
      | "desc";
    const sort = { field: sortField as any, direction: sortDirection };

    // Check if requesting stats
    if (searchParams.get("stats") === "true") {
      const stats = await getIssueStats(teamId);
      return NextResponse.json(stats);
    }

    const issues = await getIssues(teamId, filters, sort);
    return NextResponse.json(issues);
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const body = await request.json();

    // Get user info from Better Auth (parallel calls for speed)
    const [userId, user, teamCheck] = await Promise.all([
      getUserId(),
      getUser(),
      ensureTeamExists(teamId),
    ]);

    // Get creator name
    const creatorName = user.name || user.email || "Unknown";

    // Look up assignee name from TeamMember if assigneeId is provided
    let assigneeName: string | undefined = undefined;
    if (body.assigneeId && body.assigneeId !== "unassigned") {
      const convex = getConvexClient();
      const members = await convex.query(api.teamMembers.listMembers, {
        teamId: teamId as Id<"teams">,
      });

      const teamMember = members.find((m) => m.userId === body.assigneeId);

      if (teamMember) {
        assigneeName = teamMember.userName;
      } else if (body.assigneeId === userId) {
        // Fallback to current user's name if not in team members
        assigneeName = creatorName;
      }
    }

    const issueData: CreateIssueData = {
      title: body.title,
      description: body.description,
      projectId:
        body.projectId && body.projectId.trim() !== ""
          ? body.projectId
          : undefined,
      workflowStateId: body.workflowStateId,
      assigneeId:
        body.assigneeId === "unassigned" ? undefined : body.assigneeId,
      assignee: assigneeName,
      priority: body.priority || "none",
      estimate: body.estimate,
      labelIds: body.labelIds,
    };

    const issue = await createIssue(teamId, issueData, userId, creatorName);
    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 }
    );
  }
}
