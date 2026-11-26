#!/usr/bin/env node
// Stops what the purge removed from growing back, judged only on what a change adds. Ported from
// Green Goods' scripts/quality/check-regrowth.mjs (#1752):
//
// - Comments the comment codemod's narrow pass removes (banners, commented-out code, labels and
//   notes that restate a name) on added lines of app source (`packages/*/src`, `api/`, tests
//   aside). The codemod decides, so a comment whose place carries its meaning stays allowed.
// - New markdown under docs/reviews/ or docs/research/ (dated reports, which the purge moves out),
//   and new markdown outside docs/ that reads as a report or is not a conventional name.
// - New media and other binaries anywhere but the app's own assets (packages/app/public/audio,
//   fonts, icons and scenes), and reports in other text formats (.html, .txt).
//
// Existing text is not judged: a file is compared with the merge base, so only its added lines
// and added files count.
//
//   node scripts/check-regrowth.mjs [--base <ref>]
//
// CI names its base in REGROWTH_BASE_REF; when that does not resolve the check fails rather than
// judge nothing.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { purgeSource } from "./comment-policy.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

const APP_SOURCE = /^(packages\/[^/]+\/src\/|api\/).+\.(ts|tsx|js|jsx|mjs|cjs|mts|cts)$/;
const TEST_PATH = /(^|\/)(__tests__|__mocks__|test|tests)\/|\.(test|spec|stories)\.[cm]?[jt]sx?$/;
const GENERATED = /\.d\.[cm]?ts$|(^|\/)(generated|vendor|dist)\/|\.generated\./;

const MARKDOWN = /\.(md|mdx)$/i;
// A report can be written in any text format a browser or editor opens.
const REPORT_FORMAT = /\.(md|mdx|markdown|html?|txt)$/i;
const REPORT_FOLDERS = ["docs/reviews/", "docs/research/"];
const GUIDANCE_FOLDERS = [".claude/", ".agents/", ".codex/", ".github/"];
const SKILL_FOLDERS = [".claude/skills/", ".agents/skills/"];
const CONVENTIONAL_NAMES =
  /^(README|AGENTS|CLAUDE|CONTEXT|DESIGN[\w.-]*|SKILL|ARCHITECTURE|CHANGELOG|MODULES|CONTRIBUTING|SECURITY|CODE_OF_CONDUCT|LICENSES?)\.mdx?$/i;
const REPORT_NAME =
  /(^|[-_.\s])(report|reports|audit|audits|findings|summary|analysis|handoff|handover|retro|retrospective|postmortem|investigation|status|notes)([-_.\s]|$)|\d{4}-\d{2}-\d{2}/i;
const MEDIA =
  /\.(jpe?g|png|webp|gif|avif|heic|heif|svg|tiff?|bmp|ico|psd|mp3|mp4|m4a|aac|flac|wav|ogg|opus|webm|mkv|mov|avi|pdf|pptx?|key|docx?|xlsx?|zip)$/i;
// The app's own assets; anything else binary is a capture, a recording or a deck.
const MEDIA_HOMES = [
  "packages/app/public/audio/",
  "packages/app/public/fonts/",
  "packages/app/public/icons/",
  "packages/app/public/scenes/",
];

function runGit(root, args, { allowFailure = false } = {}) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error && !allowFailure)
    throw new Error(`git ${args.join(" ")} failed: ${result.error.message}`);
  if (result.status !== 0 && !allowFailure)
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  return result;
}

const resolves = (root, ref) =>
  runGit(root, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], { allowFailure: true })
    .status === 0;

export function isAppSource(file) {
  return APP_SOURCE.test(file) && !TEST_PATH.test(file) && !GENERATED.test(file);
}

/** Why a new file may not be added where it is, or null when it may. */
export function fileProblem(file, { binary = false } = {}) {
  if (MEDIA.test(file) || binary) {
    if (MEDIA_HOMES.some((home) => file.startsWith(home))) return null;
    return "is new media or another binary; keep captures, recordings and decks outside git and link them from the docs";
  }
  if (!REPORT_FORMAT.test(file)) return null;
  if (REPORT_FOLDERS.some((folder) => file.startsWith(folder))) {
    return "is a new dated report; put findings in the pull request, or ask afo where they go";
  }
  // Skills keep their templates, and .github its issue and pull request templates.
  if (SKILL_FOLDERS.some((folder) => file.startsWith(folder)) || file.startsWith(".github/"))
    return null;
  const name = path.posix.basename(file);
  if (REPORT_NAME.test(name.replace(REPORT_FORMAT, ""))) {
    return "reads as a report; put findings in the pull request, or ask afo where they go";
  }
  if (file.startsWith("docs/") || !MARKDOWN.test(file)) return null;
  if (GUIDANCE_FOLDERS.some((folder) => file.startsWith(folder))) return null;
  if (CONVENTIONAL_NAMES.test(name)) return null;
  return "is new markdown outside docs/; put documentation in docs/";
}

