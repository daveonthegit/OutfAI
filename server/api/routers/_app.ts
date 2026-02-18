import { router } from "../trpc";
import { recommendationRouter } from "./recommendations";

export const appRouter = router({
  recommendations: recommendationRouter,
});

export type AppRouter = typeof appRouter;
