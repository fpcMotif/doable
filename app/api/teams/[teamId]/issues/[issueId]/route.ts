import { type NextRequest, NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { deleteIssue, getIssueById, updateIssue } from "@/lib/api/issues";
import { getUser, getUserId } from "@/lib/auth-server-helpers";
import { api, getConvexClient } from "@/lib/convex";
import type { UpdateIssueData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; issueId: string }> }
) {
  try {
    const { teamId, issueId } = await params;
    const issue = await getIssueById(teamId, issueId);

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Error fetching issue:", error);
    return NextResponse.json(
      { error: "Failed to fetch issue" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; issueId: string }> }
) {
  try {
    const { teamId, issueId } = await params;
    const body = await request.json();

    // Get current user info (parallel calls for speed)
    const [authResult, userResult] = await Promise.all([
      getUserId(),
      getUser(),
    ]);

    const userId = authResult;
    const user = userResult;

    // Look up assignee name from TeamMember if assigneeId is being updated
    let assigneeName: string | null = null;
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
        const userName = user.name || user.email || "Unknown";
        assigneeName = userName;
      }
    }

    const updateData: UpdateIssueData = {
      title: body.title,
      description: body.description,
      projectId: body.projectId,
      workflowStateId: body.workflowStateId,
      assigneeId: body.assigneeId === "unassigned" ? null : body.assigneeId,
      assignee: assigneeName,
      priority: body.priority,
      estimate: body.estimate,
      labelIds: body.labelIds,
      completedAt: body.completedAt,
    };

    const updatedIssue = await updateIssue(teamId, issueId, updateData);
    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json(
      { error: "Failed to update issue" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; issueId: string }> }
) {
  try {
    const { teamId, issueId } = await params;
    await deleteIssue(teamId, issueId);
    return NextResponse.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 }
    );
  }
}