/** Changed paths git reads as binary against the base, untracked files by a NUL in their first bytes. */
export function binaryPaths(root, ref) {
  const binary = new Set();
  const numstat = runGit(root, ["diff", "--numstat", "--no-renames", "-z", ref]).stdout.split("\0");
  for (const entry of numstat) {
    const match = /^-\t-\t(.+)$/.exec(entry);
    if (match) binary.add(match[1]);
  }
  const untracked = runGit(root, ["ls-files", "--others", "--exclude-standard", "-z"])
    .stdout.split("\0")
    .filter(Boolean);
  for (const file of untracked) {
    const absolute = path.join(root, file);
    if (existsSync(absolute) && readFileSync(absolute).subarray(0, 8000).includes(0))
      binary.add(file);
  }
  return binary;
}

/** Line numbers (1-based, in the new file) that a unified diff with no context adds. */
export function addedLines(diff) {
  const lines = new Set();
  for (const match of diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = Number(match[1]);
    const count = match[2] === undefined ? 1 : Number(match[2]);
    for (let line = start; line < start + count; line += 1) lines.add(line);
  }
  return lines;
}

function lineOf(code, index) {
  return code.slice(0, index).split(/\r\n|[\n\r\u2028\u2029]/).length;
}

/** The comments the narrow purge would remove whose first line the change added. */
export function regrownComments(code, file, added) {
  return purgeSource(code, file)
    .removed.map((comment) => ({
      line: lineOf(code, comment.start),
      kind: comment.kind,
      text: code.slice(comment.start, comment.end),
    }))
    .filter((comment) => added === "all" || added.has(comment.line));
}

/**
 * Paths the change adds or modifies, committed and uncommitted work and untracked files too, as
 * `{ how, from }`: a rename or copy is judged against the file it came from, so a move adds nothing.
 */
export function changedPaths(root, ref) {
  const entries = new Map();
  const status = runGit(root, ["diff", "--name-status", "-M", "-z", ref])
    .stdout.split("\0")
    .filter(Boolean);
  for (let index = 0; index < status.length; ) {
    const how = status[index][0];
    if (how === "R" || how === "C") {
      entries.set(status[index + 2], { how, from: status[index + 1] });
      index += 3;
    } else {
      entries.set(status[index + 1], { how, from: null });
      index += 2;
    }
  }
  const untracked = runGit(root, ["ls-files", "--others", "--exclude-standard", "-z"])
    .stdout.split("\0")
    .filter(Boolean);
  for (const file of untracked) entries.set(file, { how: "A", from: null });
  return entries;
}

export function judge(root, ref) {
  const problems = [];
  let sourceFiles = 0;
  const binary = binaryPaths(root, ref);
  for (const [file, { how, from }] of changedPaths(root, ref)) {
    if (how === "D") continue;
    // A move lands a file somewhere new, unless it was already where it may not be.
    if (how === "A" || (from && !fileProblem(from))) {
      const problem = fileProblem(file, { binary: binary.has(file) });
      if (problem) problems.push(`${file}: ${problem}.`);
    }
    if (!isAppSource(file)) continue;
    const absolute = path.join(root, file);
    if (!existsSync(absolute)) continue;
    sourceFiles += 1;
    const code = readFileSync(absolute, "utf8");
    // Whitespace is ignored, so re-indenting old comments (wrapping code in a block) adds none.
    const paths = from ? [from, file] : [file];
    const added =
      how === "A"
        ? "all"
        : addedLines(
            runGit(root, ["diff", "-U0", "-w", "-M", "--no-color", ref, "--", ...paths]).stdout
          );
    let comments;
    try {
      comments = regrownComments(code, file, added);
    } catch (error) {
      problems.push(`${file}: could not be parsed for comments (${error.message}).`);
      continue;
    }
    for (const comment of comments) {
      const shown = comment.text.split(/\r?\n/)[0].slice(0, 100);
      problems.push(
        `${file}:${comment.line}: new ${comment.kind} comment, which the purge removed: ${shown}`
      );
    }
  }
  return { problems, sourceFiles };
}

export function main(argv = process.argv.slice(2), { root = repoRoot } = {}) {
  let explicitBase;
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === "--base" && argv[index + 1]) explicitBase = argv[++index];
    else throw new Error(`unknown argument: ${argv[index]}`);
  }
  const candidates = [explicitBase, process.env.REGROWTH_BASE_REF, "origin/main"].filter(Boolean);
  const base = candidates.find((ref) => resolves(root, ref));
  const required = explicitBase ?? process.env.REGROWTH_BASE_REF;
  if (!base || (required && base !== required)) {
    console.error(
      `regrowth: the base ${required ?? "origin/main"} is not available, so nothing can be compared with it`
    );
    return 2;
  }
  const ref =
    runGit(root, ["merge-base", "HEAD", base], { allowFailure: true }).stdout.trim() || base;
  const { problems, sourceFiles } = judge(root, ref);
  for (const problem of problems) console.error(`regrowth: ${problem}`);
  if (problems.length) {
    console.error(
      "regrowth: delete the comment (the code or a name should carry it), and keep reports and media out of git."
    );
    return 1;
  }
  console.log(`regrowth: nothing regrown since ${base} (${sourceFiles} app source file(s) read).`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`regrowth check could not run: ${error.message}`);
    process.exitCode = 2;
  }
}
