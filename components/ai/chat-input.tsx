'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
} from '@/components/ui/prompt-input'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input)
      setInput('')
    }
  }

  return (
    <div className="border-t border-border p-4 bg-background">
      <PromptInput
        value={input}
        onValueChange={setInput}
        onSubmit={handleSubmit}
        disabled={disabled}
        maxHeight={150}
      >
        <PromptInputActions>
          <PromptInputTextarea
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="flex-1"
          />
          <Button
            type="button"
            size="icon"
            disabled={disabled || !input.trim()}
            onClick={handleSubmit}
            className="h-9 w-9 rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </PromptInputActions>
      </PromptInput>
    </div>
  )
}
