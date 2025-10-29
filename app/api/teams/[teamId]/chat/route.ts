import { createGroq } from "@ai-sdk/groq";
import {
  convertToModelMessages,
  isToolUIPart,
  stepCountIs,
  streamText,
  tool,
} from "ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import * as z from "zod";
import {
  getTeamContext,
  saveChatMessages,
  updateConversationTitle,
} from "@/lib/api/chat";
import {
  createIssue,
  deleteIssue,
  getIssueById,
  getIssues,
  updateIssue,
} from "@/lib/api/issues";
import { createProject, updateProject } from "@/lib/api/projects";
import { getUser, getUserId } from "@/lib/auth-server-helpers";
import { db } from "@/lib/db";
import { sendInvitationEmail } from "@/lib/email";

export const maxDuration = 30;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const {
      messages,
      conversationId,
      apiKey: clientApiKey,
    } = await request.json();

    const userId = await getUserId();
    const user = await getUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get team context
    const teamContext = await getTeamContext(teamId);

    // Get API key (from client localStorage or environment variable)
    const apiKey = clientApiKey || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "No Groq API key configured. Please add your API key." },
        { status: 400 }
      );
    }

    // Get first workflow state for defaults
    const defaultWorkflowState = teamContext.workflowStates[0];

    // Build system prompt from team context
    const systemPrompt = `You are a helpful AI assistant for a project management system.
Your role is to help users manage their tasks, projects, and team members through natural conversation.

## Current Team Context

Available Projects: ${teamContext.projects.map((p) => `${p.name} (${p.key})`).join(", ") || "None"}
Workflow States: ${teamContext.workflowStates.map((s) => s.name).join(", ")}
Available Labels: ${teamContext.labels.map((l) => l.name).join(", ")}
Team Members: ${teamContext.members.map((m) => m.userName).join(", ") || "None"}

When user asks to see issues or lists tasks, ALWAYS call the listIssues tool WITHOUT a limit parameter to get ALL issues. 
Display the results as a bullet list with clear formatting.
When user provides minimal information, ask ONE follow-up question at a time.
Always use the provided tools for actions.`;

    // Load conversation from DB if conversationId provided
    const conversationMessages = [];
    if (conversationId) {
      const conversation = await db.chatConversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      if (conversation?.messages) {
        conversationMessages.push(
          ...conversation.messages.map((m) => ({
            role: m.role,
            content: m.content,
          }))
        );
      }

      // Auto-generate title from first user message if not set
      if (!conversation?.title && messages[0]?.content) {
        const title = messages[0].content.slice(0, 50);
        await updateConversationTitle(conversationId, title);
      }
    }

    // Define tools for the AI
    const tools = {
      createIssue: tool({
        description:
          'Create a new issue. You can use workflow state names (like "Todo", "In Progress", "Done") and they will be automatically matched to IDs. Same for project names and assignee names.',
        inputSchema: z.object({
          title: z.string().describe("The title of the issue"),
          description: z
            .string()
            .optional()
            .describe("A detailed description of the issue"),
          projectId: z
            .string()
            .optional()
            .describe(
              'The project ID, key, or name (e.g., "testing" or project name) this issue belongs to'
            ),
          workflowStateId: z
            .string()
            .describe(
              'The workflow state ID or name (e.g., "Todo", "In Progress", "Done")'
            ),
          assigneeId: z
            .string()
            .optional()
            .describe(
              'The user ID or name (e.g., "kartik") to assign this issue to'
            ),
          priority: z
            .enum(["none", "low", "medium", "high", "urgent"])
            .optional()
            .default("none"),
          estimate: z
            .number()
            .optional()
            .describe("Story points or hours estimate"),
          labelIds: z
            .array(z.string())
            .optional()
            .describe("Array of label IDs"),
        }),
        execute: async ({
          title,
          description,
          projectId,
          workflowStateId,
          assigneeId,
          priority,
          estimate,
          labelIds,
        }) => {
          try {
            // Resolve workflow state by name or ID
            let resolvedWorkflowStateId = workflowStateId;
            const workflowState = teamContext.workflowStates.find(
              (ws) =>
                ws.id === workflowStateId ||
                ws.name.toLowerCase() === workflowStateId.toLowerCase()
            );
            if (workflowState) {
              resolvedWorkflowStateId = workflowState.id;
            }

            // Resolve project by key, name, or ID
            let resolvedProjectId = projectId;
            if (projectId) {
              const project = teamContext.projects.find(
                (p) =>
                  p.id === projectId ||
                  p.key.toLowerCase() === projectId.toLowerCase() ||
                  p.name.toLowerCase() === projectId.toLowerCase()
              );
              if (project) {
                resolvedProjectId = project.id;
              }
            }

            // Resolve assignee by name or ID
            let resolvedAssigneeId = assigneeId;
            if (assigneeId) {
              const member = teamContext.members.find(
                (m) =>
                  m.userId === assigneeId ||
                  m.userName.toLowerCase() === assigneeId.toLowerCase()
              );
              if (member) {
                resolvedAssigneeId = member.userId;
              }
            }

            const issue = await createIssue(
              teamId,
              {
                title,
                description,
                projectId: resolvedProjectId,
                workflowStateId: resolvedWorkflowStateId,
                assigneeId: resolvedAssigneeId,
                priority,
                estimate,
                labelIds,
              },
              userId,
              user.name || user.email || "Unknown"
            );

            if (!issue) {
              return { success: false, error: "Failed to create issue" };
            }

            return {
              success: true,
              issue: {
                id: issue.id,
                title: issue.title,
                number: issue.number,
                description: issue.description,
                priority: issue.priority,
              },
              message: `Issue #${issue.number} "${issue.title}" has been created successfully.`,
            };
          } catch (error: unknown) {
            return {
              success: false,
              error: error.message || "Failed to create issue",
            };
          }
        },
      }),

      updateIssue: tool({
        description:
          'Update an existing issue by title or ID. Use workflow state names (like "Todo", "Backlog", "In Progress", "Done") and assignee names.',
        inputSchema: z.object({
          issueId: z
            .string()
            .optional()
            .describe("The ID of the issue to update"),
          title: z
            .string()
            .optional()
            .describe(
              "The title of the issue to find (if issueId not provided)"
            ),
          newTitle: z.string().optional(),
          description: z.string().optional(),
          workflowStateId: z
            .string()
            .optional()
            .describe(
              'The new workflow state ID or name (e.g., "Todo", "Backlog", "In Progress", "Done")'
            ),
          assigneeId: z
            .string()
            .optional()
            .describe("The user ID or name to assign this issue to"),
          priority: z
            .enum(["none", "low", "medium", "high", "urgent"])
            .optional(),
          estimate: z.number().optional(),
          labelIds: z.array(z.string()).optional(),
        }),
        execute: async ({
          issueId,
          title,
          newTitle,
          description,
          workflowStateId,
          assigneeId,
          priority,
          estimate,
          labelIds,
        }) => {
          try {
            let resolvedIssueId = issueId;

            // If title is provided, find the issue by title
            if (title && !issueId) {
              const issues = await getIssues(teamId);
              const matchingIssues = issues.filter((issue) =>
                issue.title.toLowerCase().includes(title.toLowerCase())
              );

              if (matchingIssues.length === 0) {
                return {
                  success: false,
                  error: `No issue found with title "${title}"`,
                };
              }

              if (matchingIssues.length > 1) {
                return {
                  success: false,
                  error: `Multiple issues found matching "${title}": ${matchingIssues.map((i) => `#${i.number} "${i.title}"`).join(", ")}. Please be more specific.`,
                };
              }

              resolvedIssueId = matchingIssues[0].id;
            }

            if (!resolvedIssueId) {
              return {
                success: false,
                error: "Either issueId or title must be provided",
              };
            }

            // Resolve workflow state by name or ID
            let resolvedWorkflowStateId = workflowStateId;
            if (workflowStateId) {
              const workflowState = teamContext.workflowStates.find(
                (ws) =>
                  ws.id === workflowStateId ||
                  ws.name.toLowerCase() === workflowStateId.toLowerCase()
              );
              if (workflowState) {
                resolvedWorkflowStateId = workflowState.id;
              }
            }

            // Resolve assignee by name or ID
            let resolvedAssigneeId = assigneeId;
            if (assigneeId) {
              const member = teamContext.members.find(
                (m) =>
                  m.userId === assigneeId ||
                  m.userName.toLowerCase() === assigneeId.toLowerCase()
              );
              if (member) {
                resolvedAssigneeId = member.userId;
              }
            }

            const issue = await updateIssue(teamId, resolvedIssueId, {
              ...(newTitle && { title: newTitle }),
              ...(description !== undefined && { description }),
              ...(resolvedWorkflowStateId && {
                workflowStateId: resolvedWorkflowStateId,
              }),
              ...(resolvedAssigneeId !== undefined && {
                assigneeId: resolvedAssigneeId,
              }),
              ...(priority && { priority }),
              ...(estimate && { estimate }),
              ...(labelIds && { labelIds }),
            });

            if (!issue) {
              return { success: false, error: "Issue not found" };
            }

            return {
              success: true,
              issue: {
                id: issue.id,
                title: issue.title,
                number: issue.number,
              },
              message: `Issue #${issue.number} "${issue.title}" has been updated successfully.`,
            };
          } catch (error: unknown) {
            return {
              success: false,
              error: error.message || "Failed to update issue",
            };
          }
        },
      }),

      listIssues: tool({
        description:
          "Get a list of ALL issues for the team. Returns all issues by default unless a specific limit is requested. Use this to get a complete overview of all tasks.",
        inputSchema: z.object({
          limit: z
            .number()
            .nullable()
            .optional()
            .describe(
              "Maximum number of issues to return (omit to get all issues)"
            ),
        }),
        execute: async ({ limit }) => {
          try {
            const issues = await getIssues(teamId);
            const limited = limit ? issues.slice(0, limit) : issues;

            return {
              success: true,
              issues: limited.map((issue) => ({
                id: issue.id,
                number: issue.number,
                title: issue.title,
                description: issue.description,
                priority: issue.priority,
                assignee: issue.assignee,
                project: issue.project,
                workflowState: issue.workflowState.name,
              })),
              count: limited.length,
              total: issues.length,
              message:
                limited.length === issues.length
                  ? `Found all ${issues.length} issues`
                  : `Showing ${limited.length} of ${issues.length} total issues`,
            };
          } catch (error: unknown) {
            return {
              success: false,
              error: error.message || "Failed to list issues",
            };
          }
        },
      }),

      getIssue: tool({
        description: "Get details of a specific issue by ID",
        inputSchema: z.object({
          issueId: z.string().describe("The ID of the issue"),
        }),
        execute: async ({ issueId }) => {
          try {
            const issue = await getIssueById(teamId, issueId);
            if (!issue) {
              return { success: false, error: "Issue not found" };
            }

            return {
              success: true,
              issue: {
                id: issue.id,
                number: issue.number,
                title: issue.title,
                description: issue.description,
                priority: issue.priority,
                assignee: issue.assignee,
                project: issue.project,
                workflowState: issue.workflowState.name,
                labels: issue.labels.map((l) => l.label.name),
              },
            };
          } catch (error: unknown) {
            return {
              success: false,
              error: error.message || "Failed to get issue",
            };
          }
        },
      }),

      deleteIssue: tool({
        description:
          "Delete an issue by its title or ID. If title is provided, it will search for matching issues.",
        inputSchema: z.object({
          title: z
            .string()
            .optional()
            .describe("The title of the issue to delete"),
          issueId: z
            .string()
            .optional()
            .describe("The ID of the issue to delete"),
        }),
        execute: async ({ title, issueId }) => {
          try {
            // If title is provided, search for matching issues
            if (title && !issueId) {
              const issues = await getIssues(teamId);
              const matchingIssues = issues.filter((issue) =>
                issue.title.toLowerCase().includes(title.toLowerCase())
              );

              if (matchingIssues.length === 0) {
                return {
                  success: false,
                  error: `No issue found with title "${title}"`,
                };
              }

              if (matchingIssues.length > 1) {
                return {
                  success: false,
                  error: `Multiple issues found matching "${title}": ${matchingIssues.map((i) => `#${i.number} "${i.title}"`).join(", ")}. Please be more specific.`,
                  matches: matchingIssues.map((i) => ({
                    id: i.id,
                    title: i.title,
                    number: i.number,
                  })),
                };
              }

              issueId = matchingIssues[0].id;
            }

            if (!issueId) {
              return {
                success: false,
                error: "Either title or issueId must be provided",
              };
            }

            const issue = await getIssueById(teamId, issueId);
            if (!issue) {
              return { success: false, error: "Issue not found" };
            }

            await deleteIssue(teamId, issueId);

            return {
              success: true,
              message: `Issue #${issue.number} "${issue.title}" has been deleted successfully.`,
            };
          } catch (error: unknown) {
            return {
              success: false,
              error: error.message || "Failed to delete issue",
            };
          }
        },
      }),

      createProject: tool({
        description:
          'Create a new project. The color parameter is optional and defaults to #6366f1 if not provided. The status parameter is optional and defaults to "active" if not provided.',
        inputSchema: z.object({
          name: z.string().describe("The name of the project"),
          description: z.string().optional(),
          key: z.string().describe("A 3-letter project identifier"),
          color: z.string().optional(),
          icon: z.string().optional(),
          leadId: z.string().optional(),
          status: z
            .enum(["active", "completed", "canceled"])
            .optional()
            .describe(
              "The status of the project (active, completed, or canceled)"
            ),
        }),
        execute: async ({
          name,
          description,
          key,
          color,
          icon,
          leadId,
          status,
        }) => {
          try {
            // Default color if not provided
            const projectColor = color || "#6366f1";
            // Default status if not provided
            const projectStatus = status || "active";

            const project = await createProject(teamId, {
              name,
              description,
              key,
              color: projectColor,
              icon,
              leadId,
              status: projectStatus,
              lead: leadId
                ? teamContext.members.find((m) => m.userId === leadId)?.userName
                : undefined,
            });

            return {
              success: true,
              project: {
                id: project.id,
                name: project.name,
                key: project.key,
                description: project.description,
              },
              message: `Project "${project.name}" has been created successfully.`,
            };
          } catch (error: unknown) {
            return {
              success: false,
              error: error.message || "Failed to create project",
            };
          }
        },
      }),

      listProjects: tool({
        description: "Get all projects for the team",
        inputSchema: z.object({}).passthrough(),
        execute: async () => {
          try {
            const projects = teamContext.projects;
            return {
              success: true,
              projects: projects.map((p) => ({
                id: p.id,
                name: p.name,
                key: p.key,
                description: p.description,
                status: p.status,
                issueCount: p._count.issues,
              })),
            };
          } catch (error: unknown) {
            return {
              success: false,
              error: error.message || "Failed to list projects",
            };
          }
        },
      }),

      updateProject: tool({
        description:
          "Update an existing project by name or ID. You can update properties like status, name, description, color, icon, or lead.",
        inputSchema: z.object({
          projectId: z
            .string()
            .optional()
            .describe("The ID of the project to update"),
          name: z
            .string()
            .optional()
            .describe(
              "The name of the project to find (if projectId not provided)"
            ),
          newName: z.string().optional(),
          description: z.string().optional(),
          status: z
            .enum(["active", "completed", "canceled"])
            .optional()
            .describe(
              "The new status of the project (active, completed, or canceled)"
            ),
          color: z.string().optional(),
          icon: z.string().optional(),
          leadId: z.string().optional(),
        }),
        execute: async ({
          projectId,
          name,
          newName,
          description,
          status,
          color,
          icon,
          leadId,
        }) => {
          try {
            let resolvedProjectId = projectId;

            // If name is provided, find the project by name
            if (name && !projectId) {
              const projects = teamContext.projects;
              const matchingProjects = projects.filter((project) =>
                project.name.toLowerCase().includes(name.toLowerCase())
              );

              if (matchingProjects.length === 0) {
                return {
                  success: false,
                  error: `No project found with name "${name}"`,
                };
              }

              if (matchingProjects.length > 1) {
                return {
                  success: false,
                  error: `Multiple projects found matching "${name}": ${matchingProjects.map((p) => `${p.name} (${p.key})`).join(", ")}. Please be more specific.`,
                };
              }

              resolvedProjectId = matchingProjects[0].id;
            }

            if (!resolvedProjectId) {
              return {
                success: false,
                error: "Either projectId or name must be provided",
              };
            }

            const project = await updateProject(teamId, resolvedProjectId, {
              ...(newName && { name: newName }),
              ...(description !== undefined && { description }),
              ...(status && { status }),
              ...(color && { color }),
              ...(icon && { icon }),
              ...(leadId !== undefined && {
                leadId,
                lead: leadId
                  ? teamContext.members.find((m) => m.userId === leadId)
                      ?.userName
                  : undefined,
              }),
            });

            if (!project) {
              return { success: false, error: "Project not found" };
            }

            return {
              success: true,
              project: {
                id: project.id,
                name: project.name,
                key: project.key,
                status: project.status,
              },
              message: `Project "${project.name}" has been updated successfully.`,
            };
          } catch (error: unknown) {
            return {
              success: false,
              error: error.message || "Failed to update project",
            };
          }
        },
      }),

      inviteTeamMember: tool({
        description: "Invite a new team member via email",
        inputSchema: z.object({
          email: z.string().min(5).describe("The email address to invite"),
          role: z
            .string()
            .optional()
            .default("developer")
            .describe("The role for the member (developer, admin, viewer)"),
        }),
        execute: async ({ email, role }) => {
          try {
            // Check if invitation already exists
            const existingInvitation = await db.invitation.findUnique({
              where: {
                teamId_email: { teamId, email },
              },
            });

            if (existingInvitation?.status === "pending") {
              return {
                success: false,
                error: "Invitation already sent to this email",
              };
            }

            // Create invitation
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const invitation = await db.invitation.create({
              data: {
                teamId,
                email,
                role,
                invitedBy: userId,
                status: "pending",
                expiresAt,
              },
            });

            // Send email
            const team = await db.team.findUnique({ where: { id: teamId } });
            const inviterName = user.name || user.email || "Someone";

            if (process.env.RESEND_API_KEY) {
              try {
                await sendInvitationEmail({
                  email,
                  teamName: team?.name || "the team",
                  inviterName,
                  role: role || "developer",
                  inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL}/invite/${invitation.id}`,
                });
              } catch (emailError) {
                console.error("Error sending invitation email:", emailError);
              }
            }

            return {
              success: true,
              message: `Invitation sent to ${email}`,
            };
          } catch (error: unknown) {
            return {
              success: false,
              error: error.message || "Failed to invite team member",
            };
          }
        },
      }),

      listTeamMembers: tool({
        description: "Get all team members",
        inputSchema: z.object({}).passthrough(),
        execute: async () => {
          try {
            return {
              success: true,
              members: teamContext.members.map((m) => ({
                userId: m.userId,
                name: m.userName,
                email: m.userEmail,
                role: m.role,
              })),
            };
          } catch (error: unknown) {
            return {
              success: false,
              error: error.message || "Failed to list team members",
            };
          }
        },
      }),

      getTeamStats: tool({
        description: "Get team statistics and summary",
        inputSchema: z.object({}).passthrough(),
        execute: async () => {
          try {
            const [issueCount, projectCount, memberCount] = await Promise.all([
              db.issue.count({ where: { teamId } }),
              db.project.count({ where: { teamId } }),
              db.teamMember.count({ where: { teamId } }),
            ]);

            return {
              success: true,
              stats: {
                issues: issueCount,
                projects: projectCount,
                members: memberCount,
              },
            };
          } catch (error: unknown) {
            return {
              success: false,
              error: error.message || "Failed to get team stats",
            };
          }
        },
      }),
    };

    // Convert UIMessages to ModelMessages
    const modelMessages = convertToModelMessages([
      ...conversationMessages,
      ...messages,
    ]);

    // Create Groq provider with API key
    const groq = createGroq({
      apiKey: apiKey,
    });

    // Stream the response
    const result = streamText({
      model: groq("openai/gpt-oss-20b"),
      system: systemPrompt,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(5), // Allow multi-step tool calls
    });

    return result.toUIMessageStreamResponse({
      onFinish: async ({ messages: finalMessages }) => {
        // Save messages to database
        if (conversationId && finalMessages) {
          try {
            // Verify conversation exists before trying to save messages
            const conversation = await db.chatConversation.findUnique({
              where: { id: conversationId },
            });

            if (conversation) {
              await saveChatMessages({
                conversationId,
                messages: finalMessages.map((msg) => {
                  // Extract text content from parts array
                  const textContent = msg.parts
                    .filter((part) => part.type === "text")
                    .map((part) => part.text)
                    .join(" ");

                  // Extract tool calls from parts
                  const toolCalls = msg.parts
                    .filter((part) => isToolUIPart(part))
                    .map((part) => part);

                  return {
                    role: msg.role,
                    content: textContent || "",
                    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                  };
                }),
              });
            }
          } catch (error) {
            console.error("Error saving chat messages:", error);
            // Don't throw - we don't want to fail the response
          }
        }
      },
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
