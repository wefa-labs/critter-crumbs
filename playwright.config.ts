import { defineConfig } from "playwright/test";
import { stack, suiteDefaults } from "./tests/stack.js";

// The lifecycle and screen-flow suite. The local mock clock is shared across rehearsals, so one
// worker runs them in turn.
export default defineConfig({
  ...suiteDefaults,
  testDir: "./tests/e2e",
  webServer: stack,
});
