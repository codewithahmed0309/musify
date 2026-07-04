import { app } from "./app.js";
import { env } from "./config/env.js";

// Defense in depth: a single unexpected error should never be able to kill
// the whole process (which was effectively what happened before — a bad
// upload could take down the dev server hard enough to also disrupt other
// connections/HMR on the same machine). Express already routes handler
// errors through errorHandler via asyncHandler, so reaching here means
// something escaped that path entirely (e.g. a raw stream/socket error).
// We log it loudly instead of crashing.
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException] server stayed up, but investigate this:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection] server stayed up, but investigate this:", reason);
});

const server = app.listen(env.port, () => {
  console.log(`Musify API listening on http://localhost:${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
});

// Give in-flight uploads more breathing room than Node's default 5s headers
// timeout, so large audio files over slower connections don't get cut off
// mid-transfer.
server.requestTimeout = 5 * 60 * 1000; // 5 minutes
server.headersTimeout = 5 * 60 * 1000 + 1000;
