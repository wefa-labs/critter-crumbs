import { SETTINGS } from '@critter-crumbs/shared';
import type { GameSettings } from '../world/index.js';
export const settingKeys = { effects: SETTINGS.effects.key, music: SETTINGS.music.key, still: SETTINGS.still.key, simple: SETTINGS.simple.key } as const;
export type StoredSetting = keyof typeof settingKeys;
type StorageAccess = Pick<Storage, 'getItem' | 'setItem'>;
export function readSettings(storage: Pick<StorageAccess, 'getItem'> | undefined, reducedMotion: boolean): GameSettings {
  const read = (key: StoredSetting) => { try { const value = storage?.getItem(settingKeys[key]); return value === '1' ? true : value === '0' ? false : SETTINGS[key].default === '1'; } catch { return SETTINGS[key].default === '1'; } };
  return { effects: read('effects'), music: read('music'), still: read('still'), simple: read('simple'), reducedMotion };
}
export function saveSetting(storage: Pick<StorageAccess, 'setItem'> | undefined, key: StoredSetting, value: boolean) {
  try { storage?.setItem(settingKeys[key], value ? '1' : '0'); } catch { /* In-memory choices still apply when browser storage is unavailable. */ }
}
export function browserSettings(window: Window) {
  let storage: Storage | undefined;
  try { storage = window.localStorage; } catch { /* Storage can be disabled independently of the rest of the browser. */ }
  return { storage, settings: readSettings(storage, window.matchMedia('(prefers-reduced-motion: reduce)').matches) };
}
