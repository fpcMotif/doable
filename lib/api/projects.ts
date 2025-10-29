/**
 * Projects API - Server-side helpers using Convex
 */

import type { Id } from "@/convex/_generated/dataModel";
import { api, getConvexClient } from "@/lib/convex";
import type { CreateProjectData, UpdateProjectData } from "@/lib/types";

export async function getProjects(teamId: string) {
  const convex = getConvexClient();

  return await convex.query(api.projects.listProjects, {
    teamId: teamId as Id<"teams">,
  });
}

export async function getProjectById(teamId: string, projectId: string) {
  const convex = getConvexClient();

  return await convex.query(api.projects.getProjectById, {
    teamId: teamId as Id<"teams">,
    projectId: projectId as Id<"projects">,
  });
}

export async function createProject(teamId: string, data: CreateProjectData) {
  const convex = getConvexClient();

  return await convex.mutation(api.projects.createProject, {
    teamId: teamId as Id<"teams">,
    name: data.name,
    description: data.description,
    key: data.key,
    color: data.color,
    icon: data.icon,
    status: data.status || "active",
    leadId: data.leadId,
    lead: data.lead,
  });
}

export async function updateProject(
  teamId: string,
  projectId: string,
  data: UpdateProjectData
) {
  const convex = getConvexClient();

  return await convex.mutation(api.projects.updateProject, {
    projectId: projectId as Id<"projects">,
    name: data.name,
    description: data.description,
    key: data.key,
    color: data.color,
    icon: data.icon,
    status: data.status,
    leadId: data.leadId,
    lead: data.lead,
  });
}

export async function deleteProject(teamId: string, projectId: string) {
  const convex = getConvexClient();

  return await convex.mutation(api.projects.deleteProject, {
    projectId: projectId as Id<"projects">,
  });
}

export async function getProjectStats(teamId: string) {
  const convex = getConvexClient();

  return await convex.query(api.projects.getProjectStats, {
    teamId: teamId as Id<"teams">,
  });
}
