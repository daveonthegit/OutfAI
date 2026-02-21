// shared/schemas/__resource__.ts
import { z } from "zod";

export const __resource__IdSchema = z.object({
  id: z.string().min(1),
});

export const __resource__CreateInputSchema = z.object({
  // Replace fields:
  name: z.string().min(1),
});

export const __resource__UpdateInputSchema = z.object({
  id: z.string().min(1),
  // Replace fields:
  name: z.string().min(1).optional(),
});
