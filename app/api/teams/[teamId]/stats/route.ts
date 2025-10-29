import { type NextRequest, NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import { getUserId } from "@/lib/auth-server-helpers";
import { api, getConvexClient } from "@/lib/convex";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    await getUserId(); // Ensure user is authenticated

    const convex = getConvexClient();

    // Get all issues with their workflow states to determine completion
    const allIssues = await convex.query(api.issues.listIssues, {
      teamId: teamId as Id<"teams">,
      filters: {},
      sort: { field: "createdAt", direction: "desc" },
    });

    // Get other data in parallel
    const [members, projects, labels, workflowStates] = await Promise.all([
      // Team members
      convex.query(api.teamMembers.listMembers, {
        teamId: teamId as Id<"teams">,
      }),

      // Projects
      convex.query(api.projects.listProjects, {
        teamId: teamId as Id<"teams">,
      }),

      // Labels
      convex.query(api.labels.listLabels, { teamId: teamId as Id<"teams"> }),

      // Workflow states
      convex.query(api.workflowStates.listStates, {
        teamId: teamId as Id<"teams">,
      }),
    ]);

    // Calculate completed issues based on workflow state type
    const completedStateIds = new Set(
      workflowStates.filter((s) => s.type === "completed").map((s) => s._id)
    );

    const issues = allIssues.length;
    const completedIssues = allIssues.filter((issue) =>
      completedStateIds.has(issue.workflowStateId)
    ).length;

    // Get recent issues (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentIssues = allIssues
      .filter((issue) => issue._creationTime >= sevenDaysAgo)
      .slice(0, 5)
      .map((issue) => ({
        id: issue._id,
        title: issue.title,
        createdAt: issue._creationTime,
      }));

    // Calculate completion rate
    const completionRate =
      issues > 0 ? Math.round((completedIssues / issues) * 100) : 0;

    // Issues by priority
    const issuesByPriority = allIssues.reduce(
      (acc, issue) => {
        acc[issue.priority] = (acc[issue.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Issues by status (workflow state)
    const statusCounts = allIssues.reduce(
      (acc, issue) => {
        const state = workflowStates.find(
          (s) => s._id === issue.workflowStateId
        );
        if (state) {
          acc[state.name] = (acc[state.name] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Count active projects
    const activeProjects = projects.filter((p) => p.status === "active").length;

    return NextResponse.json({
      stats: {
        members: members.length,
        projects: activeProjects,
        totalIssues: issues,
        completedIssues,
        completionRate,
        labels: labels.length,
      },
      priorityBreakdown: Object.entries(issuesByPriority).map(
        ([priority, count]) => ({
          priority,
          count: count as number,
        })
      ),
      statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      })),
      recentIssues,
    });
  } catch (error) {
    console.error("Error fetching team stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch team statistics" },
      { status: 500 }
    );
  }
}
