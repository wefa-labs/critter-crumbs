// Pins what .agents/policy.json blocks, asks about and allows. The machine-wide guards apply it to
// each simple command's words joined by spaces (after the scanner splits chains, drops quotes and
// strips wrappers such as env or npx): a `prefix` rule matches the first words, a `pattern` rule
// is a regular expression over them.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const policy = JSON.parse(readFileSync('.agents/policy.json', 'utf8'));
const decide = (command) => {
  const words = command.split(' ');
  const hit = policy.commands.find((rule) => (Array.isArray(rule.prefix) ? rule.prefix.every((word, i) => words[i] === word) : new RegExp(rule.pattern).test(words.join(' '))));
  return hit ? `${hit.action} ${hit.id}` : 'allow';
};
const force = '--' + 'force';

const expected = {
  'block git-push-force': [`git push ${force}-with-lease origin kit`, `git -C /tmp/x push ${force} origin kit`, `/usr/bin/git push ${force} origin kit`, 'git push -uf origin main', 'git push origin +main', 'git push origin +main:main'],
  'block git-push-mirror': ['git push --mirror', 'git push --mirr'],
  'block git-push-delete': ['git push origin :feature', 'git push origin -d kit', 'git push origin --delete kit', 'git push origin --del x', 'git push -ud origin x', 'git push --prune origin refs/heads/*:refs/heads/*'],
  'block git-reset-hard': ['git reset --hard', 'git reset --ha', 'git -C . reset --hard HEAD~1', 'git --work-tree . reset --hard'],
  'block git-clean-force': ['git clean -fdx', 'git --no-pager clean -fdx', `git clean ${force}`, 'git clean --forc -d', 'git -c clean.requireForce=false clean -dx', 'git -c clean.requireForce= clean -dx'],
  'block git-branch-force-delete': ['git -C . branch -D x', `git branch --delete ${force} x`, 'git branch --del --forc x', 'git branch -f -d x', 'git branch -df x', 'git branch -fd x', 'git branch -f main HEAD~5'],
  'block git-discard-all': ['git -C . checkout .', 'git --git-dir=.git checkout .', 'git checkout -f', 'git checkout --forc main', 'git checkout -qf main', 'git checkout -fB main origin/main', 'git checkout ./', 'git checkout -- ./', 'git checkout ..', 'git checkout -- *', 'git checkout -- :(top)', 'git checkout HEAD -- .', 'git switch -f main', 'git switch -qf main', 'git switch --discard-changes main', 'git switch --discard main'],
  'block git-restore-all': ['git restore .', 'git -c a=b restore .', 'git restore :/', 'git restore ./', 'git restore *', 'git restore :(top)', 'git restore --staged --worktree .', 'git restore --staged --work .', 'git restore -W .', 'git restore --source=HEAD~3 -- .'],
  'block git-history-rewrite': ['git -C . filter-branch --all', 'git-filter-repo --path x --invert-paths', 'git reflog expire --all', 'git reflog delete HEAD@{1}', 'git gc --prune=now', 'git gc --prune=all', 'git prune --expire=now', 'git -C . prune'],
  'block admin-merge': ['gh pr merge 98 --merge --admin', 'gh pr merge 98 --admin=true', 'gh api -X PUT repos/wefa-labs/critter-crumbs/pulls/98/merge'],
  'block bun-test': ['bun test'],
  'ask production-deploy': ['bun run deploy --production --execute', 'node --env-file-if-exists=.env scripts/deploy.mjs --execute --production --testnet'],
  'ask vercel-production': ['vercel deploy --prod', 'vercel --prod=true', 'vercel --target production', 'vercel promote https://x.vercel.app', 'vercel --cwd . promote https://x.vercel.app', 'vercel rollback'],
  'ask eas-schema-registration': ['bun run register-schemas --execute'],
  allow: [
    'git push', 'git push -u origin kit', 'git push --follow-tags origin main', 'git push origin feature-fast', 'git push origin HEAD', 'git push origin feat-f', 'git push origin HEAD:refs/heads/x',
    'git restore --staged .', 'git restore -S .', 'git restore --staged a.ts', 'git checkout ./file.ts', 'git checkout -- src/a.ts', 'git checkout -b feature/x', 'git checkout -B feat origin/feat',
    'git push --progress origin main', 'git push --dry-run -u origin feat', 'git fetch --prune', 'git remote prune origin', 'git worktree prune', 'git reset --help', 'git switch -', 'git checkout -',
    'git branch -d merged', 'git clean -n', 'git -C . status', 'git log -p --follow src/a.ts', 'git -c core.pager=cat log -p', 'git reset --soft HEAD~1', 'git stash push -m x -- .',
    'gh pr merge 98 --merge', 'gh api repos/wefa-labs/critter-crumbs/pulls/98', 'vercel build --prod', 'vercel ls --prod', 'vercel inspect x --prod', 'vercel deploy',
    'bun run deploy --production', 'bun run register-schemas --check', 'bun run test',
  ],
};

test('the policy is valid, so the guards enforce it rather than set it aside', () => {
  // The guards refuse a whole policy file when any rule is malformed (~/.agents/guards/lib/policy.mjs).
  assert.equal(policy.version, 1);
  const ids = policy.commands.map((rule) => rule.id);
  assert.equal(new Set(ids).size, ids.length, 'rule ids are unique');
  for (const rule of policy.commands) {
    assert.ok(rule.id && rule.message && ['block', 'ask'].includes(rule.action), rule.id);
    assert.ok(Array.isArray(rule.prefix) || typeof rule.pattern === 'string', rule.id);
    if (rule.pattern) new RegExp(rule.pattern);
  }
  for (const rule of policy.paths) assert.ok(rule.id && rule.message && typeof rule.glob === 'string' && ['block', 'notice'].includes(rule.action), rule.id);
  for (const pattern of policy.proof.commands) new RegExp(pattern);
});

for (const [decision, commands] of Object.entries(expected)) {
  test(`${decision}`, () => {
    for (const command of commands) assert.equal(decide(command), decision, command);
  });
}
