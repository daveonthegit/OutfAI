// shared/types/__resource__.ts
import type { z } from "zod";
import type {
  __resource__CreateInputSchema,
  __resource__UpdateInputSchema,
} from "../schemas/__resource__";

export type __resource__CreateInput = z.infer<
  typeof __resource__CreateInputSchema
>;
export type __resource__UpdateInput = z.infer<
  typeof __resource__UpdateInputSchema
>;

// Optionally define response/view models too:
// export type __Resource__ = { ... }
