import { expect, test } from 'vitest';
import { createLocalAccount, buildSignInMessage, verifySignInMessage } from '@critter-crumbs/core';

const account = () => createLocalAccount(`0x${'0'.repeat(63)}1`);
const challenge = { nonce: '12'.repeat(16), issuedAt: 0, expiresAt: 600000 };
test('Account builds the exact full-address sign-in message', () => {
  expect(buildSignInMessage(account().address, challenge)).toBe('Critter Crumbs\n\nConnect as 0x7e5f4552091a69125d5dfcb7b8c2659029395bdf\n\nNonce: 12121212121212121212121212121212\nIssued: 1970-01-01T00:00:00.000Z\nExpires: 1970-01-01T00:10:00.000Z');
});
test.each([['before expiry', 599999, true], ['at expiry', 600000, false], ['before issuance', -1, false]] as const)('Account sign-in %s', async (_, now, expected) => {
  const signer = account();
  const signature = await signer.signMessage(buildSignInMessage(signer.address, challenge));
  expect(await verifySignInMessage(signer.address, challenge, signature, now)).toBe(expected);
});
test('Account rejects a sign-in from the wrong address', async () => {
  const signer = account();
  const signature = await signer.signMessage(buildSignInMessage(signer.address, challenge));
  expect(await verifySignInMessage(`0x${'2'.repeat(40)}`, challenge, signature, 1)).toBe(false);
});
test('Account disconnect rejects further signing', async () => {
  const signer = account(); await signer.disconnect();
  await expect(signer.signMessage('example')).rejects.toThrow();
});
