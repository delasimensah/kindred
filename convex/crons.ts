import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "presence cleanup",
  { minutes: 10 },
  internal.presence.cleanup,
  {}
);

crons.interval(
  "scheduled publish safety net",
  { hours: 1 },
  internal.studioTracks.publishDueScheduled,
  {}
);

export default crons;
