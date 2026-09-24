import { hex, parseAddress, parseUuid } from '@critter-crumbs/shared';
/** Keep only accepted public identifiers. Allocations and plaintext never enter browser storage. */
export function createReceiptBook(storage?: Pick<Storage,'getItem'|'setItem'>) {
  const memory = new Map<string,string[]>();
  const key = (feast: string,address: string) => `cc.receipts.${parseUuid(feast)}.${parseAddress(address)}`;
  function read(feast: string,address: string) {
    const name=key(feast,address); let saved: string[]=[];
    try { const value:unknown=JSON.parse(storage?.getItem(name) ?? '[]'); if(Array.isArray(value)) saved=value.map(uid=>hex(uid,32)); } catch { /* The in-memory receipt survives unavailable storage. */ }
    return [...new Set([...saved,...memory.get(name) ?? []])];
  }
  return { read, remember(feast: string,address: string,uid: string) { const name=key(feast,address), values=[...new Set([...read(feast,address),hex(uid,32)])]; memory.set(name,values); try { storage?.setItem(name,JSON.stringify(values)); } catch { /* Recording a receipt must never turn an accepted scatter into a failed save. */ } } };
}

let browserBook: ReturnType<typeof createReceiptBook> | undefined;
export function browserReceiptBook() { if(!browserBook) { let storage:Storage|undefined; try { storage=window.localStorage; } catch { /* In-memory receipts remain available across route changes. */ } browserBook=createReceiptBook(storage); } return browserBook; }
