import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { PlaywrightTestConfig } from "playwright/test";

/**
 * The local stack the browser suites run against: `bun run dev:local` (Vite on 5173, the API on
 * PGlite at 3000, mock encryption and the dev clock). Playwright starts it and waits until the API
 * answers through Vite's proxy, and stops it with SIGTERM so PGlite closes its files. A stack it
 * starts gets a fresh data folder, so the suites' clock moves never reach a developer's own data.
 * In CI a server is never reused; locally a stack already on 5173 is, whichever checkout serves it.
 */
export const BASE_URL = "http://127.0.0.1:5173";

const ci = Boolean(process.env.CI);

export const stack: Exclude<NonNullable<PlaywrightTestConfig["webServer"]>, unknown[]> = {
  command: "bun run dev:local",
  url: `${BASE_URL}/api/session/nonce`,
  reuseExistingServer: !ci,
  timeout: 240_000,
  stdout: "ignore",
  stderr: "pipe",
  gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 },
  env: {
    LOCAL_DATA_DIR:
      process.env.LOCAL_DATA_DIR ?? mkdtempSync(path.join(tmpdir(), "critter-crumbs-e2e-")),
  },
};

/** Shared by the browser suites: one worker for the one shared clock, no retries, so a flaky test fails the run. */
export const suiteDefaults = {
  workers: 1,
  retries: 0,
  forbidOnly: ci,
  use: { baseURL: BASE_URL, trace: "retain-on-failure" },
} satisfies PlaywrightTestConfig;
