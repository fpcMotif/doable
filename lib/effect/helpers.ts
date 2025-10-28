/**
 * Effect-TS Helper Functions
 * Provides unified side effect and error handling
 */

import { Effect, Console } from "effect";

export interface ApiError {
    readonly _tag: "ApiError";
    readonly message: string;
    readonly context?: string;
}

/**
 * Safe API Call Wrapper
 * Automatically handles errors and provides logging
 */
export function safeApiCall<T>(
    fn: () => Promise<T>,
    context: string
): Effect.Effect<T, ApiError> {
    return Effect.tryPromise({
        try: async () => {
            Console.log(`[${context}] Starting...`);
            const result = await fn();
            Console.log(`[${context}] Success`);
            return result;
        },
        catch: (error) => {
            const message =
                error instanceof Error ? error.message : String(error);
            Console.error(`[${context}] Failed:`, message);
            return {
                _tag: "ApiError" as const,
                message,
                context,
            };
        },
    });
}

/**
 * Batch API Calls
 */
export function batchApiCalls<T>(
    calls: Array<Effect.Effect<T, ApiError>>
): Effect.Effect<Array<T>, ApiError> {
    return Effect.all(calls, { concurrency: "unbounded" });
}

/**
 * Retry Wrapper
 */
export function withRetry<T>(
    effect: Effect.Effect<T, ApiError>,
    maxRetries = 3
): Effect.Effect<T, ApiError> {
    return Effect.retry(effect, { times: maxRetries });
}

