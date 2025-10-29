import { type NextRequest, NextResponse } from "next/server";
import {
  createWorkflowState,
  deleteWorkflowState,
  getWorkflowStates,
  updateWorkflowState,
} from "@/lib/api/labels";
import type { CreateWorkflowStateData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const states = await getWorkflowStates(teamId);
    return NextResponse.json(states);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch workflow states" },
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

    const stateData: CreateWorkflowStateData = {
      name: body.name,
      type: body.type,
      color: body.color || "#64748b",
      position: body.position || 0,
    };

    const state = await createWorkflowState(teamId, stateData);
    return NextResponse.json(state, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create workflow state" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; stateId: string }> }
) {
  try {
    const { teamId, stateId } = await params;
    const body = await request.json();

    const updateData: Partial<CreateWorkflowStateData> = {
      name: body.name,
      type: body.type,
      color: body.color,
      position: body.position,
    };

    const state = await updateWorkflowState(teamId, stateId, updateData);
    return NextResponse.json(state);
  } catch {
    return NextResponse.json(
      { error: "Failed to update workflow state" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; stateId: string }> }
) {
  try {
    const { teamId, stateId } = await params;
    await deleteWorkflowState(teamId, stateId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete workflow state" },
      { status: 500 }
    );
  }
}
