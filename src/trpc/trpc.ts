// src/trpc/trpc.ts
import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const router = t.router;

export const publicProcedure = t.procedure;
