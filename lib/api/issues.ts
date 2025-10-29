/**
 * Issues API - Server-side helpers using Convex
 */

import type { Id } from "@/convex/_generated/dataModel";
import { api, getConvexClient } from "@/lib/convex";
import type {
  CreateIssueData,
  IssueFilters,
  IssueSort,
  UpdateIssueData,
} from "@/lib/types";

export async function getIssues(
  teamId: string,
  filters: IssueFilters = {},
  sort: IssueSort = { field: "createdAt", direction: "desc" }
) {
  const convex = getConvexClient();

  return await convex.query(api.issues.listIssues, {
    teamId: teamId as Id<"teams">,
    filters,
    sort,
  });
}

export async function getIssueById(teamId: string, issueId: string) {
  const convex = getConvexClient();

  return await convex.query(api.issues.getIssueById, {
    teamId: teamId as Id<"teams">,
    issueId: issueId as Id<"issues">,
  });
}

export async function createIssue(
  teamId: string,
  data: CreateIssueData,
  creatorId: string,
  creatorName: string
) {
  const convex = getConvexClient();

  return await convex.mutation(api.issues.createIssue, {
    teamId: teamId as Id<"teams">,
    title: data.title,
    description: data.description,
    projectId: data.projectId as Id<"projects"> | undefined,
    workflowStateId: data.workflowStateId as Id<"workflowStates">,
    assigneeId: data.assigneeId,
    assignee: data.assignee,
    priority: data.priority || "none",
    estimate: data.estimate,
    labelIds: data.labelIds as Id<"labels">[] | undefined,
    creatorId,
    creator: creatorName,
  });
}

export async function updateIssue(
  teamId: string,
  issueId: string,
  data: UpdateIssueData
) {
  const convex = getConvexClient();

  return await convex.mutation(api.issues.updateIssue, {
    teamId: teamId as Id<"teams">,
    issueId: issueId as Id<"issues">,
    title: data.title,
    description: data.description,
    projectId:
      data.projectId === ""
        ? undefined
        : (data.projectId as Id<"projects"> | undefined),
    workflowStateId: data.workflowStateId as Id<"workflowStates"> | undefined,
    assigneeId: data.assigneeId,
    assignee: data.assignee,
    priority: data.priority,
    estimate: data.estimate,
    labelIds: data.labelIds as Id<"labels">[] | undefined,
    completedAt: data.completedAt,
  });
}

export async function deleteIssue(teamId: string, issueId: string) {
  const convex = getConvexClient();

  return await convex.mutation(api.issues.deleteIssue, {
    teamId: teamId as Id<"teams">,
    issueId: issueId as Id<"issues">,
  });
}

export async function getIssueStats(teamId: string) {
  const convex = getConvexClient();

  return await convex.query(api.issues.getIssueStats, {
    teamId: teamId as Id<"teams">,
  });
}
