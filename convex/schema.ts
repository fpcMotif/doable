import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Database Schema
 * Migrated from Prisma schema
 *
 * Key differences:
 * - No native relations, use v.id("tableName") for references
 * - System fields _id, _creationTime are automatically added
 * - Indexes must be explicitly defined
 */

export default defineSchema({
  // Users (Better Auth mirror)
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  // Teams
  teams: defineTable({
    name: v.string(),
    key: v.string(), // 3-letter team identifier (e.g., "ENG", "DES")
    groqApiKey: v.optional(v.string()), // Optional Groq API key for BYOK feature
  }).index("by_key", ["key"]),

  // Projects
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    key: v.string(), // 3-letter project identifier (e.g., "WEB", "API")
    color: v.string(), // Hex color, default: "#6366f1"
    icon: v.optional(v.string()), // Icon name or emoji
    status: v.string(), // active, completed, canceled
    teamId: v.id("teams"),
    leadId: v.optional(v.string()), // Convex Auth user ID
    lead: v.optional(v.string()), // User display name
  })
    .index("by_teamId", ["teamId"])
    .index("by_teamId_and_key", ["teamId", "key"]),

  // Workflow States
  workflowStates: defineTable({
    name: v.string(),
    type: v.string(), // backlog, unstarted, started, completed, canceled
    color: v.string(), // Hex color, default: "#64748b"
    position: v.number(), // Order in workflow, default: 0
    teamId: v.id("teams"),
  })
    .index("by_teamId", ["teamId"])
    .index("by_teamId_and_name", ["teamId", "name"])
    .index("by_teamId_and_position", ["teamId", "position"]),

  // Labels
  labels: defineTable({
    name: v.string(),
    color: v.string(), // Hex color, default: "#64748b"
    teamId: v.id("teams"),
  })
    .index("by_teamId", ["teamId"])
    .index("by_teamId_and_name", ["teamId", "name"]),

  // Issues
  issues: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    number: v.number(), // Sequential number per team (e.g., 123)
    priority: v.string(), // none, low, medium, high, urgent
    estimate: v.optional(v.number()), // Story points or hours
    completedAt: v.optional(v.number()), // Timestamp
    teamId: v.id("teams"),
    projectId: v.optional(v.id("projects")),
    workflowStateId: v.id("workflowStates"),
    assigneeId: v.optional(v.string()), // Convex Auth user ID
    assignee: v.optional(v.string()), // User display name
    creatorId: v.string(), // Convex Auth user ID
    creator: v.string(), // User display name
  })
    .index("by_teamId", ["teamId"])
    .index("by_teamId_and_number", ["teamId", "number"])
    .index("by_workflowStateId", ["workflowStateId"])
    .index("by_projectId", ["projectId"])
    .index("by_assigneeId", ["assigneeId"])
    .index("by_creatorId", ["creatorId"]),

  // Issue Labels (Many-to-Many)
  issueLabels: defineTable({
    issueId: v.id("issues"),
    labelId: v.id("labels"),
  })
    .index("by_issueId", ["issueId"])
    .index("by_labelId", ["labelId"])
    .index("by_issueId_and_labelId", ["issueId", "labelId"]),

  // Comments
  comments: defineTable({
    content: v.string(),
    issueId: v.id("issues"),
    userId: v.string(), // Convex Auth user ID
    user: v.string(), // User display name
  })
    .index("by_issueId", ["issueId"])
    .index("by_userId", ["userId"]),

  // Team Members
  teamMembers: defineTable({
    role: v.string(), // developer, admin, viewer
    teamId: v.id("teams"),
    userId: v.string(), // Convex Auth user ID
    userEmail: v.string(),
    userName: v.string(),
  })
    .index("by_teamId", ["teamId"])
    .index("by_userId", ["userId"])
    .index("by_teamId_and_userId", ["teamId", "userId"]),

  // Invitations
  invitations: defineTable({
    email: v.string(),
    role: v.string(), // developer, admin, viewer
    status: v.string(), // pending, accepted, rejected
    invitedBy: v.string(), // Convex Auth user ID
    expiresAt: v.number(), // Timestamp
    teamId: v.id("teams"),
  })
    .index("by_teamId", ["teamId"])
    .index("by_email", ["email"])
    .index("by_teamId_and_email", ["teamId", "email"])
    .index("by_status", ["status"]),

  // Chat Conversations
  chatConversations: defineTable({
    teamId: v.id("teams"),
    userId: v.string(), // Convex Auth user ID
    title: v.optional(v.string()), // Auto-generated from first message
  })
    .index("by_teamId", ["teamId"])
    .index("by_userId", ["userId"])
    .index("by_teamId_and_userId", ["teamId", "userId"]),

  // Chat Messages
  chatMessages: defineTable({
    conversationId: v.id("chatConversations"),
    role: v.string(), // user, assistant, tool
    content: v.string(),
    toolCalls: v.optional(v.any()), // Store tool call data as JSON
  }).index("by_conversationId", ["conversationId"]),
});
