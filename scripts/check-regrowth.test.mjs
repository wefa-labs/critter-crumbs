import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { addedLines, fileProblem, isAppSource, judge, regrownComments } from "./check-regrowth.mjs";

// A scratch repository's git sees no machine config and a fixed identity.
const gitEnvironment = {
  ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_"))),
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_SYSTEM: "/dev/null",
  GIT_AUTHOR_NAME: "Fixture",
  GIT_AUTHOR_EMAIL: "fixture@example.invalid",
  GIT_COMMITTER_NAME: "Fixture",
  GIT_COMMITTER_EMAIL: "fixture@example.invalid",
};

function scratch(t) {
  const root = mkdtempSync(path.join(tmpdir(), "critter-crumbs-regrowth-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync("git", ["-C", root, ...args], { env: gitEnvironment, encoding: "utf8" });
  const write = (file, text) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  };
  git("init", "-q", "-b", "main");
  return { root, git, write };
}

test("new markdown belongs in docs/ outside the report folders, in guidance folders, or under a conventional name", () => {
  for (const file of [
    "docs/adr/0007-x.md",
    "packages/app/README.md",
    ".agents/skills/review/SKILL.md",
    ".github/pull_request_template.md",
    "CONTEXT.md",
  ]) {
    assert.equal(fileProblem(file), null, file);
  }
  for (const file of [
    "AUDIT_NOTES.md",
    "docs/reviews/january-qa/README.md",
    "docs/research/new-finding.md",
    "packages/app/notes.md",
    "scripts/handoff.md",
    ".claude/audit-2026-11-21.md",
  ]) {
    assert.ok(fileProblem(file), file);
  }
});

test("new media belongs only with the app's own assets", () => {
  assert.equal(fileProblem("packages/app/public/images/arrival.webp"), null);
  for (const file of [
    "docs/explorations/x/capture.jpg",
    "docs/pitch/deck.pdf",
    "tests/e2e/shot.png",
    "README-cover.png",
  ]) {
    assert.ok(fileProblem(file), file);
  }
});

test("app source excludes tests, declarations and generated files", () => {
  assert.ok(isAppSource("packages/app/src/game/layout.ts"));
  assert.ok(isAppSource("api/me.ts"));
  for (const file of [
    "packages/app/test/layout.test.ts",
    "tests/api/ballots.test.ts",
    "packages/core/src/types.d.ts",
    "scripts/lint.mjs",
  ]) {
    assert.ok(!isAppSource(file), file);
  }
});

test("added lines come from each hunk's new-file range", () => {
  const diff = "@@ -3,0 +4,2 @@\n+a\n+b\n@@ -10 +12 @@\n-x\n+y\n@@ -20,3 +23,0 @@\n-p\n";
  assert.deepEqual([...addedLines(diff)], [4, 5, 12]);
});

test("only purge-shaped comments on added lines count, and a comment whose place carries meaning stays", () => {
  const code = [
    "// ===== Setup =====",
    "const a = 1;",
    "// Submit batch transaction",
    "const b = 2; // explains b",
    "// Safari drops the event when the tab is hidden, so poll instead.",
    "const c = a + b;",
  ].join("\n");
  assert.deepEqual(
    regrownComments(code, "packages/app/src/x.ts", "all").map((comment) => comment.line),
    [1, 3]
  );
  assert.deepEqual(
    regrownComments(code, "packages/app/src/x.ts", new Set([3, 4, 5, 6])).map(
      (comment) => comment.line
    ),
    [3]
  );
});

test("a planted banner and a planted AUDIT_NOTES.md fail, naming the line and the file", (t) => {
  const { root, git, write } = scratch(t);
  write("packages/app/src/old.ts", "// ===== Old banner =====\nexport const a = 1;\n");
  write("docs/reviews/october-qa/README.md", "kept as it was\n");
  git("add", ".");
  git("commit", "-q", "-m", "base");
  const base = git("rev-parse", "HEAD").trim();
  assert.deepEqual(judge(root, base).problems, []);

  write(
    "packages/app/src/old.ts",
    "// ===== Old banner =====\nexport const a = 1;\n// ===== New banner =====\nexport const b = 2;\n"
  );
  write("AUDIT_NOTES.md", "findings\n");
  write("docs/reviews/october-qa/README.md", "edited, not added\n");
  write("docs/explorations/capture.png", "not really a png\n");
  const { problems } = judge(root, base);
  assert.equal(problems.length, 3, problems.join("\n"));
  assert.ok(
    problems.some((problem) => problem.startsWith("packages/app/src/old.ts:3: new banner comment"))
  );
  assert.ok(problems.some((problem) => problem.startsWith("AUDIT_NOTES.md: reads as a report")));
  assert.ok(
    problems.some((problem) => problem.startsWith("docs/explorations/capture.png: is new media"))
  );
});

test("a move adds nothing, and neither does re-indenting old comments", (t) => {
  const { root, git, write } = scratch(t);
  const flow = "const a = 1;\n// Submit batch transaction\nconst b = a + 1;\nconsole.log(b);\n";
  write("packages/app/src/flow.ts", flow);
  write("packages/app/src/other.ts", flow);
  git("add", ".");
  git("commit", "-q", "-m", "base");
  const base = git("rev-parse", "HEAD").trim();
  git("mv", "packages/app/src/flow.ts", "packages/app/src/moved.ts");
  write(
    "packages/app/src/other.ts",
    "function run() {\n  const a = 1;\n  // Submit batch transaction\n  const b = a + 1;\n  return b;\n}\nrun();\n"
  );
  assert.deepEqual(judge(root, base).problems, []);
  write(
    "packages/app/src/other.ts",
    "function run() {\n  const a = 1;\n  // Submit batch transaction\n  const b = a + 1;\n  // Return the result\n  return b;\n}\nrun();\n"
  );
  assert.deepEqual(
    judge(root, base).problems.map((problem) => problem.split(",")[0]),
    ["packages/app/src/other.ts:5: new label comment"]
  );
});
