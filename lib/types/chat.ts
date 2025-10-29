import type { ChatConversation, ChatMessage } from "@prisma/client";

export type ChatConversationWithMessages = ChatConversation & {
  messages: ChatMessage[];
};

export type TeamContext = {
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    key: string;
    color: string;
    icon: string | null;
    status: string;
    lead: string | null;
    _count: { issues: number };
  }>;
  workflowStates: Array<{
    id: string;
    name: string;
    type: string;
    color: string;
    position: number;
  }>;
  labels: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  members: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    role: string;
  }>;
};

export type CreateChatConversationData = {
  teamId: string;
  userId: string;
  title?: string;
};

export type SaveChatMessagesData = {
  conversationId: string;
  messages: Array<{
    role: string;
    content: string;
    toolCalls?: any;
  }>;
};
