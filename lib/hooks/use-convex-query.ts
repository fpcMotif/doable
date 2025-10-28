/**
 * Convex + Effect 集成 Hook
 * 将 Convex useQuery 与 Effect 副作用处理结合
 */

import { useQuery as useConvexQuery } from "convex/react";
import { type FunctionReference, type FunctionReturnType } from "convex/server";
import { useEffect, useState } from "react";
import { Effect, pipe } from "effect";
import { safeApiCall } from "../effect/helpers";

/**
 * 带 Effect 包装的 Convex Query Hook
 * 
 * 使用方法：
 * ```tsx
 * const { data, loading, error } = useConvexQueryWithEffect(
 *   api.teams.getUserTeams,
 *   {}
 * );
 * ```
 */
export function useConvexQueryWithEffect<T extends FunctionReference<"query">>(
  query: T,
  args: T extends FunctionReference<"query", "public", infer Args> ? Args : never
) {
  type ReturnType = FunctionReturnType<T>;

  const [data, setData] = useState<ReturnType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convex 实时查询
  const convexData = useConvexQuery(query, args);

  useEffect(() => {
    if (convexData === undefined) {
      setLoading(true);
      return;
    }

    // 使用 Effect 处理数据
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

