// Pins what .agents/policy.json blocks, asks about and allows. The machine-wide guards apply it to
// each simple command's words joined by spaces (after wrappers such as env or npx): a `prefix` rule
// matches the first words, a `pattern` rule is a regular expression over them.
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
  'block git-push-mirror': ['git push --mirror'],
  'block git-push-delete': ['git push origin :feature', 'git push origin -d kit', 'git push origin --delete kit'],
  'block git-reset-hard': ['git reset --hard', 'git -C . reset --hard HEAD~1'],
  'block git-clean-force': ['git clean -fdx', 'git --no-pager clean -fdx', `git clean ${force}`],
  'block git-branch-force-delete': ['git -C . branch -D x', `git branch --delete ${force} x`, 'git branch -f -d x'],
  'block git-discard-all': ['git -C . checkout .', 'git --git-dir=.git checkout .', 'git checkout -f'],
  'block git-restore-all': ['git restore .', 'git -c a=b restore .', 'git restore :/', 'git restore --staged --worktree .', 'git restore -W .'],
  'block git-history-rewrite': ['git -C . filter-branch --all', 'git reflog expire --all', 'git gc --prune=now'],
  'block admin-merge': ['gh pr merge 98 --merge --admin', 'gh pr merge 98 --admin=true', 'gh api -X PUT repos/wefa-labs/critter-crumbs/pulls/98/merge'],
  'block bun-test': ['bun test'],
  'ask production-deploy': ['bun run deploy --production --execute', 'node --env-file-if-exists=.env scripts/deploy.mjs --execute --production --testnet'],
  'ask vercel-production': ['vercel deploy --prod', 'vercel --prod=true', 'vercel --target production', 'vercel promote https://x.vercel.app', 'vercel rollback'],
  'ask eas-schema-registration': ['bun run register-schemas --execute'],
  allow: [
    'git push', 'git push -u origin kit', 'git push --follow-tags origin main', 'git push origin feature-fast', 'git restore --staged .', 'git restore -S .', 'git restore --staged a.ts',
    'git checkout ./file.ts', 'git checkout -b feature/x', 'git branch -d merged', 'git clean -n', 'git -C . status', 'git log -p --follow src/a.ts', 'git reset --soft HEAD~1',
    'gh pr merge 98 --merge', 'gh api repos/wefa-labs/critter-crumbs/pulls/98', 'vercel build --prod', 'vercel deploy', 'bun run deploy --production', 'bun run register-schemas --check', 'bun run test',
  ],
};

for (const [decision, commands] of Object.entries(expected)) {
  test(`${decision}`, () => {
    for (const command of commands) assert.equal(decide(command), decision, command);
  });
}
