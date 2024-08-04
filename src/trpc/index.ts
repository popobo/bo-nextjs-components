// src/trpc/index.ts
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  test: publicProcedure.query(() => {
    const randomNumber = Math.random();

    if (randomNumber < 0.7) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Random number is too low",
      });
    }

    return String(Math.random());
  }),
});

export type AppRouter = typeof appRouter;
