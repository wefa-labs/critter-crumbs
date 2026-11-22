import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { PlaywrightTestConfig } from "playwright/test";

/**
 * The local stack the browser suites run against: `bun run dev:local` (Vite on 5173, the API on
 * PGlite at 3000, mock encryption and the dev clock). Playwright starts it and waits until the API
 * answers through Vite's proxy. In CI each run gets a fresh data folder and never reuses a server;
 * locally a stack already running is reused, as before.
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
  env: {
    LOCAL_DATA_DIR:
      process.env.LOCAL_DATA_DIR ??
      (ci ? mkdtempSync(path.join(tmpdir(), "critter-crumbs-e2e-")) : ""),
  },
};

/** Shared by the browser suites: one worker for the one shared clock, no retries, flakes fail. */
export const suiteDefaults = {
  workers: 1,
  retries: 0,
  failOnFlakyTests: ci,
  forbidOnly: ci,
  use: { baseURL: BASE_URL },
} satisfies PlaywrightTestConfig;
