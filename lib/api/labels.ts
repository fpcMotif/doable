/**
 * Labels & Workflow States API - Server-side helpers using Convex
 */

import type { Id } from "@/convex/_generated/dataModel";
import { api, getConvexClient } from "@/lib/convex";
import type { CreateLabelData, CreateWorkflowStateData } from "@/lib/types";

// Workflow States
export async function getWorkflowStates(teamId: string) {
  const convex = getConvexClient();

  return await convex.query(api.workflowStates.listStates, {
    teamId: teamId as Id<"teams">,
  });
}

export async function createWorkflowState(
  teamId: string,
  data: CreateWorkflowStateData
) {
  const convex = getConvexClient();

  return await convex.mutation(api.workflowStates.createState, {
    teamId: teamId as Id<"teams">,
    ...data,
  });
}

export async function updateWorkflowState(
  teamId: string,
  stateId: string,
  data: Partial<CreateWorkflowStateData>
) {
  const convex = getConvexClient();

  return await convex.mutation(api.workflowStates.updateState, {
    stateId: stateId as Id<"workflowStates">,
    name: data.name,
    color: data.color,
    type: data.type,
    position: data.position,
  });
}

export async function deleteWorkflowState(teamId: string, stateId: string) {
  const convex = getConvexClient();

  return await convex.mutation(api.workflowStates.deleteState, {
    stateId: stateId as Id<"workflowStates">,
  });
}

// Labels
export async function getLabels(teamId: string) {
  const convex = getConvexClient();

  return await convex.query(api.labels.listLabels, {
    teamId: teamId as Id<"teams">,
  });
}

export async function createLabel(teamId: string, data: CreateLabelData) {
  const convex = getConvexClient();

  return await convex.mutation(api.labels.createLabel, {
    teamId: teamId as Id<"teams">,
    ...data,
  });
}

export async function updateLabel(
  teamId: string,
  labelId: string,
  data: Partial<CreateLabelData>
) {
  const convex = getConvexClient();

  return await convex.mutation(api.labels.updateLabel, {
    labelId: labelId as Id<"labels">,
    name: data.name,
    color: data.color,
    description: data.description,
  });
}

export async function deleteLabel(teamId: string, labelId: string) {
  const convex = getConvexClient();

  return await convex.mutation(api.labels.deleteLabel, {
    labelId: labelId as Id<"labels">,
  });
}
