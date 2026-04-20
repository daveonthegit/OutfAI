import { internalMutation } from "../_generated/server";
import { decayAllUserWeights } from "./preferenceStore";

export const runDailyWeightDecay = internalMutation({
  args: {},
  handler: async (ctx) => {
    const updatedRows = await decayAllUserWeights(ctx);
    return { updatedRows };
  },
});
