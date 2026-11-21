#!/usr/bin/env node
// check-selector: prints the checks a change needs, by risk tier and intent, from a
// repository's validation policy.
//
//   node select.mjs [--policy <file>] [--paths a,b | --base <rev>] [--intent <intent>] [--json]
//
// This is Green Goods' `bun run check --plan` (scripts/quality/select-validation.mjs and the
// plan half of scripts/dev/ci-local.js, develop at b9519b2) with Green Goods' repository
// layout moved out of the code and into data, so another repository can describe its own.
// It plans only: it runs no check and inspects no tool or service, so a check is blocked
// only when a capability it needs is declared false with --capability.
//
// One file with no dependencies, Node 22 or later. README.md beside it describes the
// policy format and how a repository adopts it.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readlinkSync } from 'node:fs';
import { cpus, loadavg } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const DEFAULT_POLICY_PATH = 'scripts/data/validation-policy.json';
const DEFAULT_INTENT = 'ship';
// The intents and tiers the planner gives meaning to. A policy's intentOrder and riskOrder
// say which of them it uses.
const INTENTS = ['diagnose', 'qa', 'review', 'checkpoint', 'readiness', 'push', 'ship', 'merge', 'release'];
const TIERS = ['routine', 'sensitive', 'critical'];
const EVIDENCE_INTENTS = new Set(['diagnose', 'review']);
// Readiness, ship, merge and release certify a change, so their suites run fresh.
const FRESH_RUN_INTENTS = new Set(['readiness', 'ship', 'merge', 'release']);
// The intents whose unfocused surface suites run through the surface's wholeSuiteCommand.
const WHOLE_SUITE_INTENTS = new Set(['checkpoint', 'readiness', 'push', 'ship', 'merge']);
// A focused suite is budgeted at this many seconds in a fast push, and at the second elsewhere.
const FOCUSED_PUSH_SUITE_SECONDS = 30;
const FOCUSED_SUITE_SECONDS = 60;
// A full working-copy fingerprint of a large documentation or asset change outgrows Node's
// default child-process buffer.
const GIT_OUTPUT_MAX_BUFFER = 64 * 1024 * 1024;
// A pre-push hook in a linked worktree exports these; clearing them lets the working
// directory decide which repository git reads.
const REPOSITORY_LOCAL_GIT_VARIABLES = [
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_CONFIG', 'GIT_CONFIG_PARAMETERS', 'GIT_CONFIG_COUNT',
  'GIT_OBJECT_DIRECTORY', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_IMPLICIT_WORK_TREE', 'GIT_GRAFT_FILE',
  'GIT_INDEX_FILE', 'GIT_NO_REPLACE_OBJECTS', 'GIT_REPLACE_REF_BASE', 'GIT_PREFIX',
  'GIT_INTERNAL_SUPER_PREFIX', 'GIT_SHALLOW_FILE', 'GIT_COMMON_DIR',
];

// Green Goods' layout, transcribed from the constants in its select-validation.mjs. Its policy
// carries no layout block yet, so it plans with `--layout green-goods` (or `"layout":
// "green-goods"` in the policy) until that block moves into the policy itself.
const GREEN_GOODS_LAYOUT = {
  surfaces: [
    {
      id: 'contracts',
      root: 'packages/contracts/',
      checks: ['contracts-build', 'contracts-test'],
      strictChecks: ['abi-artifacts', 'contracts-verify-fast'],
      fullGate: true,
      focusedCommand: 'bun run test --suite solidity --profile match {path}',
    },
    {
      id: 'shared',
      root: 'packages/shared/',
      checks: ['shared-typecheck', 'shared-test'],
      build: 'shared-build',
      typecheck: 'shared-typecheck',
      testTypecheck: 'shared-test-typecheck',
      wholeSuiteCommand: 'node ../../node_modules/.bin/turbo run test --filter=@green-goods/shared --output-logs=new-only{force}',
    },
    {
      id: 'indexer',
      root: 'packages/indexer/',
      checks: ['indexer-test'],
      build: 'indexer-build',
      // Envio codegen plus `tsc --noEmit` is the Indexer's only typecheck.
      typecheck: 'indexer-build',
      wholeSuiteCommand: 'node ../../node_modules/.bin/turbo run test --filter=@green-goods/indexer --output-logs=new-only{force}',
      focusedCommand: '{command} --scope handlers {paths}',
    },
    {
      id: 'client',
      root: 'packages/client/',
      checks: ['client-test'],
      build: 'client-build',
      typecheck: 'client-typecheck',
      testTypecheck: 'client-test-typecheck',
      ui: true,
      wholeSuiteCommand: 'node ../../node_modules/.bin/turbo run test --filter=@green-goods/client --output-logs=new-only{force}',
    },
    {
      id: 'admin',
      root: 'packages/admin/',
      checks: ['admin-test'],
      build: 'admin-build',
      typecheck: 'admin-typecheck',
      testTypecheck: 'admin-test-typecheck',
      ui: true,
      wholeSuiteCommand: 'node ../../node_modules/.bin/turbo run test --filter=@green-goods/admin --output-logs=new-only{force}',
    },
    {
      id: 'agent',
      root: 'packages/agent/',
      checks: ['agent-typecheck', 'agent-test'],
      build: 'agent-build',
      typecheck: 'agent-typecheck',
      testTypecheck: 'agent-test-typecheck',
      qaBuild: 'source',
      wholeSuiteCommand: 'node ../../node_modules/.bin/turbo run test --filter=@green-goods/agent --output-logs=new-only{force}',
    },
    {
      id: 'docs',
      root: 'docs/',
      source: null,
      manifest: null,
      checks: ['docs-authority', 'docs-test', 'docs-build'],
      qaChecks: ['docs-authority', 'docs-build'],
      ownerProof: 'docs-authority',
      // Docs tests have no focused mode and always run whole.
      focusable: false,
      wholeSuiteCommand: 'node ../node_modules/.bin/turbo run test --filter=@green-goods/docs --output-logs=new-only{force}',
    },
  ],
  lockfiles: ['bun.lock', 'bun.lockb'],
  rootConfigs: ['biome.json', 'env.schema', 'tsconfig.json', 'tsconfig.base.json'],
  publicSource: ['packages/shared/src/**/index.ts'],
  sourceGlobs: ['packages/*/src/**'],
  directTests: {
    'scripts/ops/dependabot-sync.test.mjs': 'dependabot-sync-test',
    'scripts/harness/agent-hooks.test.mjs': 'review-guardrails-test',
    'scripts/lib/env-schema.test.mjs': 'env-schema-test',
    'scripts/lib/dev-shared.test.mjs': 'validation-system-test',
    'scripts/quality/select-validation.test.mjs': 'validation-system-test',
    'scripts/dev/ci-local.test.mjs': 'validation-system-test',
    'scripts/dev/surface-leases.test.mjs': 'validation-system-test',
    'scripts/quality/ci-gate.test.mjs': 'validation-system-test',
    'scripts/quality/check-commit-identity.test.mjs': 'validation-system-test',
    'scripts/quality/classify-supply-chain-changes.mjs': 'validation-system-test',
    'scripts/quality/workflow-performance-parity.test.mjs': 'validation-system-test',
  },
  pathChecks: [{ check: 'staged-modules', prefixes: ['packages/client/src/'], reason: 'client:staged-boundary' }],
  hygiene: {
    format: {
      check: 'format',
      fullCommand: 'bunx @biomejs/biome format .',
      scopedCommand: 'bunx @biomejs/biome format --no-errors-on-unmatched {paths}',
      emptyCommand: `node -e "console.log('format: no existing changed paths')"`,
      scopedBudgetSeconds: 10,
    },
    lint: {
      check: 'lint',
      extensions: ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'],
      sourcePrefixes: [
        'packages/client/src/', 'packages/admin/src/', 'packages/shared/src/',
        'packages/indexer/src/', 'packages/agent/src/', 'packages/contracts/script/',
      ],
      sourceCommand: 'bun --bun run oxlint {paths} --deny-warnings',
      scopedCommand: 'bunx @biomejs/biome lint --no-errors-on-unmatched {paths}',
      emptyCommand: `node -e "console.log('lint: no existing changed paths')"`,
      scopedBudgetSeconds: 15,
    },
  },
  stories: { check: 'story-quality', buildCheck: 'storybook-build' },
  conditional: {
    excludeValidationOnly: ['browser-proof', 'ontology', 'source-structure', 'design-guardrails'],
    skipOnFastPush: ['design-guardrails', 'supply-chain'],
    alwaysInQa: ['browser-proof', 'ontology'],
  },
  workflows: { countValidationOnly: ['Supply Chain Guardrails'], countStories: ['Design'] },
  // A push is a thin pre-check (Green Goods D16): these belong to the named pull-request
  // workflow when that workflow is expected for the change.
  ciOwnedOnPush: {
    'shared-build': { workflow: null, reason: 'the Shared build is a no-op' },
    'client-build': 'Client',
    'admin-build': 'Admin',
    'agent-build': 'Agent',
    'storybook-build': 'Design',
    'browser-passkey': 'Client',
    'browser-work-exploration': 'Client',
    'browser-pwa-preview': 'Client',
    'shared-test': 'Shared',
    'client-test': 'Client',
    'admin-test': 'Admin',
    'agent-test': 'Agent',
    'indexer-test': 'Indexer',
    'docs-test': 'Docs',
    'docs-build': 'Docs',
  },
  baseArguments: { 'source-structure': '{command} --base {base}' },
  contentCriticalRule: 'shared-signing-money-queue-auth',
  toolchain: { bun: { command: 'bun' } },
};

export const LAYOUT_PRESETS = Object.freeze({ 'green-goods': GREEN_GOODS_LAYOUT });

// ---------------------------------------------------------------------------------------------
// Policy

