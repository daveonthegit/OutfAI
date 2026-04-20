import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { extractSignalsFromLog } from "./signals";
import {
  applySignalsToLearnedWeights,
  bumpStatsForAction,
} from "./preferenceStore";

/**
 * After a recommendation log row is inserted, update learned weights + stats
 * when the action carries feedback (not "shown").
 */
const FEEDBACK_ACTIONS = new Set(["saved", "skipped", "worn"]);

export async function onActionLogged(
  ctx: MutationCtx,
  userId: string,
  log: Doc<"recommendationLogs">
): Promise<void> {
  if (log.action === "shown") {
    return;
  }
  if (!FEEDBACK_ACTIONS.has(log.action)) {
    return;
  }

  const garmentDocs: Doc<"garments">[] = [];
  for (const gid of log.garmentIds) {
    try {
      const id = gid as Id<"garments">;
      const g = await ctx.db.get(id);
      if (g && g.userId === userId) {
        garmentDocs.push(g);
      }
    } catch {
      /* invalid id string */
    }
  }

  const signals = extractSignalsFromLog(log, garmentDocs);
  if (signals.length > 0) {
    await applySignalsToLearnedWeights(ctx, userId, signals);
  }
  await bumpStatsForAction(ctx, userId, log.action);
}
