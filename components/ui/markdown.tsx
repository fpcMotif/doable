"use client";

import type { ReactNode } from "react";

type MarkdownProps = {
  content: string;
  className?: string;
};

export function Markdown({ content, className }: MarkdownProps) {
  // Simple markdown renderer
  const renderMarkdown = (text: string): ReactNode[] => {
    const lines = text.split("\n");
    const elements: ReactNode[] = [];
    let i = 0;

    lines.forEach((line) => {
      if (line.trim() === "") {
        return;
      }

      // Bold text **text**
      if (line.includes("**")) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        elements.push(
          <div className="mb-2" key={`${i++}`}>
            {parts.map((part, idx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong className="font-semibold" key={idx}>
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={idx}>{part}</span>;
            })}
          </div>
        );
      }
      // Lists starting with -
      else if (line.trim().startsWith("- ")) {
        elements.push(
          <li className="ml-4 mb-1" key={`${i++}`}>
            {line.trim().slice(2)}
          </li>
        );
      }
      // Regular paragraph
      else {
        elements.push(
          <p className="mb-2" key={`${i++}`}>
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return <div className={className}>{renderMarkdown(content)}</div>;
}
