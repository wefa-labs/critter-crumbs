// The merge tier of a repository path, read from .agents/merge-policy.json: the first tier, in
// the order critical, sensitive, routine, whose globs match it. Shared by the tests that keep
// CODEOWNERS and the check selector's policy in step with the merge policy.
import { readFileSync } from 'node:fs';

export const mergePolicy = JSON.parse(readFileSync('.agents/merge-policy.json', 'utf8'));

export const globRegex = (glob) => new RegExp(`^${glob.replace(/\*\*\/|\*\*|\*|\?|[.+^${}()|[\]\\]/g, (token) => ({ '**/': '(.*/)?', '**': '.*', '*': '[^/]*', '?': '[^/]' })[token] ?? `\\${token}`)}$`);

export const tierOf = (file) => ['critical', 'sensitive', 'routine'].find((tier) => mergePolicy.tiers[tier].paths.some((glob) => globRegex(glob).test(file)));
