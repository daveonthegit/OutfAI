import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "personalization-weight-decay",
  { hours: 24 },
  internal.personalization.jobs.runDailyWeightDecay
);

export default crons;
