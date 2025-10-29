import { Effect } from "effect";
import { logger } from "@/lib/logger";

export const logErrorEffect = (message: string) =>
  Effect.suspend(() =>
    Effect.sync((error?: unknown) => {
      logger.error(message, { error });
    })
  );

export const logInfoEffect = (message: string, context?: unknown) =>
  Effect.sync(() => {
    logger.info(message, context);
  });
