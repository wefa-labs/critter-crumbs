// `bun run lint`: ESLint over the repository, held to a shrink-only baseline.
//
// The four custom rules and the rest had no findings when the baseline was taken, so for them
// any finding fails. Counts are per rule and file, as the kit's baseline keeps them: within a
// file, fixing one held finding leaves room for one new finding of the same rule. A message with
// no rule (a parse error or an unused disable directive) counts as "parse-error". The React hooks and jsx-a11y rules joined with findings already in the
// tree (docs/decisions.md, 2026-11-21); scripts/data/lint-baseline.json holds their count per
// rule and file, and a count may fall but never rise. When counts fall, `--shrink` lowers the
// baseline to match. scripts/lint-baseline.mjs is the agent kit's baseline module, copied as is.
import { ESLint } from "eslint";
import {
  compareBaseline,
  countFindings,
  describe,
  normalizeFindings,
  readBaseline,
  shrinkBaseline,
} from "./lint-baseline.mjs";
import { writeFileSync } from "node:fs";
import path from "node:path";

const BASELINE = "scripts/data/lint-baseline.json";
const eslint = new ESLint();
const results = await eslint.lintFiles(["."]);
const counts = countFindings(normalizeFindings(results));
const baseline = readBaseline(BASELINE);
const comparison = compareBaseline(baseline, counts);

if (!comparison.ok) {
  const failing = new Set(
    [...comparison.grown, ...comparison.added].map((entry) => `${entry.rule} ${entry.file}`)
  );
  const shown = results
    .map((result) => ({
      ...result,
      messages: result.messages.filter((message) =>
        failing.has(
          `${message.ruleId ?? "parse-error"} ${path.relative(process.cwd(), result.filePath)}`
        )
      ),
    }))
    .filter((result) => result.messages.length > 0)
    .map((result) => ({ ...result, errorCount: result.messages.length, warningCount: 0 }));
  console.log((await eslint.loadFormatter("stylish")).format(shown));
  for (const line of describe(comparison)) console.log(line);
  console.log(
    `Fix the findings above. ${BASELINE} only shrinks; raising a count needs a reviewed hand edit.`
  );
  process.exit(1);
}

if (process.argv.includes("--shrink")) {
  writeFileSync(BASELINE, `${JSON.stringify(shrinkBaseline(baseline, counts), null, 2)}\n`);
  console.log(`${BASELINE}: ${comparison.shrunk.length} count(s) lowered`);
} else {
  for (const line of describe(comparison)) console.log(line);
}
const held = Object.values(baseline.counts).reduce(
  (sum, files) => sum + Object.values(files).reduce((a, b) => a + b, 0),
  0
);
console.log(`lint: no new findings; ${held} held in the baseline`);
