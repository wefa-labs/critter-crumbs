// No source line runs past 200 characters. Biome formats to 100 columns but cannot break a long
// string, so this holds the line the formatter cannot, outside docs/ and the vendored selector.
// The exceptions are lines whose literal must stay whole; each names why.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const LIMIT = 200;
const EXCEPTIONS = {
  "packages/app/src/styles/tokens.ts":
    "generated from tokens.json by scripts/generate-tokens.mjs; one data URL",
  "packages/app/src/styles/tokens.css":
    "generated from tokens.json by scripts/generate-tokens.mjs; one data URL",
  "packages/core/src/eas/reader.ts": "viem's parseAbi infers types from each whole ABI string",
  "packages/shared/src/copy.ts":
    "a prompt whose literal type carries its {slots}; split, it would lose them",
  "packages/app/src/crypto/timelock.ts":
    "a known-answer ciphertext, typed as Hex, that has no place to break",
};

const files = execFileSync(
  "git",
  [
    "ls-files",
    "--",
    "*.ts",
    "*.tsx",
    "*.js",
    "*.mjs",
    "*.cjs",
    "*.css",
    ":!docs",
    ":!scripts/select-checks.mjs",
  ],
  { encoding: "utf8" }
)
  .split("\n")
  .filter(Boolean);

test(`no source line is longer than ${LIMIT} characters`, () => {
  const long = [];
  for (const file of files) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, index) => {
        if (line.length > LIMIT) long.push({ file, line: index + 1, length: line.length });
      });
  }
  const unexplained = long
    .filter(({ file }) => !EXCEPTIONS[file])
    .map(({ file, line, length }) => `${file}:${line} is ${length} characters`);
  assert.deepEqual(unexplained, []);
  for (const { file } of long)
    assert.equal(
      long.filter((entry) => entry.file === file).length,
      1,
      `${file} may hold one long line, its exception`
    );
});

test("every exception still has its long line, so the list only shrinks", () => {
  for (const file of Object.keys(EXCEPTIONS)) {
    assert.ok(
      readFileSync(file, "utf8")
        .split("\n")
        .some((line) => line.length > LIMIT),
      `${file} no longer needs its exception; remove it`
    );
  }
});
