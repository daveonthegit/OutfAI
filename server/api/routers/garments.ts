import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { analyzeGarmentImage } from "../../services/garmentImageAnalysisService";

const analyzeGarmentImageInput = z.object({
  /** Base64-encoded image data (with or without data URL prefix) */
  imageBase64: z.string().min(1),
});

export const garmentRouter = router({
  analyzeGarmentImage: publicProcedure
    .input(analyzeGarmentImageInput)
    .mutation(async ({ input }) => {
      return analyzeGarmentImage(input.imageBase64);
    }),
});
