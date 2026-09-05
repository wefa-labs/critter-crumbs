import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, writeFile, readdir, lstat, readlink, readFile, realpath } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const toolRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const npmCli = process.env.npm_execpath;
assert(npmCli, 'Run this probe with npm run check:workspaces.');
const require = createRequire(join(toolRoot, 'package.json'));
const { build } = require('@vercel/node');
const { FileFsRef, download } = require('@vercel/build-utils');
const tsc = require.resolve('typescript/bin/tsc');
const builderVersion = require('@vercel/node/package.json').version;
const buildUtilsVersion = require('@vercel/build-utils/package.json').version;
const nftVersion = require('@vercel/nft/package.json').version;
const scratch = await realpath(await mkdtemp(join(tmpdir(), 'critter-crumbs-vercel-workspaces-')));

async function put(path, text) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text);
}

function runNode(args, cwd) {
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', env: { ...process.env, npm_config_update_notifier: 'false' } });
  if (result.status !== 0) {
    throw new Error(`Node exited ${result.status}: ${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

async function collect(dir, root = dir, files = {}) {
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    const stat = await lstat(path);
    if (stat.isDirectory()) {
      await collect(path, root, files);
    } else {
      files[relative(root, path)] = new FileFsRef({ fsPath: path, mode: stat.mode });
    }
  }
  return files;
}

async function probe(shape) {
  const workPath = join(scratch, shape, 'input');
  const outputPath = join(scratch, shape, 'output');
  const extension = shape === 'source' ? 'src/index.ts' : 'dist/index.js';
  await put(join(workPath, 'package.json'), JSON.stringify({
    name: 'critter-crumbs-resolution-probe', private: true, type: 'module',
    engines: { node: '22.x' }, workspaces: ['packages/shared', 'packages/core'],
  }, null, 2));
  await put(join(workPath, '.npmrc'), 'ignore-scripts=true\naudit=false\nfund=false\n');
  await put(join(workPath, 'tsconfig.json'), JSON.stringify({ compilerOptions: {
    target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', strict: true,
    skipLibCheck: true, types: [], declaration: true,
  } }, null, 2));
  for (const name of ['shared', 'core']) {
    await put(join(workPath, 'packages', name, 'package.json'), JSON.stringify({
      name: `@critter-crumbs/${name}`, version: '0.0.0', private: true, type: 'module',
      exports: { '.': { types: shape === 'source' ? './src/index.ts' : './dist/index.d.ts', default: `./${extension}` } },
      ...(name === 'core' ? { dependencies: { '@critter-crumbs/shared': '0.0.0' } } : {}),
    }, null, 2));
    await put(join(workPath, 'packages', name, 'tsconfig.json'), JSON.stringify({
      extends: '../../tsconfig.json', compilerOptions: { rootDir: 'src', outDir: 'dist' }, include: ['src'],
    }, null, 2));
  }
  await put(join(workPath, 'packages/shared/src/index.ts'), 'export const marker: string = "shared";\n');
  await put(join(workPath, 'packages/core/src/index.ts'), 'import { marker as shared } from "@critter-crumbs/shared";\nexport const marker: string = `core:${shared}`;\n');
  await put(join(workPath, 'api/probe.ts'), 'import { marker } from "@critter-crumbs/core";\nexport default function probe(): string { return marker; }\n');

  const npmOutput = runNode([npmCli, 'install', '--offline', '--ignore-scripts', '--audit=false', '--fund=false', '--package-lock=false'], workPath);
  const inputLinks = {};
  for (const name of ['shared', 'core']) {
    const path = join(workPath, 'node_modules/@critter-crumbs', name);
    assert((await lstat(path)).isSymbolicLink());
    inputLinks[name] = await readlink(path);
  }
  if (shape === 'dist') {
    for (const name of ['shared', 'core']) runNode([tsc, '-p', `packages/${name}/tsconfig.json`], workPath);
  }
  await put(join(workPath, 'tsconfig.base.json'), await readFile(join(toolRoot, 'tsconfig.base.json'), 'utf8'));
  await put(join(workPath, 'api/tsconfig.json'), await readFile(join(toolRoot, 'api/tsconfig.json'), 'utf8'));
  const files = await collect(workPath);
  const result = await build({
    files, entrypoint: 'api/probe.ts', workPath, repoRootPath: workPath,
    config: { projectSettings: { installCommand: '' } },
    considerBuildCommand: true, meta: { skipDownload: true },
  });
  const output = result.output;
  assert.equal(output.type, 'Lambda');
  await download(output.files, outputPath);
  const outputLinks = {};
  for (const name of ['shared', 'core']) {
    const path = join(outputPath, 'node_modules/@critter-crumbs', name);
    outputLinks[name] = await readlink(path);
    assert((await realpath(path)).startsWith(outputPath + '/'));
  }
  const emittedRoute = join(outputPath, 'api/probe.js');
  const invocation = spawnSync(process.execPath, ['--input-type=module', '-e',
    'const { default: probe } = await import(process.argv[1]); console.log(probe());', pathToFileURL(emittedRoute).href], {
    cwd: outputPath, encoding: 'utf8', env: process.env,
  });
  const summary = {
    shape, npmOutput, inputLinks, runtime: output.runtime, handler: output.handler,
    emittedFiles: Object.keys(output.files).sort(), outputLinks,
    coreExports: JSON.parse(await readFile(join(outputPath, 'packages/core/package.json'), 'utf8')).exports,
    invocation: { exit: invocation.status, stdout: invocation.stdout.trim(), error: invocation.stderr.split('\n').filter(line => /Error \[|Cannot find module/.test(line)).join('\n') },
  };
  if (shape === 'dist') {
    assert.equal(invocation.status, 0, invocation.stderr);
    assert.equal(invocation.stdout.trim(), 'core:shared');
  }
  console.log(`${shape}: emitted function exit=${invocation.status}, output=${invocation.stdout.trim() || summary.invocation.error}`);
  return summary;
}

console.log(`Node ${process.version}; npm ${runNode([npmCli, '--version'], scratch)}; @vercel/node ${builderVersion}; build-utils ${buildUtilsVersion}; nft ${nftVersion}`);
const results = [];
for (const shape of ['source', 'dist']) results.push(await probe(shape));
await put(join(scratch, 'results.json'), JSON.stringify(results, null, 2));
console.log('Built dist exports pass through preserved workspace links.');
