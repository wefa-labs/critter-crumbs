import { expect, test } from 'vitest';
import { statementParts, cappedStatement } from '../src/app/statements.js';
test('statements preserve plain text and link only http(s) URLs', () => {
  const body = '<script>alert(1)</script>\njavascript:alert(1) https://example.com/a?q=1&b=2.';
  const parts = statementParts(body);
  expect(parts.map(part => part.text).join('')).toBe(body);
  expect(parts.filter(part => part.href).map(part => part.href)).toEqual(['https://example.com/a?q=1&b=2']);
});
test('visible links cap at 48 code points while destinations remain complete', () => {
  const url = `https://example.com/${'x'.repeat(100)}`;
  const [part] = statementParts(url);
  expect(part!.href).toBe(url); expect(Array.from(part!.label!).length).toBe(48);
});
test('pasted statements follow the shared Unicode code-point cap', () => {
  const body = '🌳'.repeat(2001), result = cappedStatement(body);
  expect(result).toEqual({ body: '🌳'.repeat(2000), truncated: true });
  expect(cappedStatement('🌳'.repeat(2000)).truncated).toBe(false);
});
