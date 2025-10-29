"use client";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type GitHubStarButtonProps = {
  owner: string;
  repo: string;
  className?: string;
  showCount?: boolean;
  variant?: "default" | "minimal" | "outline";
};

type GitHubRepoData = {
  stargazers_count: number;
  full_name: string;
  html_url: string;
};

export const GitHubStarButton: React.FC<GitHubStarButtonProps> = ({
  owner,
  repo,
  className = "",
  showCount = true,
  variant = "default",
}) => {
  const [starCount, setStarCount] = useState<number>(0);
  const [displayCount, setDisplayCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`
        );
        if (response.ok) {
          const data: GitHubRepoData = await response.json();
          setStarCount(data.stargazers_count);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    fetchStarCount();
  }, [owner, repo]);

  // Counting animation effect
  useEffect(() => {
    if (starCount > 0) {
      const duration = 2000; // 2 seconds
      const steps = 60; // 60 steps for smooth animation
      const stepDuration = duration / steps;
      const increment = starCount / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.min(
          Math.floor(increment * currentStep),
          starCount
        );
        setDisplayCount(newValue);

        if (currentStep >= steps) {
          clearInterval(timer);
          setDisplayCount(starCount);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [starCount]);

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "minimal":
        return "bg-transparent border border-border text-muted-foreground hover:bg-secondary hover:text-foreground";
      case "outline":
        return "bg-background border border-border text-foreground hover:bg-secondary hover:text-foreground";
      case "default":
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm";
    }
  };

  return (
    <Link
      className={cn(
        "relative flex items-center rounded-md font-medium text-sm px-3 py-1.5 transition duration-200 text-center",
        getVariantStyles(),
        className
      )}
      href={`https://github.com/${owner}/${repo}`}
      rel="noopener noreferrer"
      target="_blank"
    >
      {/* GitHub Logo Section */}
      <div className="flex items-center justify-center pr-2 border-r border-border">
        <div className="w-4 h-4 bg-foreground rounded-full flex items-center justify-center">
          <svg
            className="text-background"
            fill="currentColor"
            height="12"
            viewBox="0 0 24 24"
            width="12"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </div>
      </div>

      {/* Star Count Section */}
      <div className="flex items-center gap-1.5 pl-2">
        {showCount && !isLoading && (
          <>
            <span className="font-medium text-sm">
              {formatCount(displayCount)}
            </span>
            <svg
              className="text-current"
              fill="none"
              height="12"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="12"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <svg
              className="text-current"
              fill="none"
              height="12"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="12"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}
      </div>
    </Link>
  );
};
