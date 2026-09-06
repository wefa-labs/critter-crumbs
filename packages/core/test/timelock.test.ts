import { expect, test } from 'vitest';
import { createMockTimelock } from '@critter-crumbs/core';
const feast = '10000000-0000-4000-8000-000000000001';
test('timelock mock round-trip releases at the injected deadline', async () => {
  let now = 999;
  const timelock = createMockTimelock({ secret: 'mock-secret-for-local-tests-only-32', clock: () => now });
  const params = await timelock.register(feast, 1000);
  const plaintext = new TextEncoder().encode('{"v":1}');
  const ciphertext = await timelock.encrypt(plaintext, params);
  expect(await timelock.getKey(params.identity)).toBe(null);
  now = 1000;
  const key = await timelock.getKey(params.identity);
  expect(await timelock.decrypt(ciphertext, key!)).toEqual(plaintext);
});

test('timelock mock rejects tampered ciphertext', async () => {
  const timelock = createMockTimelock({ secret: 'mock-secret-for-local-tests-only-32', clock: () => 1000 });
  const params = await timelock.register(feast, 1000), ciphertext = await timelock.encrypt(new Uint8Array([1,2,3]), params);
  ciphertext[12] = ciphertext[12]! ^ 1;
  await expect(timelock.decrypt(ciphertext, (await timelock.getKey(params.identity))!)).rejects.toThrow();
});
test('timelock mock restores the same key after restart from persisted metadata', async () => {
  const options = { secret: 'mock-secret-for-local-tests-only-32', clock: () => 1000 };
  const original = createMockTimelock(options), params = await original.register(feast, 1000);
  const restarted = createMockTimelock({ ...options, async lookup(identity) { return identity === params.identity ? { feastId: feast, decryptionTimestamp: 1000 } : null; } });
  expect(await restarted.getKey(params.identity)).toEqual(await original.getKey(params.identity));
});
test('timelock mock dev release overrides the deadline only for the named identity', async () => {
  const timelock = createMockTimelock({ secret: 'mock-secret-for-local-tests-only-32', clock: () => 0 });
  const params = await timelock.register(feast, 1000); timelock.release(params.identity);
  expect(await timelock.getKey(params.identity)).not.toBe(null);
  expect(await timelock.getKey(`0x${'00'.repeat(32)}`)).toBe(null);
});
