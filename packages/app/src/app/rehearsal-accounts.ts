import type {Account} from '@critter-crumbs/core';
// A local adapter capability; generic injected accounts cannot enter the rehearsal recording flow.
const localRecorders=new WeakSet<Account>();
export function markRehearsalAccount(account:Account) { localRecorders.add(account);return account; }
export const isRehearsalAccount=(account:Account)=>localRecorders.has(account);
