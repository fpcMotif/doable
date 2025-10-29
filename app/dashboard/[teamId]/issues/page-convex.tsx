/**
 * Issues Page - Convex + Effect + React 19.2 useEffectEvent version
 *
 * New features example:
 * 1. React 19.2 useEffectEvent - Eliminate closure traps
 * 2. Convex useQuery - Real-time data subscription
 * 3. Effect - Unified side effect handling
 * 4. Next.js 16 React Compiler - Automatic optimization
 */

"use client";

import { useMutation, useQuery } from "convex/react";
import { Effect, pipe } from "effect";
import { useParams } from "next/navigation";
// React 19.2 useEffectEvent polyfill
// Note: If React 19.2 hasn't officially released this API, use useCallback instead
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { safeApiCall } from "@/lib/effect/helpers";
import { logger } from "@/lib/logger";

const useEffectEvent = <T extends (...args: unknown[]) => unknown>(fn: T): T => {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  // Stable callback that always calls latest fn
  return useCallback(((...args: Parameters<T>) => (ref.current as T)(...args)) as T, []) as T;
};

type IssueFilters = {
  status?: Array<Id<"workflowStates">>;
  assignee?: string[];
  project?: Array<Id<"projects">>;
  priority?: string[];
  search?: string;
};

export default function IssuesPageConvex() {
  const params = useParams();
  const teamId = params.teamId as Id<"teams">;

  // State
  const [filters, setFilters] = useState<IssueFilters>({});
  const [view, setView] = useState<"board" | "table" | "list">("board");

  // Convex real-time query - Auto subscribe to data changes
  const issues = useQuery(api.issues.listIssues, {
    teamId,
    filters,
  });

  const workflowStates = useQuery(api.workflowStates.listStates, { teamId });

  // Convex Mutations
  const createIssueMutation = useMutation(api.issues.createIssue);

  // React 19.2 useEffectEvent - Stable event handler
  // Access latest filters without triggering useEffect re-run
  const handleFilterChange = useEffectEvent((newFilters: IssueFilters) => {
    const program = pipe(
      safeApiCall(async () => {
        setFilters(newFilters);
        return newFilters;
      }, "Update filters"),
      Effect.tapError((error) =>
        Effect.sync(() => {
          logger.error("Filter update failed", { error, newFilters });
        })
      ),
    );

    Effect.runPromise(program);
  });

  // Handle complex Issue creation logic with Effect
  const handleCreateIssue = useEffectEvent(
    async (data: {
      title: string;
      description?: string;
      priority: string;
      workflowStateId: Id<"workflowStates">;
    }) => {
      const program = pipe(
        // Step 1: Validate data
        safeApiCall(async () => {
          if (!data.title.trim()) {
            throw new Error("Title cannot be empty");
          }
          return data;
        }, "Validate Issue data"),

        // Step 2: Call Convex mutation
        Effect.flatMap((validData) =>
          safeApiCall(
            async () =>
              await createIssueMutation({
                teamId,
                ...validData,
              }),
            "Create Issue"
          )
        ),
        Effect.tapError((error) =>
          Effect.sync(() => {
            logger.error("Create Issue failed", { error, data });
          })
        )
      );

      return Effect.runPromise(program);
    }
  );

  // Keyboard shortcuts - Use useEffectEvent to ensure access to latest state
  const handleKeyPress = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "n" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      // Open create Issue dialog
      // TODO: open create issue dialog here
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Loading state
  if (issues === undefined || workflowStates === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Issues</h1>

        <div className="flex gap-4">
          {/* View Switcher */}
          <div className="flex gap-2">
            <button
              className={`rounded px-4 py-2 ${view === "board" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setView("board")}
            >
              Board
            </button>
            <button
              className={`rounded px-4 py-2 ${view === "table" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setView("table")}
            >
              Table
            </button>
            <button
              className={`rounded px-4 py-2 ${view === "list" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setView("list")}
            >
              List
            </button>
          </div>

          {/* Create Button */}
          <button
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            onClick={() =>
              handleCreateIssue({
                title: "New Issue",
                priority: "medium",
                workflowStateId: workflowStates[0]._id,
              })
            }
          >
            + Create Issue
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 rounded bg-gray-100 p-4">
        <input
          className="w-full rounded border px-4 py-2"
          onChange={(e) =>
            handleFilterChange({ ...filters, search: e.target.value })
          }
          placeholder="Search Issues..."
          type="text"
        />
      </div>

      {/* Issues Display */}
      <div className="space-y-4">
        {issues.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No Issues found</div>
        ) : (
          <div className="grid gap-4">
            {issues.map((issue) => (
              <div
                className="rounded border p-4 transition-shadow hover:shadow-md"
                key={issue._id}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{issue.title}</h3>
                    <p className="text-gray-600 text-sm">
                      #{issue.number} · {issue.priority}
                    </p>
                    {issue.description && (
                      <p className="mt-2 text-gray-700">{issue.description}</p>
                    )}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {issue.assignee || "Unassigned"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Stats */}
      <div className="mt-6 rounded bg-blue-50 p-4">
        <p className="text-blue-800 text-sm">
          Real-time data: Total {issues.length} Issues
          {filters.search && ` (Search: "${filters.search}")`}
        </p>
      </div>
    </div>
  );
}
