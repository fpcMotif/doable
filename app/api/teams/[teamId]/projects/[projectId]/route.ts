import { type NextRequest, NextResponse } from "next/server";
import type { Id } from "@/convex/_generated/dataModel";
import {
  deleteProject,
  getProjectById,
  updateProject,
} from "@/lib/api/projects";
import { api, getConvexClient } from "@/lib/convex";
import type { UpdateProjectData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; projectId: string }> }
) {
  try {
    const { teamId, projectId } = await params;
    const project = await getProjectById(teamId, projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; projectId: string }> }
) {
  try {
    const { teamId, projectId } = await params;
    const body = await request.json();

    // Look up lead name from TeamMember if leadId is being updated
    let leadName: string | undefined = undefined;
    if (body.leadId) {
      const convex = getConvexClient();
      const members = await convex.query(api.teamMembers.listMembers, {
        teamId: teamId as Id<"teams">,
      });

      const teamMember = members.find((m) => m.userId === body.leadId);

      if (teamMember) {
        leadName = teamMember.userName;
      }
    }

    const updateData: UpdateProjectData = {
      name: body.name,
      description: body.description,
      key: body.key,
      color: body.color,
      icon: body.icon,
      status: body.status,
      leadId: body.leadId,
      lead: leadName,
    };

    const updatedProject = await updateProject(teamId, projectId, updateData);
    return NextResponse.json(updatedProject);
  } catch {
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; projectId: string }> }
) {
  try {
    const { teamId, projectId } = await params;
    await deleteProject(teamId, projectId);
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
