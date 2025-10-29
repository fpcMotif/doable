"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Brain, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";

type AIChatbotProps = {
  teamId: string;
};

export function AIChatbot({ teamId }: AIChatbotProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/teams/${teamId}/chat`,
      prepareSendMessagesRequest({ messages, id }) {
        // Get API key from localStorage if available
        const apiKey =
          typeof window !== "undefined"
            ? localStorage.getItem("groq_api_key")
            : null;

        return {
          body: {
            messages,
            conversationId: conversationId || id,
            ...(apiKey && { apiKey }),
          },
        };
      },
    }),
  });

  const isLoading = status !== "ready" && status !== "error";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (message: string) => {
    sendMessage({
      text: message,
    });
  };

  // Listen for successful tool execution and trigger refresh
  useEffect(() => {
    // Dispatch refresh event after a short delay to allow the API to complete
    const timer = setTimeout(() => {
      if (messages.length > 0 && status === "ready") {
        // Check if the last message was from assistant (meaning an action was completed)
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          // Check for tool calls in the message
          const hasToolCalls = lastMessage.parts?.some(
            (part) => (part as { type: string }).type === "tool-call"
          );

          if (hasToolCalls) {
            // Find the tool names from the tool calls
            const toolNames =
              lastMessage.parts
                ?.filter(
                  (part) => (part as { type: string }).type === "tool-call"
                )
                .map((part) => (part as { toolName: string }).toolName)
                .join(" ") || "";

            // Dispatch appropriate refresh events based on tool used
              window.dispatchEvent(new Event("refresh-projects"));
            }
            if (toolNames.includes("inviteTeamMember")) {
              window.dispatchEvent(new Event("refresh-people"));
            }
            if (
              toolNames.includes("createIssue") ||
              toolNames.includes("updateIssue") ||
              toolNames.includes("deleteIssue")
            ) {
              window.dispatchEvent(new Event("refresh-issues"));
            }
          }
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [messages, status]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Doable AI</h2>
            <p className="text-xs text-muted-foreground">
              Ask me anything about your team
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              I can help you create issues, manage projects, invite team
              members, and more. Just ask me anything!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              // Extract text content from message parts
              const textContent =
                message.parts
                  ?.filter((part) => (part as { type: string }).type === "text")
                  .map((part) => (part as { text: string }).text)
                  .join("") || "";

              return (
                <ChatMessage
                  key={message.id || index}
                  message={{
                    role: message.role,
                    content: textContent,
                    id: message.id,
                  }}
                />
              );
            })}

            {error && (
              <div className="p-4 text-sm text-destructive">
                Error: {error.message}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput disabled={isLoading} onSend={handleSend} />
    </div>
  );
}
