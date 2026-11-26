import { expect, test } from "vitest";
import { deploymentOrigin } from "../../packages/api/src/runtime.js";

test("a preview accepts its exact deployment URL when no origin was configured", () => {
  expect(
    deploymentOrigin({
      VERCEL_ENV: "preview",
      VERCEL_URL: "critter-crumbs-preview.vercel.app",
    })
  ).toBe("https://critter-crumbs-preview.vercel.app");
  expect(
    deploymentOrigin({
      VERCEL_ENV: "preview",
      VERCEL_URL: "critter-crumbs-preview.vercel.app/extra",
    })
  ).toBeUndefined();
});

test("the configured origin wins, and production requires it", () => {
  const VERCEL_URL = "critter-crumbs-prod.vercel.app";
  expect(deploymentOrigin({ VERCEL_ENV: "production", VERCEL_URL })).toBeUndefined();
  expect(
    deploymentOrigin({
      VERCEL_ENV: "preview",
      VERCEL_URL,
      APP_ORIGIN: "https://example.org",
    })
  ).toBe("https://example.org");
});
