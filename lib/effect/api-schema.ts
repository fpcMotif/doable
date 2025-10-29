/**
 * Effect HttpApi Schema
 * Defines type-safe API contracts corresponding to Convex endpoints
 */

import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema as S } from "@effect/schema";

// ============================================================================
// Schema Definitions
// ============================================================================

export class WorkflowState extends S.Class<WorkflowState>("WorkflowState")({
  _id: S.String,
  _creationTime: S.Number,
  name: S.String,
  type: S.String,
  color: S.String,
  position: S.Number,
  teamId: S.String,
}) {}

export class Project extends S.Class<Project>("Project")({
  _id: S.String,
  _creationTime: S.Number,
  name: S.String,
  description: S.optional(S.String),
  key: S.String,
  color: S.String,
  icon: S.optional(S.String),
  status: S.String,
  teamId: S.String,
  leadId: S.optional(S.String),
  lead: S.optional(S.String),
}) {}

export class Label extends S.Class<Label>("Label")({
  _id: S.String,
  _creationTime: S.Number,
  name: S.String,
  color: S.String,
  teamId: S.String,
}) {}

export class Issue extends S.Class<Issue>("Issue")({
  _id: S.String,
  _creationTime: S.Number,
  title: S.String,
  description: S.optional(S.String),
  number: S.Number,
  priority: S.String,
  estimate: S.optional(S.Number),
  completedAt: S.optional(S.Number),
  teamId: S.String,
  projectId: S.optional(S.String),
  workflowStateId: S.String,
  assigneeId: S.optional(S.String),
  assignee: S.optional(S.String),
  creatorId: S.String,
  creator: S.String,
}) {}

export class Team extends S.Class<Team>("Team")({
  _id: S.String,
  _creationTime: S.Number,
  name: S.String,
  key: S.String,
  groqApiKey: S.optional(S.String),
  role: S.optional(S.String),
}) {}

export class TeamStats extends S.Class<TeamStats>("TeamStats")({
  totalIssues: S.Number,
  completedIssues: S.Number,
  activeIssues: S.Number,
  totalProjects: S.Number,
  totalMembers: S.Number,
}) {}

// ============================================================================
// Issue Filters & Sort
// ============================================================================

const IssueFiltersSchema = S.Struct({
  status: S.optional(S.Array(S.String)),
  assignee: S.optional(S.Array(S.String)),
  project: S.optional(S.Array(S.String)),
  priority: S.optional(S.Array(S.String)),
  label: S.optional(S.Array(S.String)),
  search: S.optional(S.String),
});

const IssueSortSchema = S.Struct({
  field: S.String,
  direction: S.Literal("asc", "desc"),
});

// ============================================================================
// API Groups
// ============================================================================

/**
 * Teams API Group
 */
export class TeamsApi extends HttpApiGroup.make("teams")
  .add(
    HttpApiEndpoint.get("getUserTeams", "/api/teams").setSuccess(
      S.Struct({ teams: S.Array(Team) })
    )
  )
  .add(
    HttpApiEndpoint.get("getTeam", "/api/teams/:teamId").setSuccess(
      S.Struct({ team: Team })
    )
  )
  .add(
    HttpApiEndpoint.post("createTeam", "/api/teams")
      .setPayload(
        S.Struct({
          name: S.String,
          key: S.String,
        })
      )
      .setSuccess(S.Struct({ teamId: S.String }))
  )
  .add(
    HttpApiEndpoint.get("getTeamStats", "/api/teams/:teamId/stats").setSuccess(
      TeamStats
    )
  ) {}

/**
 * Issues API Group
 */
export class IssuesApi extends HttpApiGroup.make("issues")
  .add(
    HttpApiEndpoint.post("listIssues", "/api/teams/:teamId/issues")
      .setPayload(
        S.Struct({
          filters: S.optional(IssueFiltersSchema),
          sort: S.optional(IssueSortSchema),
        })
      )
      .setSuccess(S.Struct({ issues: S.Array(Issue) }))
  )
  .add(
    HttpApiEndpoint.get(
      "getIssue",
      "/api/teams/:teamId/issues/:issueId"
    ).setSuccess(S.Struct({ issue: Issue }))
  )
  .add(
    HttpApiEndpoint.post("createIssue", "/api/teams/:teamId/issues")
      .setPayload(
        S.Struct({
          title: S.String,
          description: S.optional(S.String),
          priority: S.String,
          workflowStateId: S.String,
          projectId: S.optional(S.String),
          assigneeId: S.optional(S.String),
          assignee: S.optional(S.String),
          estimate: S.optional(S.Number),
        })
      )
      .setSuccess(S.Struct({ issueId: S.String }))
  )
  .add(
    HttpApiEndpoint.patch("updateIssue", "/api/teams/:teamId/issues/:issueId")
      .setPayload(
        S.Struct({
          title: S.optional(S.String),
          description: S.optional(S.String),
          priority: S.optional(S.String),
          workflowStateId: S.optional(S.String),
          projectId: S.optional(S.String),
          assigneeId: S.optional(S.String),
          assignee: S.optional(S.String),
          estimate: S.optional(S.Number),
        })
      )
      .setSuccess(S.Struct({ success: S.Boolean }))
  )
  .add(
    HttpApiEndpoint.delete(
      "deleteIssue",
      "/api/teams/:teamId/issues/:issueId"
    ).setSuccess(S.Struct({ success: S.Boolean }))
  ) {}

/**
 * Projects API Group
 */
export class ProjectsApi extends HttpApiGroup.make("projects")
  .add(
    HttpApiEndpoint.get(
      "listProjects",
      "/api/teams/:teamId/projects"
    ).setSuccess(S.Struct({ projects: S.Array(Project) }))
  )
  .add(
    HttpApiEndpoint.get(
      "getProject",
      "/api/teams/:teamId/projects/:projectId"
    ).setSuccess(S.Struct({ project: Project }))
  ) {}

/**
 * Labels API Group
 */
export class LabelsApi extends HttpApiGroup.make("labels").add(
  HttpApiEndpoint.get("listLabels", "/api/teams/:teamId/labels").setSuccess(
    S.Struct({ labels: S.Array(Label) })
  )
) {}

/**
 * Workflow States API Group
 */
export class WorkflowStatesApi extends HttpApiGroup.make("workflowStates").add(
  HttpApiEndpoint.get(
    "listWorkflowStates",
    "/api/teams/:teamId/workflow-states"
  ).setSuccess(S.Struct({ workflowStates: S.Array(WorkflowState) }))
) {}

// ============================================================================
// Main App API
// ============================================================================

export class AppApi extends HttpApi.empty
  .add(TeamsApi)
  .add(IssuesApi)
  .add(ProjectsApi)
  .add(LabelsApi)
  .add(WorkflowStatesApi) {}