export function loadPolicy(policyPath = DEFAULT_POLICY_PATH) {
  let text;
  try {
    text = readFileSync(policyPath, 'utf8');
  } catch (error) {
    throw new Error(`Cannot read validation policy ${policyPath}: ${error.code ?? error.message}`);
  }
  let policy;
  try {
    policy = JSON.parse(text);
  } catch (error) {
    throw new Error(`Validation policy ${policyPath} is not valid JSON: ${error.message}`);
  }
  validatePolicy(policy);
  return policy;
}

export function validatePolicy(policy) {
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) {
    throw new Error('Validation policy must be a JSON object');
  }
  if (!Number.isInteger(policy.version) || policy.version < 1) {
    throw new Error('Validation policy must have a positive integer version');
  }
  if (
    !Array.isArray(policy.intentOrder) ||
    policy.intentOrder.length === 0 ||
    policy.intentOrder.some((intent) => !INTENTS.includes(intent))
  ) {
    throw new Error(`Validation policy intentOrder must list intents from: ${INTENTS.join(', ')}`);
  }
  const tierPositions = TIERS.map((tier) => (Array.isArray(policy.riskOrder) ? policy.riskOrder.indexOf(tier) : -1));
  if (tierPositions.some((position, index) => position < 0 || (index > 0 && position < tierPositions[index - 1]))) {
    throw new Error('Validation policy riskOrder must list routine, sensitive and critical, in that order');
  }
  if (!Array.isArray(policy.checks) || policy.checks.length === 0) {
    throw new Error('Validation policy must define checks');
  }

  const ids = new Set();
  for (const check of policy.checks) {
    if (!check?.id || ids.has(check.id)) {
      throw new Error(`Validation policy contains an invalid or duplicate check id: ${check?.id}`);
    }
    ids.add(check.id);
    for (const field of ['risk', 'expectedSignal', 'freshness', 'stopRule']) {
      if (!check[field]) throw new Error(`Validation check ${check.id} is missing ${field}`);
    }
    if (!Number.isFinite(check.budgetSeconds) || check.budgetSeconds <= 0) {
      throw new Error(`Validation check ${check.id} must have a positive budgetSeconds`);
    }
  }

  for (const rule of policy.riskRules ?? []) {
    if (!policy.riskOrder.includes(rule.risk)) throw new Error(`Validation risk rule names unknown risk ${rule.risk}`);
  }
  for (const rule of policy.surfaceRules ?? []) {
    if (typeof rule.surface !== 'string' || !rule.surface) throw new Error('Validation surface rule needs a surface');
  }
  for (const rule of [...(policy.conditionalRules ?? []), ...(policy.criticalOverrides ?? [])]) {
    for (const id of rule.checks ?? [rule.check]) {
      if (!ids.has(id)) throw new Error(`Validation rule references unknown check ${id}`);
    }
    if (rule.intents !== undefined) {
      if (!Array.isArray(rule.intents) || rule.intents.length === 0) {
        throw new Error('Validation rule intents must be a non-empty array');
      }
      for (const intent of rule.intents) {
        if (!policy.intentOrder.includes(intent)) throw new Error(`Validation rule references unknown intent ${intent}`);
      }
    }
    for (const flag of ['runInQa', 'runInEvidence']) {
      if (rule[flag] !== undefined && typeof rule[flag] !== 'boolean') {
        throw new Error(`Validation rule ${flag} must be boolean`);
      }
    }
  }
  for (const rule of policy.criticalOverrides ?? []) {
    if (!policy.riskOrder.includes(rule.risk)) throw new Error(`Validation critical override names unknown risk ${rule.risk}`);
  }
}

// ---------------------------------------------------------------------------------------------
// Layout: what the planner knows about a repository's surfaces beyond the policy's rules.

const NORMALIZED = Symbol('normalized layout');

/**
 * The layout a plan uses: `layout` (a preset name or an object) when given, otherwise the
 * policy's own `layout`, otherwise none. Every check it names must exist in the policy.
 */
