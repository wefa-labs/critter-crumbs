import { DARK_SETTING_KEY } from '@critter-crumbs/shared';

/**
 * Dark mode follows the device until someone chooses for themselves. The stylesheet follows the device by itself
 * (tokens.css), so the page is right before any script runs; a choice is kept in storage and written on the root
 * element, where it overrides the device either way.
 */
export function readDarkChoice(storage: Pick<Storage, 'getItem'> | undefined): boolean | null {
  try { const value = storage?.getItem(DARK_SETTING_KEY); return value === '1' ? true : value === '0' ? false : null; } catch { return null; }
}
export function saveDarkChoice(storage: Pick<Storage, 'setItem'> | undefined, dark: boolean) {
  try { storage?.setItem(DARK_SETTING_KEY, dark ? '1' : '0'); } catch { /* The choice still holds for this visit when browser storage is unavailable. */ }
}
export function showDarkChoice(root: HTMLElement, choice: boolean | null) {
  if (choice === null) delete root.dataset.theme; else root.dataset.theme = choice ? 'dark' : 'light';
}
