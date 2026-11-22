import { defineConfig } from "playwright/test";
import { stack, suiteDefaults } from "./tests/stack.js";

export default defineConfig({
  ...suiteDefaults,
  testDir: "./tests/screens",
  outputDir: ".scratch/screens/test-results",
  webServer: [
    stack,
    // reference.spec.ts compares the app with the October scatter-layouts design page.
    {
      command:
        "python3 -m http.server 4184 --bind 127.0.0.1 --directory docs/explorations/scatter-layouts",
      url: "http://127.0.0.1:4184",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
