import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);

test('the EAS development cross-check entry loads with Node', () => {
  const { EAS, Offchain, SchemaEncoder } = require('@ethereum-attestation-service/eas-sdk');
  for (const value of [EAS, Offchain, SchemaEncoder]) assert.equal(typeof value, 'function');
});
