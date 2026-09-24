import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';
import { ESLint } from 'eslint';

const eslint = new ESLint();
const check = async (code, file) => (await eslint.lintText(code, { filePath: path.resolve(file) }))[0].messages;
const has = async (code, file, rule) => (await check(code, file)).some((message) => message.ruleId === `critter-crumbs/${rule}`);

test('HTML injection forms fail lint, while textContent is allowed', async () => {
  for (const code of ['element.innerHTML = text;', 'element["outerHTML"] = text;', 'element[`innerHTML`] = text;', 'element.insertAdjacentHTML("beforeend", text);', 'const { innerHTML } = element;', 'const view = <div dangerouslySetInnerHTML={data} />;']) {
    assert.equal(await has(code, 'packages/app/src/probe.tsx', 'no-html'), true, code);
  }
  assert.equal(await has('element.textContent = text;', 'packages/app/src/probe.ts', 'no-html'), false);
});

test('clock reads and aliases fail outside the exact adapter allow-list', async () => {
  for (const code of ['Date.now();', 'Date["now"]();', 'new Date();', 'performance.now();', 'const clock = Date;', 'const clock = Date as typeof Date;', 'const { now } = Date;', 'globalThis.Date.now();']) {
    assert.equal(await has(code, 'packages/core/src/probe.ts', 'time-as-input'), true, code);
    assert.equal(await has(code, 'packages/core/src/api-client/clock-offset.ts', 'time-as-input'), false, code);
  }
  assert.equal(await has('new Date(timestamp); Date.parse(value);', 'packages/core/src/probe.ts', 'time-as-input'), false);
  assert.equal(await has('Date.now();', 'api/_lib/not-clock.ts', 'time-as-input'), true);
  assert.equal(await has('Date.now();', 'packages/api/src/clock.ts', 'time-as-input'), false);
  assert.equal(await has('Date.now();', 'packages/api/src/api.ts', 'time-as-input'), true);
  assert.equal(await has('Date.now();', 'api/_lib/clock.ts', 'time-as-input'), true);
});

test('workspace imports reject reverse and private paths across each syntax', async () => {
  for (const code of ['import "@critter-crumbs/app";', 'export * from "@critter-crumbs/app";', 'import("@critter-crumbs/app");', 'import(`@critter-crumbs/app`);', 'import(target);', 'require(`@critter-crumbs/app`);', 'import app = require("@critter-crumbs/app");', 'require("@critter-crumbs/app");', 'import "@critter-crumbs/shared/src/index.js";', 'import "../../shared/src/index.js";']) {
    assert.equal(await has(code, 'packages/core/src/probe.ts', 'imports'), true, code);
  }
  assert.equal(await has('import "@critter-crumbs/core";', 'packages/shared/src/probe.ts', 'imports'), true);
  assert.equal(await has('import "@critter-crumbs/app";', 'api/probe.ts', 'imports'), true);
  for (const file of ['packages/shared/src/probe.ts', 'packages/core/src/probe.ts', 'packages/app/src/probe.ts']) {
    assert.equal(await has('import "@critter-crumbs/api";', file, 'imports'), true);
  }
  assert.equal(await has('import "@critter-crumbs/api";', 'api/probe.ts', 'imports'), false);
  assert.equal(await has('import "../packages/api/src/index.js";', 'api/probe.ts', 'imports'), true);
  assert.equal(await has('import "@critter-crumbs/api/src/api.js";', 'api/probe.ts', 'imports'), true);
  assert.equal(await has('import "@critter-crumbs/app";', 'packages/api/src/probe.ts', 'imports'), true);
  for (const file of ['packages/core/src/probe.ts', 'packages/app/src/probe.ts', 'api/probe.ts']) {
    assert.equal(await has('import "@critter-crumbs/shared";', file, 'imports'), false);
  }
});

test('visible JSX wording and indirect literals require copy IDs', async () => {
  for (const code of ['const view = <p>Hello</p>;', 'const label = "Hello" as const;', 'const view = <p>{"Hello"}</p>;', 'const view = <input placeholder="Hello" />;', 'const label = "Hello"; const view = <p>{label}</p>;', 'const view = <p>{`Hello ${name}`}</p>;']) {
    assert.equal(await has(code, 'packages/app/src/probe.tsx', 'copy-ids'), true, code);
  }
  assert.equal(await has('import { copy } from "@critter-crumbs/shared"; const view = <p className="statement" aria-label={copy["gathering.title"]}>{copy["gathering.title"]}</p>;', 'packages/app/src/probe.tsx', 'copy-ids'), false);
});

test('copy guard permits protocol syntax and real copy IDs, not wording hidden in callbacks', async () => {
  for (const code of [
    'const view = <p>{formatCopy("home.title")}</p>;',
    'const view = <Field label="burrow.name.label" />;',
    'const message: CopyId = "err.generic";',
    'const view = <input autoCapitalize="none" />;',
    'addEventListener("popstate", changed); document.getElementById("main"); matchMedia("(prefers-reduced-motion: reduce)");',
    'const view = <button onClick={() => api.write(`/api/burrows/${id}`, "POST", { name })}>{copy["action.connect"]}</button>;',
    'const resource = useResource(api, `/api/burrows/${id}`); navigate(`/burrows/${id}`); const isHome = path === "/";',
    'const provider = await import("../dev/account-provider.js");',
  ]) assert.equal(await has(code, 'packages/app/src/probe.tsx', 'copy-ids'), false, code);
  for (const code of [
    'const view = <button onClick={() => alert("Hello")}>{copy["action.connect"]}</button>;',
    'const view = <p>{formatCopy("home.title", { name: "Hello" })}</p>;',
    'const view = <Field label="Hello" />;',
    'const label = "Hello"; const view = <p>{label}</p>;',
  ]) assert.equal(await has(code, 'packages/app/src/probe.tsx', 'copy-ids'), true, code);
});

test('copy guard permits domain transitions but rejects literal-union inline wording', async () => {
  assert.equal(await has('const [phase, setPhase] = useState<"read" | "scatter">("read"); setPhase("scatter");', 'packages/app/src/probe.tsx', 'copy-ids'), true);
  assert.equal(await has('const [kind, setKind] = useState<FeastKind>("people"); setKind("options");', 'packages/app/src/probe.tsx', 'copy-ids'), false);
  assert.equal(await has('type Label = "Hello" | "Goodbye"; const label: Label = "Hello"; const view = <p>{label}</p>;', 'packages/app/src/probe.tsx', 'copy-ids'), true);
  assert.equal(await has('setLabel("Hello");', 'packages/app/src/probe.tsx', 'copy-ids'), true);
  assert.equal(await has('const view = <p>{"people"}</p>;', 'packages/app/src/probe.tsx', 'copy-ids'), true);
});
