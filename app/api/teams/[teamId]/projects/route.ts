import { type NextRequest, NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import {
  createProject,
  getProjectStats,
  getProjects,
} from "@/lib/api/projects";
import { getUser, getUserId } from "@/lib/auth-server-helpers";
import { api, getConvexClient } from "@/lib/convex";
import type { CreateProjectData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);

    // Check if requesting stats
    if (searchParams.get("stats") === "true") {
      const stats = await getProjectStats(teamId);
      return NextResponse.json(stats);
    }

    const projects = await getProjects(teamId);
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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

    // Get the current user from Clerk (parallel calls for speed)
    const [authResult, userResult] = await Promise.all([
      getUserId(),
      getUser(),
    ]);

    const userId = authResult;
    const user = userResult;

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user display name from Clerk
    const userName = user.name || user.email || "Unknown";

    // Look up lead name from TeamMember if leadId is provided
    let leadName: string | undefined = userName; // default to current user
    const actualLeadId = body.leadId || userId;

    if (actualLeadId) {
      const convex = getConvexClient();
      const members = await convex.query(api.teamMembers.listMembers, {
        teamId: teamId as Id<"teams">,
      });

      const teamMember = members.find((m) => m.userId === actualLeadId);

      if (teamMember) {
        leadName = teamMember.userName;
      } else if (actualLeadId === userId) {
        // Fallback to current user's name if not in team members
        leadName = userName;
      }
    }

    const projectData: CreateProjectData = {
      name: body.name,
      description: body.description,
      key: body.key,
      color: body.color || "#6366f1",
      icon: body.icon,
      leadId: actualLeadId,
      lead: leadName,
    };

    // Create project and check team in parallel
    const project = await createProject(teamId, projectData);
    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
