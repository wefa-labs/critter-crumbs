import { createChiadoTimelock, createMockTimelock, phaseAt, type Timelock } from '@critter-crumbs/core';
import type { Feast, Registration } from '@critter-crumbs/shared';
import { bytesToHex, hexToBytes } from 'viem';

/** A feast's timelock, and proof that its code works on this device. Nothing is encrypted or opened before `ready`. */
export interface FeastTimelock { timelock: Timelock; ready(): Promise<void> }

/** The local rehearsal's store hands out a 32-byte key of its own where Shutter gives a 96-byte eon key. */
const fromRehearsalStore = (registration: Registration) => (registration.eonKey.length - 2) / 2 === 32;

/**
 * A scatter from shutter-sdk's own test data ("encryption 2 / decryption 2", tests/test-data.json at 9a01a6e), with the
 * key that opens it. Shutter's code reaches the page as a script and a WebAssembly file fetched on first use; if it
 * can open this, it arrived and it runs here.
 */
const KNOWN = {
  ciphertext: '0x03a975256b0098bc981da31762a73e50a07c79f5bf3e17c44121b9567033cedaf9e203f0300b709dec3458a88baa18963c0e503f437bff7adb31231941585ea1bb14e8ce98c7dc1471666e4b07c592cbeda30acc22f23dcb84d58d41848e72af0804d348d5c5cb65a52dc3b697ea4caae9679b97e395a30807f9657ebc85bbf2fcadaa9a458a86bffb78dde89f7626a26eb84f4781d3b6759c06629ea321a8b757',
  key: '0x81cfcfceebfc69b3cb3fe074f4b3751e7844f6d62b3040563ccb3a2430110f259d109519c73682735f4c02651492c740',
  message: '0x1c',
} as const;

/**
 * The timelock a feast's scatters are encrypted and opened with.
 *
 * A production build uses Shutter and nothing else. The mock's key is known to the store, so a page that could be talked
 * into the mock would hand the host every scatter; Shutter's code refuses a mock registration instead. A development
 * build also accepts the local rehearsal store's registration, which is how a whole feast runs offline in seconds.
 *
 * Production is on Shutter's Chiado network until the mainnet key arrives (docs/build/deployment.md).
 */
export function chooseTimelock({ development, feast, now, shutter = createChiadoTimelock, patienceMs = 20000 }: { development: boolean; feast: Feast; now: () => number; shutter?: () => Timelock; patienceMs?: number }): FeastTimelock {
  const registration = feast.registration;
  if (development && registration && fromRehearsalStore(registration)) {
    const mock = createMockTimelock({ clock: now });
    // The mock's key is its eon key, so a finished feast still opens with the store down.
    return { ready: async () => {}, timelock: { ...mock, getKey: async identity => phaseAt(feast, now()) === 'feast' && registration.identity === identity ? hexToBytes(registration.eonKey) : null } };
  }
  const timelock = shutter();
  let proven: Promise<void> | null = null;
  return {
    timelock,
    // A device that cannot fetch or run the code must hear so. Left unchecked, opening a feast would count every
    // scatter as unreadable and show a result that is not the burrow's. A failed check is tried again next time.
    ready: () => proven ??= new Promise<void>((resolve, reject) => {
      const patience = setTimeout(() => reject(new Error('Shutter did not answer')), patienceMs);
      timelock.decrypt(hexToBytes(KNOWN.ciphertext), hexToBytes(KNOWN.key))
        .then(opened => { if (bytesToHex(opened) !== KNOWN.message) throw new Error('Shutter self-check failed'); })
        .then(resolve, reject).finally(() => clearTimeout(patience));
    }).catch(error => { proven = null; throw error; }),
  };
}
export const feastTimelock = (feast: Feast, now: () => number) => chooseTimelock({ development: import.meta.env.DEV, feast, now });
