/**
 * Convex + Effect Integration Hook
 * Combines Convex useQuery with Effect side effect handling
 */

import { useQuery as useConvexQuery } from "convex/react";
import type { FunctionReference, FunctionReturnType } from "convex/server";
import { Effect, pipe } from "effect";
import { useEffect, useState } from "react";
import { safeApiCall } from "../effect/helpers";

/**
 * Convex Query Hook with Effect wrapper
 *
 * Usage:
 * ```tsx
 * const { data, loading, error } = useConvexQueryWithEffect(
 *   api.teams.getUserTeams,
 *   {}
 * );
 * ```
 */
export function useConvexQueryWithEffect<T extends FunctionReference<"query">>(
  query: T,
  args: T extends FunctionReference<"query", "public", infer Args>
    ? Args
    : never
) {
  type ReturnType = FunctionReturnType<T>;

  const [data, setData] = useState<ReturnType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convex real-time query
  const convexData = useConvexQuery(query, args);

  useEffect(() => {
    if (convexData === undefined) {
      setLoading(true);
      return;
    }

    // Handle data with Effect
    const program = pipe(
      safeApiCall(async () => convexData, "Convex Query"),
      Effect.map((result) => {
        setData(result as ReturnType);
        setLoading(false);
        setError(null);
        return result;
      }),
      Effect.catchAll((apiError) =>
        Effect.sync(() => {
          setError(apiError.message);
          setLoading(false);
        })
      )
    );

    Effect.runPromise(program);
  }, [convexData]);

  return { data, loading, error };
}
