/**
 * Chat API - Server-side helpers using Convex
 */

import type { Id } from "@/convex/_generated/dataModel";
import { api, getConvexClient } from "@/lib/convex";
import { getSystemPrompt } from "@/lib/prompts/assistant-prompt";
import type {
  CreateChatConversationData,
  SaveChatMessagesData,
  TeamContext,
} from "@/lib/types/chat";

export async function getTeamContext(teamId: string): Promise<TeamContext> {
  const convex = getConvexClient();

  // Fetch all team-related data in parallel for efficiency
  const [projects, workflowStates, labels, members] = await Promise.all([
    convex.query(api.projects.listProjects, { teamId: teamId as Id<"teams"> }),
    convex.query(api.workflowStates.listStates, {
      teamId: teamId as Id<"teams">,
    }),
    convex.query(api.labels.listLabels, { teamId: teamId as Id<"teams"> }),
    convex.query(api.teamMembers.listMembers, {
      teamId: teamId as Id<"teams">,
    }),
  ]);

  return {
    projects,
    workflowStates,
    labels,
    members,
  };
}

export function formatTeamContextForAI(context: TeamContext): string {
  const systemPrompt = getSystemPrompt(context);
  return systemPrompt;
}

export async function createChatConversation(data: CreateChatConversationData) {
  const convex = getConvexClient();

  return await convex.mutation(api.chatConversations.createConversation, {
    teamId: data.teamId as Id<"teams">,
    userId: data.userId,
    title: data.title,
  });
}

export async function saveChatMessages(data: SaveChatMessagesData) {
  const convex = getConvexClient();

  // Delete existing messages first
  const existingMessages = await convex.query(api.chatMessages.listMessages, {
    conversationId: data.conversationId as Id<"chatConversations">,
  });

  await Promise.all(
    existingMessages.map((msg) =>
      convex.mutation(api.chatMessages.deleteMessage, {
        messageId: msg._id,
      })
    )
  );

  // Insert new messages
  await Promise.all(
    data.messages.map((msg) =>
      convex.mutation(api.chatMessages.createMessage, {
        conversationId: data.conversationId as Id<"chatConversations">,
        role: msg.role,
        content: msg.content,
        toolCalls: msg.toolCalls
          ? JSON.parse(JSON.stringify(msg.toolCalls))
          : null,
      })
    )
  );
}

export async function getChatConversation(conversationId: string) {
  const convex = getConvexClient();

  const [conversation, messages] = await Promise.all([
    convex.query(api.chatConversations.listConversations, {
      conversationId: conversationId as Id<"chatConversations">,
    }),
    convex.query(api.chatMessages.listMessages, {
      conversationId: conversationId as Id<"chatConversations">,
    }),
  ]);

  return conversation && conversation.length > 0
    ? {
        ...conversation[0],
        messages,
      }
    : null;
}

export async function getChatConversations(teamId: string, userId: string) {
  const convex = getConvexClient();

  return await convex.query(api.chatConversations.listConversations, {
    teamId: teamId as Id<"teams">,
    userId,
  });
}

export async function deleteChatConversation(conversationId: string) {
  const convex = getConvexClient();

  return await convex.mutation(api.chatConversations.deleteConversation, {
    conversationId: conversationId as Id<"chatConversations">,
  });
}

export function generateConversationTitle(firstMessage: string): string {
  // Limit title to 50 characters, clean up the text
  let title = firstMessage.trim().slice(0, 50);

  // If truncated, add ellipsis (but make sure we don't exceed 50)
  if (firstMessage.length > 50) {
    title = title.slice(0, 47) + "...";
  }

  return title;
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
) {
  const convex = getConvexClient();

  return await convex.mutation(api.chatConversations.updateConversationTitle, {
    conversationId: conversationId as Id<"chatConversations">,
    title,
  });
}

export async function getTeamSettings(teamId: string) {
  const convex = getConvexClient();

  const team = await convex.query(api.teams.getTeam, {
    teamId: teamId as Id<"teams">,
  });

  return {
    hasApiKey: !!team?.groqApiKey,
    apiKey: team?.groqApiKey || null,
  };
}

export async function updateTeamSettings(
  teamId: string,
  settings: { groqApiKey?: string | null }
) {
  const convex = getConvexClient();

  return await convex.mutation(api.teams.updateTeam, {
    teamId: teamId as Id<"teams">,
    groqApiKey: settings.groqApiKey,
  });
}
