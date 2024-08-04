// src/app/_trpc/client.ts
import { AppRouter } from "@/trpc";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>({});
