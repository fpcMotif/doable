---
inclusion: fileMatch
fileMatchPattern: ['app/api/**/*.ts', 'lib/**/*.ts']
---
# Effect-TS Best Practices

## Core Helper
All async side effects should use `safeApiCall` from [lib/effect-helpers.ts](mdc:lib/effect-helpers.ts).

## API Route Pattern
Use Effect pipelines for composable, type-safe error handling.

**Example:** [app/api/subscription/route.ts](mdc:app/api/subscription/route.ts)
```typescript
import { Effect, pipe } from "effect";
import { safeApiCall } from "@/lib/effect-helpers";

export function GET(request: NextRequest) {
  const program = pipe(
    // Step 1: Get user ID
    safeApiCall(() => getCurrentUserId(request), "Get user ID"),
    
    // Step 2: Validate subscription
    Effect.flatMap((userId) =>
      safeApiCall(
        () => validateSubscriptionAndUsage(userId),
        "Validate subscription"
      )
    ),
    
    // Step 3: Build response
    Effect.map(({ isSubscribed, requestsRemaining, requestsUsed }) => {
      return NextResponse.json({
        isSubscribed,
        requestsRemaining,
        requestsUsed,
      });
    }),
    
    // Unified error handling
    Effect.catchAll((error) =>
      Effect.sync(() => {
        logError(new Error(error.message));
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      })
    )
  );

  return Effect.runPromise(program);
}
```

## Benefits
- Composability via `pipe` and `flatMap`
- Type-safe error handling (no `any` types)
- Built-in observability (Console.log/error)
- Unified error handling with `catchAll`

## When to Use
- Complex API routes with multiple async steps
- Need strong error typing
- Want composable async operations
- Debugging/logging requirements