export function resolveLayout(policy, layout = policy.layout) {
  if (layout?.[NORMALIZED]) return layout;
  let raw = layout ?? {};
  if (typeof raw === 'string') {
    if (!Object.hasOwn(LAYOUT_PRESETS, raw)) {
      throw new Error(`Unknown layout preset ${raw}; known presets: ${Object.keys(LAYOUT_PRESETS).join(', ')}`);
    }
    raw = LAYOUT_PRESETS[raw];
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Validation layout must be an object or a preset name');

  const checkIds = new Set(policy.checks.map((check) => check.id));
  const problems = [];
  const check = (value, where) => {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string' || !checkIds.has(value)) problems.push(`${where} names unknown check ${JSON.stringify(value)}`);
    return value;
  };
  const checks = (values, where) => {
    if (values === undefined) return [];
    if (!Array.isArray(values)) {
      problems.push(`${where} must be a list of check ids`);
      return [];
    }
    return values.map((value, index) => check(value, `${where}[${index}]`));
  };
  const strings = (values, where) => {
    if (values === undefined) return [];
    if (!Array.isArray(values) || values.some((value) => typeof value !== 'string' || !value)) {
      problems.push(`${where} must be a list of strings`);
      return [];
    }
    return [...values];
  };
  const text = (value, where) => {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string' || !value) problems.push(`${where} must be a string`);
    return value;
  };

  const seen = new Set();
  const surfaces = (Array.isArray(raw.surfaces) ? raw.surfaces : []).map((surface, index) => {
    const where = `layout.surfaces[${index}]`;
    const id = surface?.id;
    if (typeof id !== 'string' || !id || id === 'all' || seen.has(id)) {
      problems.push(`${where} needs a unique id other than "all"`);
    }
    seen.add(id);
    const root = surface?.root;
    if (typeof root !== 'string' || !root.endsWith('/')) problems.push(`${where}.root must be a directory ending in "/"`);
    const qaBuild = surface?.qaBuild ?? (surface?.ui === true ? 'entry' : null);
    if (qaBuild !== null && !['entry', 'source'].includes(qaBuild)) problems.push(`${where}.qaBuild must be "entry" or "source"`);
    return Object.freeze({
      id,
      root,
      source: surface?.source === undefined ? `${root}src/` : text(surface.source, `${where}.source`),
      manifest: surface?.manifest === undefined ? `${root}package.json` : text(surface.manifest, `${where}.manifest`),
      checks: checks(surface?.checks, `${where}.checks`),
      qaChecks: surface?.qaChecks === undefined ? null : checks(surface.qaChecks, `${where}.qaChecks`),
      build: check(surface?.build, `${where}.build`),
      typecheck: check(surface?.typecheck, `${where}.typecheck`),
      testTypecheck: check(surface?.testTypecheck, `${where}.testTypecheck`),
      strictChecks: checks(surface?.strictChecks, `${where}.strictChecks`),
      ownerProof: check(surface?.ownerProof, `${where}.ownerProof`),
      wholeSuiteCommand: text(surface?.wholeSuiteCommand, `${where}.wholeSuiteCommand`),
      focusedCommand: text(surface?.focusedCommand, `${where}.focusedCommand`) ?? '{command} {paths}',
      focusable: surface?.focusable !== false,
      fullGate: surface?.fullGate === true,
      ui: surface?.ui === true,
      qaBuild,
    });
  });
  if (raw.surfaces !== undefined && !Array.isArray(raw.surfaces)) problems.push('layout.surfaces must be a list');

  const hygiene = raw.hygiene ?? {};
  const hygieneEntry = (entry, name) => {
    if (entry === undefined || entry === null) return null;
    const where = `layout.hygiene.${name}`;
    if (!entry.check) problems.push(`${where} needs a check`);
    return Object.freeze({
      check: check(entry.check, `${where}.check`),
      fullCommand: text(entry.fullCommand, `${where}.fullCommand`),
      scopedCommand: text(entry.scopedCommand, `${where}.scopedCommand`),
      sourceCommand: text(entry.sourceCommand, `${where}.sourceCommand`),
      emptyCommand: text(entry.emptyCommand, `${where}.emptyCommand`),
      extensions: strings(entry.extensions, `${where}.extensions`),
      sourcePrefixes: strings(entry.sourcePrefixes, `${where}.sourcePrefixes`),
      scopedBudgetSeconds: Number.isFinite(entry.scopedBudgetSeconds) ? entry.scopedBudgetSeconds : null,
    });
  };

  const ciOwnedOnPush = {};
  for (const [id, owner] of Object.entries(raw.ciOwnedOnPush ?? {})) {
    check(id, `layout.ciOwnedOnPush.${id}`);
    const entry = typeof owner === 'string' || owner === null ? { workflow: owner } : owner;
    if (!entry || (entry.workflow !== null && typeof entry.workflow !== 'string')) {
      problems.push(`layout.ciOwnedOnPush.${id} must name a workflow or { "workflow": null, "reason": "..." }`);
      continue;
    }
    ciOwnedOnPush[id] = Object.freeze({ workflow: entry.workflow, reason: entry.reason ?? null });
  }

  const directTests = {};
  for (const [testPath, id] of Object.entries(raw.directTests ?? {})) directTests[testPath] = check(id, `layout.directTests.${testPath}`);
  const pathChecks = (Array.isArray(raw.pathChecks) ? raw.pathChecks : []).map((entry, index) => Object.freeze({
    check: check(entry?.check, `layout.pathChecks[${index}].check`),
    prefixes: strings(entry?.prefixes, `layout.pathChecks[${index}].prefixes`),
    reason: entry?.reason ?? `path:${entry?.check}`,
  }));
  const baseArguments = {};
  for (const [id, template] of Object.entries(raw.baseArguments ?? {})) {
    check(id, `layout.baseArguments.${id}`);
    baseArguments[id] = text(template, `layout.baseArguments.${id}`);
  }
  const contentCriticalRule = raw.contentCriticalRule ?? null;
  if (contentCriticalRule !== null && !(policy.criticalOverrides ?? []).some((rule) => rule.id === contentCriticalRule)) {
    problems.push(`layout.contentCriticalRule names unknown critical override ${contentCriticalRule}`);
  }
  const toolchain = {};
  for (const [tool, rule] of Object.entries(raw.toolchain ?? {})) {
    toolchain[tool] = Object.freeze({ command: rule?.command ?? null, capability: rule?.capability ?? null });
  }

  if (problems.length > 0) throw new Error(`Validation layout is invalid: ${problems.join('; ')}`);

  const order = surfaces.map((surface) => surface.id);
  const undescribed = [];
  for (const rule of policy.surfaceRules ?? []) {
    if (rule.surface === 'all' || order.includes(rule.surface)) continue;
    order.push(rule.surface);
    undescribed.push(rule.surface);
  }
  const warnings = undescribed.length === 0 ? [] : [
    `surfaceRules name surfaces the layout does not describe (${undescribed.join(', ')}), so they select no checks; describe them in the policy's "layout" (Green Goods: --layout green-goods)`,
  ];
  const conditional = raw.conditional ?? {};
  const workflows = raw.workflows ?? {};
  const stories = raw.stories ?? {};

  return Object.freeze({
    [NORMALIZED]: true,
    surfaces,
    byId: new Map(surfaces.map((surface) => [surface.id, surface])),
    order,
    warnings,
    lockfiles: strings(raw.lockfiles, 'layout.lockfiles'),
    rootConfigs: strings(raw.rootConfigs, 'layout.rootConfigs'),
    publicSource: strings(raw.publicSource, 'layout.publicSource'),
    sourceGlobs: strings(raw.sourceGlobs, 'layout.sourceGlobs'),
    directTests,
    pathChecks,
    hygiene: Object.freeze({ format: hygieneEntry(hygiene.format, 'format'), lint: hygieneEntry(hygiene.lint, 'lint') }),
    stories: Object.freeze({ check: check(stories.check, 'layout.stories.check'), buildCheck: check(stories.buildCheck, 'layout.stories.buildCheck') }),
    conditional: Object.freeze({
      excludeValidationOnly: strings(conditional.excludeValidationOnly, 'layout.conditional.excludeValidationOnly'),
      skipOnFastPush: strings(conditional.skipOnFastPush, 'layout.conditional.skipOnFastPush'),
      alwaysInQa: strings(conditional.alwaysInQa, 'layout.conditional.alwaysInQa'),
    }),
    workflows: Object.freeze({
      countValidationOnly: strings(workflows.countValidationOnly, 'layout.workflows.countValidationOnly'),
      countStories: strings(workflows.countStories, 'layout.workflows.countStories'),
    }),
    ciOwnedOnPush,
    baseArguments,
    contentCriticalRule,
    toolchain,
  });
}

// ---------------------------------------------------------------------------------------------
// Paths and rules

function normalizePath(value) {
  return String(value).replaceAll('\\', '/').replace(/^\.\//, '');
}

function normalizePaths(paths = []) {
  return [...new Set(paths.filter(Boolean).map(normalizePath))].sort();
}

// A manual check with no command is evidence a person records, not a process a runner can
// execute; the policy marks it advisory and every intent but release reports it pending.
export function isAdvisoryManualCheck(check) {
  return check?.manual === true && check.command === null && check.stopRule === 'advisory';
}

function isTestPath(file) {
  return /(^|\/)(__tests__|test|tests)\//.test(file) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(file);
}

// A test directory also holds helpers, fixtures and notes; only a test file can be a focused run.
function isRunnableTestPath(file) {
  return isTestPath(file) && (/(^|[/.])(test|spec)\.[cm]?[jt]sx?$/.test(file) || file.endsWith('.t.sol'));
}

// Notes kept beside tests change no test's outcome.
function affectsTests(file) {
  return isTestPath(file) && !/\.mdx?$/i.test(file);
}

function isStorybookConfigPath(file) {
  return file.includes('/.storybook/');
}

function isStoryPath(file) {
  return /\.stories?\.[cm]?[jt]sx?$/.test(file) || isStorybookConfigPath(file) || /(^|\/)storybook[^/]*\.[cm]?[jt]sx?$/i.test(file);
}

function isValidationOnlyPath(file) {
  return isTestPath(file) || isStoryPath(file);
}

// A rule's `globs` read like a workflow's path filters: `**` crosses directories, `*` and `?` do not.
const globExpressions = new Map();
function globMatches(glob, file) {
  if (!globExpressions.has(glob)) {
    let source = '';
    for (let index = 0; index < glob.length; index += 1) {
      const character = glob[index];
      if (character === '*' && glob[index + 1] === '*') {
        const crossesDirectory = glob[index + 2] === '/';
        source += crossesDirectory ? '(?:.*/)?' : '.*';
        index += crossesDirectory ? 2 : 1;
      } else if (character === '*') source += '[^/]*';
      else if (character === '?') source += '[^/]';
      else source += character.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
    globExpressions.set(glob, new RegExp(`^${source}$`));
  }
  return globExpressions.get(glob).test(file);
}

// The surface whose root holds the path; the deepest root wins.
function owningSurface(ctx, file) {
  let owner = null;
  for (const surface of ctx.layout.surfaces) {
    if (file.startsWith(surface.root) && (!owner || surface.root.length > owner.root.length)) owner = surface;
  }
  return owner?.id ?? null;
}

function groupMatches(ctx, file, rule) {
  const exactMatch = rule.exact?.includes(file) ?? false;
  const excluded =
    !exactMatch &&
    ((rule.excludeValidationOnlyFrom?.includes(owningSurface(ctx, file)) && isValidationOnlyPath(file)) ||
      (rule.excludeTests === true && isTestPath(file)) ||
      (rule.excludeExact?.includes(file) ?? false) ||
      (rule.excludePrefixes?.some((prefix) => file.startsWith(prefix)) ?? false) ||
      (rule.excludeContains?.some((part) => file.includes(part)) ?? false) ||
      (rule.excludeSuffixes?.some((suffix) => file.endsWith(suffix)) ?? false));
  if (excluded) return false;
  const groups = [];
  if (rule.exact?.length) groups.push(exactMatch);
  if (rule.prefixes?.length) groups.push(rule.prefixes.some((prefix) => file.startsWith(prefix)));
  if (rule.contains?.length) groups.push(rule.contains.some((part) => file.includes(part)));
  if (rule.extensions?.length) groups.push(rule.extensions.some((extension) => file.endsWith(extension)));
  if (rule.globs?.length) groups.push(rule.globs.some((glob) => globMatches(glob, file)));
  if (groups.length === 0) return false;
  return rule.match === 'all' ? groups.every(Boolean) : groups.some(Boolean);
}

function ruleMatches(ctx, paths, rule) {
  return paths.some((file) => groupMatches(ctx, file, rule));
}

function classifyChangedPath(ctx, file) {
  if (ctx.layout.lockfiles.includes(file)) return 'lockfile';
  if (file === 'package.json' || file.endsWith('/package.json')) return 'package-manifest';
  if (isStorybookConfigPath(file)) return 'storybook-config';
  if (isStoryPath(file)) return 'story';
  if (isTestPath(file)) return 'test';
  if (ctx.layout.publicSource.some((glob) => globMatches(glob, file))) return 'public-source';
  if (
    ctx.layout.sourceGlobs.some((glob) => globMatches(glob, file)) ||
    ctx.layout.surfaces.some((surface) => surface.source && file.startsWith(surface.source))
  ) {
    return 'runtime-source';
  }
  if (ctx.layout.rootConfigs.includes(file)) return 'root-config';
  return 'other';
}

// Test support one surface owns but other surfaces' tests import (sharedConsumerTestSupport).
function consumersOfSharedTestSupport(ctx, file) {
  const support = ctx.policy.sharedConsumerTestSupport;
  if (!support || !groupMatches(ctx, file, { exact: support.exact, prefixes: support.prefixes })) return [];
  return support.surfaces;
}

// A full-gate surface owns every path its surface rules match, not only its root.
function fullGateOwner(ctx, file) {
  const owner = owningSurface(ctx, file);
  for (const surface of ctx.layout.surfaces) {
    if (!surface.fullGate) continue;
    if (owner === surface.id) return surface.id;
    if ((ctx.policy.surfaceRules ?? []).some((rule) => rule.surface === surface.id && groupMatches(ctx, file, rule))) {
      return surface.id;
    }
  }
  return null;
}

function ownerOf(ctx, file) {
  return fullGateOwner(ctx, file) ?? owningSurface(ctx, file);
}

// ---------------------------------------------------------------------------------------------
// Planning

function maxRisk(policy, risks) {
  const order = policy.riskOrder;
  return risks.reduce((current, candidate) => {
    if (!order.includes(candidate)) throw new Error(`Unknown validation risk: ${candidate}`);
    return order.indexOf(candidate) > order.indexOf(current) ? candidate : current;
  }, 'routine');
}

function effectiveIntent(policy, requestedIntent, ci) {
  if (!policy.intentOrder.includes(requestedIntent)) throw new Error(`Unknown validation intent: ${requestedIntent}`);
  if (ci && !['merge', 'release'].includes(requestedIntent)) return 'merge';
  return requestedIntent;
}

function checkpointScopes(requestedScope, intent, changedPaths) {
  const requested = requestedScope ?? 'workspace';
  if (!['lane', 'workspace'].includes(requested)) throw new Error(`Unknown checkpoint scope: ${requested}`);
  const effective = intent === 'checkpoint' ? requested : 'workspace';
  if (effective === 'lane' && changedPaths.length === 0) throw new Error('Lane checkpoint requires explicit changed paths');
  return { requested, effective };
}

function normalizeTestPaths(testPaths = {}) {
  const result = {};
  for (const [surface, paths] of Object.entries(testPaths)) {
    result[surface] = normalizePaths(paths).map((file) => {
      if (file.startsWith('-') || !/^[A-Za-z0-9_./@+-]+$/.test(file)) throw new Error(`Unsafe focused test path: ${file}`);
      return file;
    });
  }
  return result;
}

// A changed test file focuses its surface's suite; a changed helper or fixture does not.
function inferChangedTestPaths(ctx, paths, deletedPaths) {
  const deleted = new Set(deletedPaths);
  const inferred = {};
  for (const file of paths) {
    if (!isRunnableTestPath(file) || deleted.has(file)) continue;
    const surface = ctx.layout.byId.get(owningSurface(ctx, file));
    if (!surface || !surface.focusable) continue;
    (inferred[surface.id] ??= []).push(file.slice(surface.root.length));
  }
  return inferred;
}

function mergeTestPaths(explicit, inferred) {
  const merged = {};
  for (const surface of new Set([...Object.keys(explicit), ...Object.keys(inferred)])) {
    merged[surface] = [...(explicit[surface] ?? []), ...(inferred[surface] ?? [])];
  }
  return normalizeTestPaths(merged);
}

function impactedSurfaces(ctx, paths, fullRepository) {
  const all = ctx.layout.order;
  if (fullRepository) return new Set(all);
  if (paths.length === 0) return new Set();
  const surfaces = new Set();
  for (const file of paths) {
    if (ctx.layout.lockfiles.includes(file)) {
      all.forEach((surface) => surfaces.add(surface));
      continue;
    }
    const testSupportConsumers = consumersOfSharedTestSupport(ctx, file);
    for (const rule of ctx.policy.surfaceRules ?? []) {
      if (!groupMatches(ctx, file, rule)) continue;
      const owner = owningSurface(ctx, file);
      // A surface's own tests and stories prove only that surface.
      if (
        isValidationOnlyPath(file) &&
        owner &&
        rule.surface !== 'all' &&
        rule.surface !== owner &&
        !testSupportConsumers.includes(rule.surface)
      ) {
        continue;
      }
      if (rule.surface === 'all') all.forEach((surface) => surfaces.add(surface));
      else surfaces.add(rule.surface);
    }
  }
  return new Set(all.filter((surface) => surfaces.has(surface)));
}

function addSurfaceChecks(ctx, select, surfaceId, { includeBuilds, intent }) {
  const surface = ctx.layout.byId.get(surfaceId);
  if (!surface) return;
  const checks = intent === 'qa' && surface.qaChecks ? surface.qaChecks : surface.checks;
  for (const id of checks) select(id, `surface:${surfaceId}`);
  if (includeBuilds && surface.build) select(surface.build, `surface:${surfaceId}:build`);
}

function addValidationOnlyChecks(ctx, select, surfaceId, paths, { includeTypecheck = true } = {}) {
  const surface = ctx.layout.byId.get(surfaceId);
  if (includeTypecheck && surface?.testTypecheck) select(surface.testTypecheck, `validation-only:${surfaceId}:types`);
  if (paths.some(affectsTests)) select(`${surfaceId}-test`, `validation-only:${surfaceId}:tests`);
  const { stories } = ctx.layout;
  if (stories.check && paths.some(isStoryPath)) select(stories.check, `validation-only:${surfaceId}:stories`);
  if (stories.buildCheck && paths.some(isStorybookConfigPath)) {
    select(stories.buildCheck, `validation-only:${surfaceId}:storybook-config`);
  }
}

// Entry files, the manifest and the bundler config of a UI surface decide whether it bundles.
function isUiBuildImpact(ctx, paths, surfaceId) {
  const surface = ctx.layout.byId.get(surfaceId);
  if (!surface) return false;
  return paths.some(
    (file) =>
      (surface.source !== null &&
        file.startsWith(surface.source) &&
        /(^|\/)(app|index|main|route|router|routes)(\.[^/]+)?$/i.test(file)) ||
      (surface.manifest !== null && file === surface.manifest) ||
      file.startsWith(`${surface.root}vite.config.`),
  );
}

// A barrel, entry or manifest change can break compilation anywhere in its surface.
function needsOwnerCompileProof(ctx, paths, surfaceId) {
  const surface = ctx.layout.byId.get(surfaceId);
  if (!surface) return false;
  return paths.some((file) => {
    if (owningSurface(ctx, file) !== surfaceId) return false;
    if (classifyChangedPath(ctx, file) === 'public-source') return true;
    if (surface.manifest !== null && file === surface.manifest) return true;
    if (surface.ui && isUiBuildImpact(ctx, [file], surfaceId)) return true;
    return (
      surface.source !== null &&
      file.startsWith(surface.source) &&
      /(^|\/)(index|main|router|routes|config)(\.[^/]+)?$/i.test(file)
    );
  });
}

export function receiptPolicyFor(intent, risk) {
  const reuseAllowed = !FRESH_RUN_INTENTS.has(intent) && (risk !== 'critical' || intent === 'push');
  return {
    reuseAllowed,
    optInRequired: true,
    failuresCacheable: false,
    note: reuseAllowed
      ? 'Opt-in exact-fingerprint passing receipts may be reused.'
      : 'Every check runs fresh: readiness, ship, merge and release never reuse receipts, and a critical plan reuses them only in push.',
  };
}

function focusedProofMissing(ctx, changedPaths, testPaths, requestedChecks, deletedPaths, {
  ownersRequiringFocus = new Set(),
  exemptSurfaces = new Set(),
  cheapWholeSuiteIsProof = true,
} = {}) {
  // An explicit check stands in for an ordinary owner's focus, never for a critical owner's.
  const explicit = requestedChecks.length > 0;
  if (explicit && ownersRequiringFocus.size === 0) return [];
  const missing = new Set();
  for (const file of changedPaths) {
    if (isValidationOnlyPath(file)) continue;
    const surfaceId = owningSurface(ctx, file);
    const surface = ctx.layout.byId.get(surfaceId);
    if (!surface?.source || !file.startsWith(surface.source)) continue;
    if (exemptSurfaces.has(surfaceId) || testPaths[surfaceId]?.length > 0) continue;
    if (explicit && !ownersRequiringFocus.has(surfaceId)) continue;
    // Compile proof stands in for a barrel or entry change, except for a critical owner.
    if (!ownersRequiringFocus.has(surfaceId) && needsOwnerCompileProof(ctx, changedPaths, surfaceId)) continue;
    missing.add(surfaceId);
  }
  // A deleted test, or a changed helper or fixture, leaves its suite nothing to focus on; only
  // the author can name the test that proves the same thing, unless the whole suite is cheap.
  const deleted = new Set(deletedPaths);
  const unfocusable = [
    ...deletedPaths.filter(affectsTests),
    ...changedPaths.filter((file) => affectsTests(file) && !isRunnableTestPath(file) && !deleted.has(file)),
  ];
  for (const file of unfocusable) {
    const surfaceId = owningSurface(ctx, file);
    const surface = ctx.layout.byId.get(surfaceId);
    if (!surface || !surface.focusable || exemptSurfaces.has(surfaceId) || testPaths[surfaceId]?.length > 0) continue;
    if (explicit && !ownersRequiringFocus.has(surfaceId)) continue;
    const suite = ctx.policy.checks.find((check) => check.id === `${surfaceId}-test`);
    // A push runs no whole suite, so only qa still accepts a cheap one as proof.
    if (cheapWholeSuiteIsProof && suite && suite.budgetSeconds <= FOCUSED_PUSH_SUITE_SECONDS) continue;
    missing.add(surfaceId);
  }
  return [...missing].sort();
}

// The pull-request workflows a change makes CI run, from the policy's workflowRules.
function expectedWorkflows(ctx, changedPaths) {
  const { countValidationOnly, countStories } = ctx.layout.workflows;
  return new Set(
    Object.entries(ctx.policy.workflowRules ?? {})
      .filter(([name, rule]) => {
        // An author-scoped workflow needs a pull request, which a push plan does not have.
        if (rule.pullRequestAuthor) return false;
        return changedPaths.some((file) => {
          if (consumersOfSharedTestSupport(ctx, file).includes(name.toLowerCase())) return true;
          if (!groupMatches(ctx, file, rule)) return false;
          if (rule.exact?.includes(file)) return true;
          if (!isValidationOnlyPath(file)) return true;
          if (countValidationOnly.includes(name)) return true;
          if (countStories.includes(name) && isStoryPath(file)) return true;
          // A surface's own tests expect only its workflow; a test no surface owns expects every
          // workflow whose rule lists it.
          const owner = owningSurface(ctx, file);
          return owner === null || name.toLowerCase() === owner;
        });
      })
      .map(([name]) => name),
  );
}

function normalizeEnvironment(environment = {}) {
  return {
    profile: environment.profile ?? 'unspecified',
    toolchain: { ...(environment.toolchain ?? {}) },
    capabilities: { ...(environment.capabilities ?? {}) },
  };
}

// The pinned tools the runnable checks need: node always; another tool when a check's command
// names it (layout toolchain `command`) or a check lists it as a capability.
function requiredTools(ctx, checks) {
  const tools = new Set();
  const pinned = Object.keys(ctx.policy.toolchain ?? {});
  if (pinned.includes('node')) tools.add('node');
  for (const tool of pinned) {
    if (tool === 'node') continue;
    const rule = ctx.layout.toolchain[tool];
    const required = rule?.command
      ? checks.some((check) => check.command?.includes(rule.command))
      : checks.some((check) => check.capabilities?.includes(rule?.capability ?? tool));
    if (required) tools.add(tool);
  }
  return tools;
}

function compareToolchain(ctx, actual, checks) {
  const blockers = [];
  if (checks.length === 0 || Object.keys(actual).length === 0) return blockers;
  const expected = ctx.policy.toolchain ?? {};
  for (const tool of requiredTools(ctx, checks)) {
    const actualVersion = actual[tool];
    if (!actualVersion) blockers.push({ capability: `toolchain.${tool}`, expected: expected[tool], actual: null });
    else if (actualVersion !== expected[tool]) {
      blockers.push({ capability: `toolchain.${tool}`, expected: expected[tool], actual: actualVersion });
    }
  }
  return blockers;
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", `'"'"'`)}'`;
}

function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (placeholder, key) => (Object.hasOwn(values, key) ? values[key] : placeholder));
}

function materializeCheck(ctx, check, environment, mandatory, testPaths, context) {
  const blockedBy = (check.capabilities ?? []).filter((capability) => environment.capabilities[capability] === false);
  const surfaceId = check.id.endsWith('-test') ? check.id.slice(0, -5) : null;
  const surface = surfaceId ? ctx.layout.byId.get(surfaceId) : undefined;
  // A mandatory critical suite runs whole, except in a critical push or qa run, where the tests
  // the author names are the local proof; a critical full-gate push runs every mandatory suite
  // whole, and a critical full-gate qa run only the full-gate surface's.
  const wholeCriticalSuite =
    mandatory &&
    context.risk === 'critical' &&
    ((context.fullGateCritical && (surface?.fullGate === true || context.intent === 'push')) ||
      !['push', 'qa'].includes(context.intent));
  const focusedPaths =
    surfaceId && !wholeCriticalSuite && ['diagnose', 'review', 'qa', 'checkpoint', 'push'].includes(context.intent)
      ? testPaths[surfaceId] ?? []
      : [];
  let command = check.command;
  if (!context.ci && focusedPaths.length === 0 && WHOLE_SUITE_INTENTS.has(context.intent) && surface?.wholeSuiteCommand) {
    command = fill(surface.wholeSuiteCommand, { force: FRESH_RUN_INTENTS.has(context.intent) ? ' --force' : '' });
  } else if (focusedPaths.length > 0) {
    const template = surface?.focusedCommand ?? '{command} {paths}';
    command = template.includes('{path}')
      ? focusedPaths.map((file) => fill(template, { command: check.command, path: file })).join(' && ')
      : fill(template, { command: check.command, paths: focusedPaths.join(' ') });
  }

  const laneCheckpoint = context.intent === 'checkpoint' && context.checkpointScope === 'lane';
  const deletedPaths = new Set(context.deletedPaths);
  const existingChangedPaths = context.changedPaths.filter((file) => !deletedPaths.has(file));
  const quoted = (paths) => paths.map(shellQuote).join(' ');
  // A critical push keeps the fast-push shape: format and lint stay scoped to the changed paths.
  const fastPush = (context.intent === 'push' && context.risk !== 'critical') || context.criticalPush;
  const scopedHygiene = ['diagnose', 'review', 'qa'].includes(context.intent) || laneCheckpoint || fastPush;
  const { format, lint } = ctx.layout.hygiene;
  if (format && check.id === format.check) {
    if (format.fullCommand && !context.ci && ['ship', 'merge', 'release'].includes(context.intent)) command = format.fullCommand;
    // A formatter handed only paths it does not handle fails, so a deleted or Markdown-only
    // change still needs a command that succeeds.
    if (format.scopedCommand && scopedHygiene && context.changedPaths.length > 0) {
      command = existingChangedPaths.length > 0
        ? fill(format.scopedCommand, { paths: quoted(existingChangedPaths) })
        : format.emptyCommand ?? check.command;
    }
  }
  const scopedLint = context.intent === 'qa' || laneCheckpoint || fastPush;
  if (lint && check.id === lint.check && lint.scopedCommand && scopedLint) {
    const sourcePaths = lint.sourceCommand
      ? existingChangedPaths.filter(
          (file) =>
            lint.extensions.some((extension) => file.endsWith(extension)) &&
            lint.sourcePrefixes.some((prefix) => file.startsWith(prefix)) &&
            !isValidationOnlyPath(file),
        )
      : [];
    command = sourcePaths.length > 0
      ? fill(lint.sourceCommand, { paths: quoted(sourcePaths) })
      : existingChangedPaths.length > 0
        ? fill(lint.scopedCommand, { paths: quoted(existingChangedPaths) })
        : lint.emptyCommand ?? check.command;
  }
  // A check that compares against a base judges the plan's own base, as CI judges the PR base.
  const baseArgument = ctx.layout.baseArguments[check.id];
  if (baseArgument && context.base) command = fill(baseArgument, { command: check.command, base: shellQuote(context.base) });

  let budgetSeconds = focusedPaths.length > 0
    ? Math.min(check.budgetSeconds, fastPush ? FOCUSED_PUSH_SUITE_SECONDS : FOCUSED_SUITE_SECONDS)
    : check.budgetSeconds;
  if (format && check.id === format.check && format.scopedBudgetSeconds !== null && scopedHygiene) {
    budgetSeconds = Math.min(budgetSeconds, format.scopedBudgetSeconds);
  }
  if (lint && check.id === lint.check && lint.scopedBudgetSeconds !== null && scopedLint) {
    budgetSeconds = Math.min(budgetSeconds, lint.scopedBudgetSeconds);
  }
  return {
    ...check,
    command,
    focusedPaths,
    budgetSeconds,
    mandatory,
    state: isAdvisoryManualCheck(check) ? 'advisory' : blockedBy.length > 0 ? 'blocked' : 'pending',
    blockedBy,
  };
}

export function summarizeBudget(intent, checks, risk = 'routine') {
  const hardLimitSeconds = intent === 'push' && risk !== 'critical' ? (risk === 'sensitive' ? 180 : 90) : null;
  const targetSeconds = hardLimitSeconds ?? { qa: 90, checkpoint: 180 }[intent] ?? null;
  const automatedSeconds = checks.filter((check) => !check.manual).reduce((total, check) => total + check.budgetSeconds, 0);
  const manualSeconds = checks.filter((check) => check.manual).reduce((total, check) => total + check.budgetSeconds, 0);
  // Checks run one at a time, so the wall estimate is the sum of their budgets.
  const wallSeconds = automatedSeconds;
  return {
    targetSeconds,
    estimatedWallSeconds: wallSeconds,
    hardLimitSeconds,
    enforced: hardLimitSeconds !== null,
    automatedSeconds,
    manualSeconds,
    withinTarget: targetSeconds === null ? null : wallSeconds <= targetSeconds,
    mandatoryChecksMayExceedTarget: checks.some((check) => check.mandatory) && targetSeconds !== null && automatedSeconds > targetSeconds,
    rule:
      hardLimitSeconds === null
        ? 'Budgets warn and profile; they never skip selected or mandatory checks.'
        : 'Routine and sensitive push budgets stop over-broad plans and time out noncritical local work; critical overrides remain uncapped.',
  };
}

/**
 * The plan for a change: which checks it needs, which are mandatory, its risk tier, budget and
 * status. `input` holds intent, changedPaths, deletedPaths, base, head, workingCopyFingerprint,
 * risk, testPaths ({ surface: [paths] }), checkIds, checkpointScope, ci, mutationPaths and
 * environment ({ profile, toolchain, capabilities }). `options` holds policy (or policyPath)
 * and layout (a preset name or object; default: the policy's own).
 */
export function planValidation(input = {}, options = {}) {
  const policy = options.policy ?? loadPolicy(options.policyPath);
  const ctx = { policy, layout: resolveLayout(policy, options.layout ?? policy.layout) };
  const { layout } = ctx;
  const requestedIntent = input.intent ?? DEFAULT_INTENT;
  const ci = input.ci === true;
  const intent = effectiveIntent(policy, requestedIntent, ci);
  const changedPaths = normalizePaths(input.changedPaths);
  const deletedPaths = normalizePaths(input.deletedPaths);
  // Changed paths whose content, not their location, reaches a critical primitive. A repository
  // analyzer supplies them; the policy's path lists cannot know a new file.
  const mutationPaths = normalizePaths(input.mutationPaths).filter((file) => changedPaths.includes(file));
  const checkpointScope = checkpointScopes(input.checkpointScope, intent, changedPaths);
  const testPaths = mergeTestPaths(normalizeTestPaths(input.testPaths), inferChangedTestPaths(ctx, changedPaths, deletedPaths));
  const requestedChecks = normalizePaths(input.checkIds);
  const baseRisk = input.risk ?? 'routine';

  const planIdentity = {
    policyVersion: policy.version,
    requestedIntent,
    effectiveIntent: intent,
    requestedCheckpointScope: checkpointScope.requested,
    checkpointScope: checkpointScope.effective,
    ci,
    base: input.base ?? null,
    head: input.head ?? null,
    workingCopyFingerprint: input.workingCopyFingerprint ?? null,
    changedPaths,
    deletedPaths,
    changes: changedPaths.map((file) => ({ path: file, kind: classifyChangedPath(ctx, file), surface: owningSurface(ctx, file) })),
    testPaths,
    requestedChecks,
    mutationPaths,
  };

  const overrides = policy.criticalOverrides ?? [];
  const hardRules = overrides.filter((rule) => ruleMatches(ctx, changedPaths, rule));
  const contentRule = layout.contentCriticalRule ? overrides.find((rule) => rule.id === layout.contentCriticalRule) : undefined;
  const contentCriticalPaths = contentRule ? mutationPaths.filter((file) => !groupMatches(ctx, file, contentRule)) : [];
  const pathRiskRules = (policy.riskRules ?? []).filter((rule) => ruleMatches(ctx, changedPaths, rule));
  const risk = maxRisk(policy, [
    baseRisk,
    changedPaths.some((file) => {
      const surface = owningSurface(ctx, file);
      return surface ? needsOwnerCompileProof(ctx, changedPaths, surface) : false;
    })
      ? 'sensitive'
      : 'routine',
    ...pathRiskRules.map((rule) => rule.risk),
    ...hardRules.map((rule) => rule.risk),
    ...(contentCriticalPaths.length > 0 ? [contentRule.risk] : []),
  ]);
  const fastPush = intent === 'push' && risk !== 'critical';
  const localMerge = intent === 'merge' && !ci;
  const strictIntent = ['readiness', 'ship', 'release'].includes(intent) || (intent === 'push' && risk === 'critical');
  const fullRepository =
    ['readiness', 'release'].includes(intent) || ((intent === 'ship' || localMerge) && changedPaths.length === 0);
  const strictScope = strictIntent || fullRepository;
  const surfaces = impactedSurfaces(ctx, changedPaths, fullRepository);
  const owners = new Set(changedPaths.map((file) => ownerOf(ctx, file)).filter(Boolean));
  // The paths that make a plan critical are the ones an override or content escalation matched;
  // an explicit critical risk with nothing matched makes every changed path critical.
  const ruleCriticalPaths = [
    ...changedPaths.filter((file) => hardRules.some((rule) => groupMatches(ctx, file, rule))),
    ...contentCriticalPaths,
  ];
  const criticalPaths = baseRisk === 'critical' && ruleCriticalPaths.length === 0 ? changedPaths : ruleCriticalPaths;
  // A critical change a full-gate surface owns keeps that surface's complete local gate in every
  // intent (Green Goods: contracts); any other critical push or qa run keeps the fast-push shape.
  const criticalFullGateSurfaces = new Set(
    risk === 'critical' ? criticalPaths.map((file) => fullGateOwner(ctx, file)).filter(Boolean) : [],
  );
  const fullGateCritical = criticalFullGateSurfaces.size > 0;
  const criticalPush = intent === 'push' && risk === 'critical' && !fullGateCritical;
  const criticalQa = intent === 'qa' && risk === 'critical';
  const criticalOwners = new Set(risk === 'critical' ? criticalPaths.map((file) => ownerOf(ctx, file)).filter(Boolean) : []);
  const ownersRequiringFocus = new Set([...criticalOwners].filter((surface) => !layout.byId.get(surface)?.fullGate));

  const selected = new Set();
  const selectionReasons = new Map();
  const select = (id, reason) => {
    if (!id) return;
    selected.add(id);
    const reasons = selectionReasons.get(id) ?? new Set();
    reasons.add(reason);
    selectionReasons.set(id, reasons);
  };
  const evidenceOnly = EVIDENCE_INTENTS.has(intent);
  const hasAutomaticScope = changedPaths.length > 0 || fullRepository;
  const knownCheckIds = new Set(policy.checks.map((check) => check.id));
  const typecheckOf = (surface) => layout.byId.get(surface)?.typecheck ?? null;
  const testTypecheckOf = (surface) => layout.byId.get(surface)?.testTypecheck ?? null;

  for (const id of requestedChecks) {
    if (!knownCheckIds.has(id)) throw new Error(`Unknown requested validation check: ${id}`);
    select(id, 'explicit-request');
  }

  const { format, lint } = layout.hygiene;
  if (format && !evidenceOnly && hasAutomaticScope) select(format.check, 'automatic-hygiene');
  if (lint && intent === 'qa' && changedPaths.some((file) => lint.extensions.some((extension) => file.endsWith(extension)))) {
    select(lint.check, 'automatic-hygiene');
  }
  if (lint && hasAutomaticScope && ['checkpoint', 'readiness', 'push', 'ship', 'merge', 'release'].includes(intent)) {
    select(lint.check, 'automatic-hygiene');
  }
  if (!evidenceOnly) {
    for (const id of new Set(changedPaths.map((file) => layout.directTests[file]).filter(Boolean))) {
      select(id, `direct-root-test:${id}`);
    }
  }

  const includeBuilds = ['readiness', 'ship', 'merge', 'release'].includes(intent) || (intent === 'push' && fullGateCritical);
  const selectFocusedSuites = () => {
    for (const surface of Object.keys(testPaths)) {
      const testId = `${surface}-test`;
      if (!knownCheckIds.has(testId)) throw new Error(`Unknown focused-test surface: ${surface}`);
      select(testId, `focused-test:${surface}`);
    }
  };
  if (evidenceOnly) {
    selectFocusedSuites();
  } else if (fastPush || criticalPush) {
    selectFocusedSuites();
    for (const surface of new Set(changedPaths.map((file) => owningSurface(ctx, file)).filter(Boolean))) {
      const surfacePaths = changedPaths.filter((file) => owningSurface(ctx, file) === surface);
      if (surfacePaths.some(isValidationOnlyPath)) addValidationOnlyChecks(ctx, select, surface, surfacePaths, { includeTypecheck: false });
      if (needsOwnerCompileProof(ctx, changedPaths, surface)) {
        // The typecheck is the push's compile proof; a critical owner leaves its build to CI.
        select(typecheckOf(surface), `push-owner-compile:${surface}`);
        if (!(criticalPush && criticalOwners.has(surface))) select(layout.byId.get(surface).build, `push-owner-compile:${surface}`);
      }
      const ownerProof = layout.byId.get(surface).ownerProof;
      if (ownerProof) select(ownerProof, `push-owner-proof:${surface}`);
    }
    if (criticalPush) {
      for (const surface of surfaces) {
        if (!owners.has(surface)) select(typecheckOf(surface), `critical-consumer-types:${surface}`);
      }
      for (const surface of criticalOwners) select(typecheckOf(surface), `critical-owner-types:${surface}`);
    }
  } else {
    for (const surface of surfaces) {
      // A critical qa run proves its consumers by typecheck and runs a consumer suite only when
      // the author names one of its tests.
      if (criticalQa && !owners.has(surface)) {
        for (const typecheck of [typecheckOf(surface), testTypecheckOf(surface)]) select(typecheck, `critical-consumer-types:${surface}`);
        if (testPaths[surface]?.length > 0) select(`${surface}-test`, `focused-test:${surface}`);
        continue;
      }
      if (criticalQa && criticalOwners.has(surface)) {
        for (const typecheck of [typecheckOf(surface), testTypecheckOf(surface)]) select(typecheck, `critical-owner-types:${surface}`);
      }
      // Test support a consumer's tests import counts as that consumer's own test files.
      const surfacePaths = changedPaths.filter(
        (file) => owningSurface(ctx, file) === surface || consumersOfSharedTestSupport(ctx, file).includes(surface),
      );
      const manifest = layout.byId.get(surface)?.manifest ?? null;
      const touchesValidation = surfacePaths.some(isValidationOnlyPath) || (manifest !== null && surfacePaths.includes(manifest));
      const validationOnly = surfacePaths.length > 0 && surfacePaths.every(isValidationOnlyPath);
      if (!includeBuilds && validationOnly) {
        addValidationOnlyChecks(ctx, select, surface, surfacePaths);
      } else {
        addSurfaceChecks(ctx, select, surface, { includeBuilds, intent });
        if (touchesValidation) addValidationOnlyChecks(ctx, select, surface, surfacePaths);
      }
      const definition = layout.byId.get(surface);
      if (intent === 'qa' && definition?.build) {
        if (definition.qaBuild === 'entry' && isUiBuildImpact(ctx, changedPaths, surface)) {
          select(definition.build, `qa-build-impact:${surface}`);
        }
        if (definition.qaBuild === 'source' && definition.source && changedPaths.some((file) => file.startsWith(definition.source))) {
          select(definition.build, `qa-build-impact:${surface}`);
        }
      }
    }
  }

  if (strictScope) {
    // A critical push keeps the fast-push shape, so a noncritical file beside it adds no gate.
    for (const surface of layout.surfaces) {
      if (surface.strictChecks.length === 0) continue;
      if (fullRepository || (surfaces.has(surface.id) && !criticalPush)) {
        for (const id of surface.strictChecks) select(id, `strict-intent:${surface.id}`);
      }
    }
    for (const surface of layout.surfaces) {
      if (surface.testTypecheck && surfaces.has(surface.id)) select(surface.testTypecheck, `strict-intent:${surface.id}:test-types`);
    }
  }
  if (!evidenceOnly) {
    for (const rule of layout.pathChecks) {
      if (changedPaths.some((file) => rule.prefixes.some((prefix) => file.startsWith(prefix)))) select(rule.check, rule.reason);
    }
  }
  const traits = layout.conditional;
  for (const rule of policy.conditionalRules ?? []) {
    if (evidenceOnly && rule.runInEvidence !== true) continue;
    if (rule.intents && !rule.intents.includes(intent)) continue;
    if ((fastPush || criticalPush) && traits.skipOnFastPush.includes(rule.check)) continue;
    const matchingPaths = changedPaths.filter((file) => {
      if (!groupMatches(ctx, file, rule)) return false;
      if (rule.exact?.includes(file)) return true;
      return !(traits.excludeValidationOnly.includes(rule.check) && isValidationOnlyPath(file));
    });
    if (matchingPaths.length === 0) continue;
    if (intent === 'qa' && rule.runInQa !== true && !traits.alwaysInQa.includes(rule.check)) continue;
    select(rule.check, `conditional:${rule.check}`);
  }

  // Checkpoint and the strict intents apply an override's checks as written. A critical push or
  // qa run keeps the critical owner's suite (focused) with its typechecks, and turns every other
  // surface's suite into that surface's typechecks: CI's consumer workflows run those suites.
  const overrideChecks = (checks) =>
    criticalPush || criticalQa
      ? checks.flatMap((id) => {
          const surface = id.endsWith('-test') ? id.slice(0, -5) : null;
          if (!surface || !typecheckOf(surface)) return [id];
          const typechecks = [typecheckOf(surface), testTypecheckOf(surface)].filter(Boolean);
          return criticalOwners.has(surface) ? [id, ...typechecks] : typechecks;
        })
      : checks;
  const mandatory = new Set();
  const selectMandatory = (id, reason) => {
    select(id, reason);
    mandatory.add(id);
  };
  for (const rule of evidenceOnly ? [] : hardRules) {
    for (const id of overrideChecks(rule.checks)) selectMandatory(id, 'critical-override');
  }
  if (!evidenceOnly && contentCriticalPaths.length > 0) {
    for (const id of overrideChecks(contentRule.checks)) selectMandatory(id, 'critical-content');
  }
  // A critical full-gate path brings that surface's complete gate (every override that runs its
  // suite) in push and qa too; the strict intents select it already.
  if (['push', 'qa'].includes(intent)) {
    for (const surface of criticalFullGateSurfaces) {
      const gate = new Set(overrides.filter((rule) => rule.checks?.includes(`${surface}-test`)).flatMap((rule) => rule.checks));
      for (const id of gate) selectMandatory(id, `critical-${surface}`);
    }
  }
  // A push leaves builds and whole suites to the pull-request workflow that runs them, when that
  // workflow is expected for this change.
  const ciOwned = [];
  if (fastPush || criticalPush) {
    const workflows = expectedWorkflows(ctx, changedPaths);
    for (const id of [...selected]) {
      const owner = layout.ciOwnedOnPush[id];
      if (!owner || requestedChecks.includes(id)) continue;
      const surface = id.endsWith('-test') ? id.slice(0, -5) : null;
      // A focused suite runs locally, and a critical owner's suite stays to be focused.
      if (surface && (testPaths[surface]?.length > 0 || ownersRequiringFocus.has(surface))) continue;
      if (owner.workflow !== null && !workflows.has(owner.workflow)) continue;
      selected.delete(id);
      mandatory.delete(id);
      ciOwned.push({ id, workflow: owner.workflow });
    }
  }
  if (['readiness', 'push', 'ship', 'merge', 'release'].includes(intent)) for (const id of selected) mandatory.add(id);

  const environment = normalizeEnvironment(input.environment);
  let checks = policy.checks
    .filter((check) => selected.has(check.id))
    .map((check) => {
      const materialized = materializeCheck(ctx, check, environment, mandatory.has(check.id), testPaths, {
        intent,
        risk,
        ci,
        base: planIdentity.base,
        changedPaths,
        deletedPaths,
        checkpointScope: checkpointScope.effective,
        fullGateCritical,
        criticalPush,
      });
      return {
        ...materialized,
        selectedBy: [...(selectionReasons.get(check.id) ?? [])],
        ...(materialized.manual ? { advisory: isAdvisoryManualCheck(materialized) } : {}),
      };
    });
  // The toolchain protects commands that run; a plan of only advisory proof has none.
  const toolchainBlockers = compareToolchain(ctx, environment.toolchain, checks.filter((check) => !isAdvisoryManualCheck(check)));
  if (toolchainBlockers.length > 0) {
    const capabilities = toolchainBlockers.map((blocker) => blocker.capability);
    checks = checks.map((check) =>
      isAdvisoryManualCheck(check)
        ? check
        : { ...check, state: 'blocked', blockedBy: [...new Set([...check.blockedBy, ...capabilities])] },
    );
  }
  const blockedChecks = checks.filter((check) => check.state === 'blocked' && !isAdvisoryManualCheck(check));
  const budget = summarizeBudget(intent, checks, risk);
  const missingFocus =
    fastPush || criticalPush || criticalQa
      ? focusedProofMissing(ctx, changedPaths, testPaths, requestedChecks, deletedPaths, {
          ownersRequiringFocus: criticalPush || criticalQa ? ownersRequiringFocus : new Set(),
          exemptSurfaces: criticalFullGateSurfaces,
          cheapWholeSuiteIsProof: !(fastPush || criticalPush),
        })
      : [];
  // Budgets are ceilings, not measurements: an over-limit plan whose package suites all run
  // focused still runs and the deadline decides; an unfocused package suite asks for focus.
  const packageSuites = new Set(layout.surfaces.filter((surface) => surface.wholeSuiteCommand).map((surface) => `${surface.id}-test`));
  const unfocusedSuite = checks.some(
    (check) => packageSuites.has(check.id) && !check.manual && (check.focusedPaths?.length ?? 0) === 0,
  );
  const plannedOverBudget = budget.enforced && budget.estimatedWallSeconds > budget.hardLimitSeconds && unfocusedSuite;
  const needsFocus = missingFocus.length > 0 || plannedOverBudget;
  const blocked = blockedChecks.length > 0 || toolchainBlockers.length > 0;
  const status = blocked ? 'blocked' : needsFocus ? 'needs-focus' : 'ready';
  const stopReason = blocked
    ? 'required-environment-unavailable'
    : missingFocus.length > 0
      ? 'focused-proof-required'
      : plannedOverBudget
        ? 'local-budget-exceeded'
        : null;
  // An explicit check cannot stand in for a critical owner's focused suite.
  const criticalFocusMissing = missingFocus.some((surface) => ownersRequiringFocus.has(surface));
  const focusPaths = missingFocus.map((surface) => `--test-path ${surface}:<package-relative-test>`).join(', ');
  const remediation =
    status === 'needs-focus'
      ? missingFocus.length > 0
        ? criticalFocusMissing
          ? `Add focused proof with ${focusPaths}, or narrow the change. A critical owner's suite runs focused on the tests you name, so --check cannot stand in for it.`
          : `Add focused proof with ${focusPaths}, select an existing acceptance check with --check, or narrow the change.`
        : 'Narrow the changed scope, provide a more focused test path, or select a smaller existing acceptance check.'
      : null;

  return {
    ...planIdentity,
    status,
    stopReason,
    remediation,
    risk,
    surfaces: [...surfaces],
    environment,
    environmentBlockers: toolchainBlockers,
    checks,
    ciOwned,
    budget,
    receiptPolicy: receiptPolicyFor(intent, risk),
    // Green Goods' runner filters a plan (--only, --skip-*) and lists what it dropped here; the
    // selector filters nothing.
    skipped: [],
  };
}

// ---------------------------------------------------------------------------------------------
// Git: the changed paths of a branch and its working copy

function gitEnvironment(env) {
  const environment = { ...env, GIT_OPTIONAL_LOCKS: '0' };
  for (const variable of REPOSITORY_LOCAL_GIT_VARIABLES) delete environment[variable];
  return environment;
}

function lines(value) {
  return value.split(/\r?\n/).filter(Boolean);
}

function workingCopyFingerprint(root, committedRange, stagedPatch, unstagedPatch, untrackedPaths) {
  const hash = createHash('sha256');
  hash.update('validation-working-copy-v2\0');
  for (const [label, patch] of [['committed', committedRange], ['staged', stagedPatch], ['unstaged', unstagedPatch]]) {
    hash.update(`${label}\0`);
    hash.update(patch);
    hash.update('\0');
  }
  for (const file of [...untrackedPaths].sort()) {
    hash.update(`untracked\0${file}\0`);
    const absolutePath = path.resolve(root, file);
    if (absolutePath !== root && !absolutePath.startsWith(`${root}${path.sep}`)) {
      throw new Error(`Untracked path escaped repository root: ${file}`);
    }
    const stat = lstatSync(absolutePath);
    if (stat.isSymbolicLink()) hash.update(`symlink:${readlinkSync(absolutePath)}`);
    else if (stat.isFile()) hash.update(readFileSync(absolutePath));
    else hash.update(`unsupported:${stat.mode}`);
    hash.update('\0');
  }
  return hash.digest('hex');
}

/**
 * The branch's changes since `base` (default: the branch origin/HEAD names, or the pull request
 * base on GitHub Actions) plus staged, unstaged and untracked paths, read without taking locks.
 * Paths are relative to the repository root.
 */
export function resolveGitInputs(options = {}, { cwd = process.cwd(), env = process.env } = {}) {
  const environment = gitEnvironment(env);
  const run = (args, directory) =>
    execFileSync('git', args, { cwd: directory, env: environment, maxBuffer: GIT_OUTPUT_MAX_BUFFER, stdio: ['ignore', 'pipe', 'pipe'] });
  const fail = (args, error) => {
    const detail = String(error.stderr ?? '').trim() || error.message;
    return new Error(`git ${args.join(' ')} failed: ${detail}`);
  };
  const text = (args, directory) => {
    try {
      return run(args, directory).toString('utf8').trim();
    } catch (error) {
      throw fail(args, error);
    }
  };
  const raw = (args, directory) => {
    try {
      return run(args, directory);
    } catch (error) {
      throw fail(args, error);
    }
  };
  const root = text(['rev-parse', '--show-toplevel'], cwd);
  const git = (args) => text(args, root);
  let base = options.base;
  if (!base && env.GITHUB_BASE_REF) base = `origin/${env.GITHUB_BASE_REF}`;
  if (!base) {
    try {
      base = run(['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD'], root).toString('utf8').trim();
    } catch {
      throw new Error('No --base given and origin/HEAD is not set: pass --base <revision>, or set origin/HEAD with `git remote set-head origin --auto`');
    }
  }
  const head = options.head ?? 'HEAD';
  const resolvedBase = git(['rev-parse', base]);
  const resolvedHead = git(['rev-parse', head]);
  const range = `${resolvedBase}...${resolvedHead}`;
  // Blob hashes identify the committed range exactly without materializing a large patch.
  const committedRange = git(['diff', '--raw', '--no-abbrev', '--no-renames', range]);
  const stagedPatch = raw(['diff', '--cached', '--binary'], root);
  const unstagedPatch = raw(['diff', '--binary'], root);
  // Rename detection lists a moved file under its new path only, so a critical file moved to a
  // routine path would plan as routine. Without it a move is a deletion plus an addition, and
  // the path it left is planned too.
  const names = (...args) => lines(git(['diff', '--name-only', '--no-renames', ...args]));
  const committedPaths = names(range);
  const stagedPaths = names('--cached');
  const unstagedPaths = names();
  const untrackedPaths = lines(git(['ls-files', '--others', '--exclude-standard']));
  const deletedPaths = normalizePaths([
    ...names('--diff-filter=D', range),
    ...names('--cached', '--diff-filter=D'),
    ...names('--diff-filter=D'),
  ]).filter((file) => !existsSync(path.resolve(root, file)));
  return {
    root,
    base: resolvedBase,
    head: resolvedHead,
    changedPaths: normalizePaths([...committedPaths, ...stagedPaths, ...unstagedPaths, ...untrackedPaths]),
    deletedPaths,
    workingCopyFingerprint: workingCopyFingerprint(root, committedRange, stagedPatch, unstagedPatch, untrackedPaths),
  };
}

// ---------------------------------------------------------------------------------------------
// Output

const COLORS = { reset: '\x1b[0m', yellow: '\x1b[1;33m', blue: '\x1b[0;34m' };
const NO_COLORS = { reset: '', yellow: '', blue: '' };

export function liveHost() {
  return { loadAverage: loadavg()[0], cpuCount: cpus().length };
}

// A saturated host (1-minute load above one and a half times its CPUs) suspends a push's hard
// limit, because every check slows and the limit would only produce budget-exceeded runs.
export function deadlineSuspendedBy(host) {
  if (!Number.isFinite(host?.loadAverage) || !Number.isInteger(host?.cpuCount) || host.cpuCount <= 0) return false;
  return host.loadAverage > 1.5 * host.cpuCount;
}

/** The plan as Green Goods' `bun run check --plan` prints it. */
export function renderPlan(plan, { layout, host = liveHost(), color = false } = {}) {
  const c = color ? COLORS : NO_COLORS;
  const { budget } = plan;
  const out = [
    `${c.blue}Validation plan${c.reset}: ${plan.effectiveIntent} · ${plan.risk} · ${plan.changedPaths.length} changed path(s)`,
    `${c.blue}Budget${c.reset}: ${budget.estimatedWallSeconds}s estimated wall (${budget.automatedSeconds}s summed)` +
      (budget.hardLimitSeconds === null
        ? ' / uncapped'
        : deadlineSuspendedBy(host)
          ? ` / ${budget.hardLimitSeconds}s hard limit suspended: 1-minute load ${host.loadAverage.toFixed(1)} on ${host.cpuCount} CPUs`
          : ` / ${budget.hardLimitSeconds}s hard limit`),
  ];
  for (const check of plan.checks) {
    const flags = [
      check.mandatory ? 'mandatory' : null,
      isAdvisoryManualCheck(check)
        ? plan.effectiveIntent === 'release'
          ? `manual attestation required: --attest ${check.id}="<evidence>"`
          : 'advisory manual proof; record it in the PR body'
        : check.state === 'blocked'
          ? `blocked:${check.blockedBy.join(',')}`
          : null,
    ].filter(Boolean).join(', ');
    out.push(`  - ${check.id}${flags ? ` (${flags})` : ''}`);
  }
  for (const skipped of plan.skipped ?? []) out.push(`  - ${skipped.id} (skipped by compatibility filter)`);
  for (const owned of plan.ciOwned ?? []) {
    const reason = layout?.ciOwnedOnPush?.[owned.id]?.reason ?? 'no workflow needs it';
    out.push(`  - ${owned.id} (${owned.workflow ? `left to the ${owned.workflow} workflow` : `not run: ${reason}`})`);
  }
  return `${out.join('\n')}\n`;
}

// Green Goods reports a plan's status when it runs the plan; the selector never runs one, so it
// says here when a plan cannot run as printed.
export function renderStatus(plan, { color = false } = {}) {
  if (plan.status === 'ready') return '';
  const c = color ? COLORS : NO_COLORS;
  const head = `${c.yellow}Status${c.reset}: ${plan.status}${plan.stopReason ? ` (${plan.stopReason})` : ''}`;
  return `${[head, ...(plan.remediation ? [`  ${plan.remediation}`] : [])].join('\n')}\n`;
}

// ---------------------------------------------------------------------------------------------
// Command line

const HELP = `Usage: node select.mjs [options]

Prints the checks a change needs, by risk tier and intent, from a validation policy.
It plans only: no check runs.

Options:
  --policy <file>         Validation policy (default: ${DEFAULT_POLICY_PATH})
  --layout <name|file>    Surface layout: a preset (${Object.keys(LAYOUT_PRESETS).join(', ')}) or a JSON file
                          (default: the policy's "layout")
  --paths <a,b>           Changed paths, comma-separated; repeatable (alias: --changed).
                          Without it, git supplies the branch's and working copy's changes
  --base <revision>       Git comparison base (default: the branch origin/HEAD names)
  --head <revision>       Git head revision (default: HEAD)
  --intent <intent>       ${INTENTS.join('|')} (default: ${DEFAULT_INTENT})
  --checkpoint-scope <s>  lane|workspace; lane requires --paths
  --risk <tier>           routine|sensitive|critical; paths can only raise it
  --test-path <s:path>    Focused test for a surface, e.g. shared:src/date.test.ts; repeatable
  --check <check-id>      Add a check to the plan; repeatable
  --capability <k=bool>   Declare an environment capability, e.g. docker=false; repeatable
  --ci                    Plan as CI's authoritative merge gate
  --json                  Print the plan as JSON
  --help, -h              Show this help
`;

export function parseArguments(argv) {
  const options = {
    intent: DEFAULT_INTENT,
    checkpointScope: 'workspace',
    changedPaths: [],
    testPaths: {},
    checkIds: [],
    capabilities: {},
    ci: false,
    json: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      const value = argv[++index];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value`);
      return value;
    };
    switch (arg) {
      case '--policy':
        options.policy = next();
        break;
      case '--layout':
        options.layout = next();
        break;
      case '--paths':
      case '--changed':
        options.changedPaths.push(...next().split(',').map((value) => value.trim()).filter(Boolean));
        break;
      case '--base':
        options.base = next();
        break;
      case '--head':
        options.head = next();
        break;
      case '--intent':
        options.intent = next();
        break;
      case '--checkpoint-scope':
        options.checkpointScope = next();
        break;
      case '--risk':
        options.risk = next();
        break;
      case '--test-path': {
        const value = next();
        const separator = value.indexOf(':');
        if (separator < 1) throw new Error('--test-path must use surface:path');
        (options.testPaths[value.slice(0, separator)] ??= []).push(value.slice(separator + 1));
        break;
      }
      case '--check':
        options.checkIds.push(next());
        break;
      case '--capability': {
        const [name, value] = next().split('=', 2);
        if (!name || !['true', 'false'].includes(value)) throw new Error('--capability must use name=true or name=false');
        options.capabilities[name] = value === 'true';
        break;
      }
      case '--ci':
        options.ci = true;
        break;
      case '--json':
        options.json = true;
        break;
      // Green Goods spells the same request `bun run check --plan`; the selector only plans.
      case '--plan':
      case '--':
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (options.intent === 'checkpoint' && options.checkpointScope === 'lane' && options.changedPaths.length === 0) {
    throw new Error('Lane checkpoint requires --paths');
  }
  return options;
}

function readLayoutOption(value, cwd) {
  if (value === undefined || Object.hasOwn(LAYOUT_PRESETS, value)) return value;
  const file = path.resolve(cwd, value);
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`--layout ${value} is neither a preset (${Object.keys(LAYOUT_PRESETS).join(', ')}) nor a readable JSON file: ${error.message}`);
  }
}

function colorWanted(stream, env) {
  if (env.FORCE_COLOR !== undefined) return env.FORCE_COLOR !== '0';
  return !env.NO_COLOR && Boolean(stream.isTTY);
}

export function main(argv = process.argv.slice(2), { stdout = process.stdout, stderr = process.stderr, cwd = process.cwd(), env = process.env } = {}) {
  const options = parseArguments(argv);
  if (options.help) {
    stdout.write(HELP);
    return 0;
  }
  const policy = loadPolicy(path.resolve(cwd, options.policy ?? DEFAULT_POLICY_PATH));
  const layout = resolveLayout(policy, readLayoutOption(options.layout, cwd) ?? policy.layout);
  for (const warning of layout.warnings) stderr.write(`warning: ${warning}\n`);
  const inputs = options.changedPaths.length > 0
    ? { base: options.base ?? null, head: options.head ?? null, changedPaths: options.changedPaths, deletedPaths: [] }
    : resolveGitInputs({ base: options.base, head: options.head }, { cwd, env });
  const plan = planValidation(
    {
      intent: options.intent,
      checkpointScope: options.checkpointScope,
      risk: options.risk,
      testPaths: options.testPaths,
      checkIds: options.checkIds,
      ci: options.ci,
      base: inputs.base,
      head: inputs.head,
      workingCopyFingerprint: inputs.workingCopyFingerprint ?? null,
      changedPaths: inputs.changedPaths,
      deletedPaths: inputs.deletedPaths,
      environment: { capabilities: options.capabilities },
    },
    { policy, layout },
  );
  if (options.json) {
    stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    return 0;
  }
  const color = colorWanted(stdout, env);
  stdout.write(renderPlan(plan, { layout, color }));
  stdout.write(renderStatus(plan, { color }));
  return 0;
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  try {
    process.exitCode = main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
