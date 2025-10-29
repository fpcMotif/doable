"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      <PromptInput
        disabled={disabled}
        maxHeight={150}
        onSubmit={handleSubmit}
        onValueChange={setInput}
        value={input}
      >
        <PromptInputActions>
          <PromptInputTextarea
            className="flex-1"
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          />
          <Button
            className="h-9 w-9 rounded-full shrink-0"
            disabled={disabled || !input.trim()}
            onClick={handleSubmit}
            size="icon"
            type="button"
          >
            <Send className="h-4 w-4" />
          </Button>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}
