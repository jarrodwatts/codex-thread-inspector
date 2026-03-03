#!/usr/bin/env node

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, "..", ".next", "standalone", "server.js");

const args = process.argv.slice(2);
const env = { ...process.env, HOSTNAME: "localhost" };

for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--port" || args[i] === "-p") && args[i + 1]) {
    env.PORT = args[++i];
  } else if (args[i] === "--sessions-dir" && args[i + 1]) {
    env.CODEX_SESSIONS_DIR = args[++i];
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`codex-thread-inspector — Visualize Codex agent sessions

Usage:
  npx codex-thread-inspector [options]

Options:
  -p, --port <number>       Port to listen on (default: 3000)
  --sessions-dir <path>     Path to Codex sessions directory
                            (default: ~/.codex/sessions)
  -h, --help                Show this help message`);
    process.exit(0);
  }
}

const port = env.PORT || "3000";
const url = `http://localhost:${port}`;

const child = spawn(process.execPath, [serverPath], {
  env,
  stdio: "inherit",
});

child.on("error", (err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

child.on("spawn", async () => {
  console.log(`\n  Thread Inspector running at ${url}\n`);
  try {
    const open = await import("open");
    open.default(url);
  } catch {
    // open is optional — user can navigate manually
  }
});

process.on("SIGINT", () => {
  child.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  child.kill("SIGTERM");
  process.exit(0);
});
