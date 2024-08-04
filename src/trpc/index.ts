// src/trpc/index.ts
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  test: publicProcedure.query(() => {
    return String(Math.random());
  }),
});

export type AppRouter = typeof appRouter;
