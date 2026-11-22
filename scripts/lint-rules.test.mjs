// Probes for the lint rules that joined on 21 November 2026: each flags the code it must, through
// the repository's own ESLint config, and the baseline refuses a finding it does not hold.
import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { ESLint } from "eslint";
import {
  compareBaseline,
  countFindings,
  normalizeFindings,
  readBaseline,
} from "./lint-baseline.mjs";

const eslint = new ESLint();
// Type-aware rules need a file the TypeScript project knows, so each probe lints its own text as an
// existing file; that file's real content is not read.
const rules = async (code, file) =>
  (await eslint.lintText(code, { filePath: path.resolve(file) }))[0].messages.map(
    (message) => message.ruleId
  );

test("a promise nobody awaits fails lint, and an awaited or voided one passes", async () => {
  const floating = "export function go(load: () => Promise<void>) { load(); }";
  assert.ok(
    (await rules(floating, "packages/app/src/main.ts")).includes(
      "@typescript-eslint/no-floating-promises"
    )
  );
  assert.ok(
    (await rules(floating, "packages/core/src/phase.ts")).includes(
      "@typescript-eslint/no-floating-promises"
    )
  );
  for (const handled of [
    "export async function go(load: () => Promise<void>) { await load(); }",
    "export function go(load: () => Promise<void>) { void load(); }",
  ]) {
    assert.ok(
      !(await rules(handled, "packages/app/src/main.ts")).includes(
        "@typescript-eslint/no-floating-promises"
      ),
      handled
    );
  }
});

test("the rules of hooks and exhaustive dependencies fail lint in the app", async () => {
  const conditional =
    'import { useState } from "react";\nexport function A({ on }: { on: boolean }) { if (on) { useState(0); } return null; }';
  assert.ok(
    (await rules(conditional, "packages/app/src/game/surface.tsx")).includes(
      "react-hooks/rules-of-hooks"
    )
  );
  const missing =
    'import { useEffect } from "react";\nexport function A({ x }: { x: number }) { useEffect(() => { console.log(x); }, []); return null; }';
  assert.ok(
    (await rules(missing, "packages/app/src/game/surface.tsx")).includes(
      "react-hooks/exhaustive-deps"
    )
  );
  const complete =
    'import { useEffect } from "react";\nexport function A({ x }: { x: number }) { useEffect(() => { console.log(x); }, [x]); return null; }';
  assert.ok(
    !(await rules(complete, "packages/app/src/game/surface.tsx")).some((rule) =>
      rule?.startsWith("react-hooks/")
    )
  );
});

test("jsx-a11y fails lint on inaccessible markup in the app, and stays quiet on accessible markup", async () => {
  const found = await rules(
    'export const A = () => <div onClick={() => {}}><img src="a.png" /></div>;',
    "packages/app/src/game/surface.tsx"
  );
  for (const rule of [
    "jsx-a11y/alt-text",
    "jsx-a11y/click-events-have-key-events",
    "jsx-a11y/no-static-element-interactions",
  ])
    assert.ok(found.includes(rule), rule);
  const quiet = await rules(
    'export const A = () => <button type="button" onClick={() => {}}><img src="a.png" alt="" /></button>;',
    "packages/app/src/game/surface.tsx"
  );
  assert.ok(!quiet.some((rule) => rule?.startsWith("jsx-a11y/")));
});

test("the baseline holds today's findings and refuses a new one", async () => {
  const baseline = readBaseline("scripts/data/lint-baseline.json");
  const planted = await eslint.lintText('export const A = () => <img src="a.png" />;', {
    filePath: path.resolve("packages/app/src/game/surface.tsx"),
  });
  const result = compareBaseline(baseline, countFindings(normalizeFindings(planted)));
  assert.equal(result.ok, false);
  assert.deepEqual(
    result.added.map((entry) => `${entry.rule} ${entry.file}`),
    ["jsx-a11y/alt-text packages/app/src/game/surface.tsx"]
  );
});
