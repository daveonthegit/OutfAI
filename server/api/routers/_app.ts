import { router } from "../trpc";
import { recommendationRouter } from "./recommendations";
import { garmentRouter } from "./garments";

export const appRouter = router({
  recommendations: recommendationRouter,
  garments: garmentRouter,
});

export type AppRouter = typeof appRouter;
