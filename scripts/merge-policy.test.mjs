// Keeps .agents/merge-policy.json in step with what the repository holds: CODEOWNERS names exactly
// the critical and sensitive paths, the required checks are the jobs CI runs on a pull request,
// every gated path matches a tracked file, and the files whose tier matters most land in it.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { globRegex, mergePolicy as policy, tierOf } from "./merge-tiers.mjs";

const read = (file) => readFileSync(file, "utf8");
const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean);
const gated = ["critical", "sensitive"].flatMap((tier) => policy.tiers[tier].paths);

const ownerPattern = (glob) => (glob.endsWith("/**") ? `/${glob.slice(0, -2)}` : `/${glob}`);

test("the policy names the three tiers, merge commits, auto-merge and branch deletion", () => {
  assert.deepEqual(Object.keys(policy.tiers), ["critical", "sensitive", "routine"]);
  assert.equal(policy.mergeMethod, "merge");
  assert.equal(policy.autoMerge, true);
  assert.equal(policy.deleteBranchOnMerge, true);
  for (const tier of Object.values(policy.tiers)) assert.equal(tier.requireCodeOwnerReview, false);
  assert.deepEqual(policy.tiers.routine.paths, ["**"]);
});

test("CODEOWNERS has one owned line for each critical and sensitive path, and no other", () => {
  const lines = read(".github/CODEOWNERS")
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .map((line) => line.trim().split(/\s+/));
  const patterns = lines.map(([pattern]) => pattern);
  assert.deepEqual([...patterns].sort(), gated.map(ownerPattern).sort());
  for (const [pattern, ...owners] of lines)
    assert.ok(
      owners.length && owners.every((owner) => owner.startsWith("@")),
      `${pattern} names no owner`
    );
});

test("the required checks are exactly the jobs CI runs on a pull request", () => {
  const jobs = [];
  for (const file of readdirSync(".github/workflows")) {
    const text = read(`.github/workflows/${file}`);
    if (!/^\s{2}pull_request:/m.test(text) && !/^on:.*pull_request/m.test(text)) continue;
    const body = text.slice(text.indexOf("\njobs:") + 6);
    for (const match of body.matchAll(/^ {2}([\w-]+):\n((?: {4}.*\n|\s*\n)*)/gm))
      jobs.push(/^ {4}name: (.+)$/m.exec(match[2])?.[1].trim() ?? match[1]);
  }
  assert.deepEqual([...jobs].sort(), [...policy.requiredChecks].sort());
});

test("every gated path matches a tracked file", () => {
  for (const glob of gated)
    assert.ok(
      tracked.some((file) => globRegex(glob).test(file)),
      `${glob} matches no tracked file`
    );
});

test("a nested tsconfig outside the gated paths stays routine, so the root tsconfig rule stays at the root", () => {
  assert.equal(tierOf("docs/explorations/any/tsconfig.json"), "routine");
  assert.equal(tierOf("tsconfig.json"), "critical");
});

test("the files whose tier matters most land in it", () => {
  const pins = {
    critical: [
      // The domain: keys, timelock, tally, generator, phases, encryption, sessions, writes, data.
      "packages/core/src/tally/index.ts",
      "packages/core/src/generator/index.ts",
      "packages/core/src/generator/versioned.ts",
      "packages/core/src/phase.ts",
      "packages/core/src/publication.ts",
      "packages/app/src/crypto/timelock.ts",
      "packages/api/src/keys.ts",
      "packages/api/src/ballots.ts",
      "packages/api/src/session.ts",
      "packages/api/src/runtime.ts",
      "db/migrations/0001_init.sql",
      // Deploy, dependencies, and everything that defines or runs the required check.
      "scripts/deploy.mjs",
      "scripts/deployment/eas.ts",
      "scripts/runtime-dependencies.json",
      "scripts/dev-dependencies.json",
      "scripts/dev-overrides.json",
      "scripts/bun-release.json",
      "vercel.json",
      "package.json",
      "packages/app/package.json",
      "bun.lock",
      ".bun-version",
      "bunfig.toml",
      "tsconfig.json",
      "packages/core/tsconfig.json",
      "packages/app/vite.config.ts",
      "scripts/generate-tokens.mjs",
      "scripts/test.mjs",
      "scripts/eslint-rules.mjs",
      "eslint.config.mjs",
      "vitest.config.ts",
      ".github/workflows/check.yml",
      // The git guardrail, for both tools.
      ".claude/hooks/block-dangerous-git.sh",
      ".claude/hooks/test-guardrail.sh",
      ".claude/hooks/guardrail-cases.txt",
      ".claude/settings.json",
      ".codex/hooks.json",
      "scripts/guardrails.test.mjs",
      "biome.json",
      "scripts/lint.mjs",
      "scripts/data/lint-baseline.json",
      "scripts/lint-rules.test.mjs",
    ],
    sensitive: [
      "packages/shared/src/copy.ts",
      "packages/api/src/http.ts",
      "api/me.ts",
      ".agents/merge-policy.json",
      ".agents/policy.json",
      ".agents/adapter.md",
      "AGENTS.md",
      "CLAUDE.md",
      ".agents/skills/review/SKILL.md",
      "scripts/data/validation-policy.json",
      "scripts/agent-policy.test.mjs",
    ],
    routine: [
      "packages/app/src/main.ts",
      "packages/app/src/game/mound-size.ts",
      "docs/decisions.md",
      "tests/e2e/lifecycle.spec.ts",
      "docs/explorations/garden-refinement/README.md",
    ],
  };
  for (const [tier, files] of Object.entries(pins)) {
    for (const file of files) {
      assert.ok(tracked.includes(file), `${file} is pinned but not tracked; update the pin`);
      assert.equal(tierOf(file), tier, file);
    }
  }
});
