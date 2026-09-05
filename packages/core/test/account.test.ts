import { expect, test } from 'vitest';
import { createLocalAccount, buildSignInMessage, verifySignInMessage } from '@critter-crumbs/core';

test('Account signs the exact sign-in message and rejects the wrong address or expiry', async () => {
  const account = createLocalAccount(`0x${'0'.repeat(63)}1`);
  const challenge = { nonce: '12'.repeat(16), issuedAt: 0, expiresAt: 600000 };
  const message = buildSignInMessage(account.address, challenge);
  expect(message).toBe('Critter Crumbs\n\nConnect as 0x7e5f4552091a69125d5dfcb7b8c2659029395bdf\n\nNonce: 12121212121212121212121212121212\nIssued: 1970-01-01T00:00:00.000Z\nExpires: 1970-01-01T00:10:00.000Z');
  const signature = await account.signMessage(message);
  expect(await verifySignInMessage(account.address, challenge, signature, 599999)).toBe(true);
  expect(await verifySignInMessage(account.address, challenge, signature, 600000)).toBe(false);
  expect(await verifySignInMessage(`0x${'2'.repeat(40)}`, challenge, signature, 1)).toBe(false);
  await account.disconnect();
  await expect(account.signMessage(message)).rejects.toThrow();
});
