import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/../../server/api/routers/_app";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export const GET = handler;
export const POST = handler;
