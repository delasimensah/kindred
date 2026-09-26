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

crons.interval(
  "scheduled release publish safety net",
  { hours: 1 },
  internal.studioReleases.publishDueScheduled,
  {}
);

crons.monthly(
  "demo earnings for previous month",
  { day: 1, hourUTC: 6, minuteUTC: 0 },
  internal.earnings.computePreviousMonth,
  {}
);

export default crons;
