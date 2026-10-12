import { expect, test } from 'vitest';
import { optionInitial, optionPicture } from '../src/app/connect-option.js';

const option = (icon?: string, name = 'Rabby') => ({ id: 'io.example', name, ...(icon === undefined ? {} : { icon }) });

test('a choice shows the picture its app announced only when the picture is carried in the address itself', () => {
  const png = 'data:image/png;base64,iVBORw0KGgo=', svg = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22/%3E';
  expect(optionPicture(option(png))).toBe(png);
  expect(optionPicture(option(svg))).toBe(svg);
});

test('nothing is fetched on an app’s say-so: an address anywhere else, or one that is not an image, is not used', () => {
  for (const icon of ['https://example.com/icon.png', '//example.com/icon.png', '/icon.png', 'javascript:alert(1)', 'data:text/html,<p>hi</p>', 'data:image/png.evil.example/x', '']) expect(optionPicture(option(icon))).toBeNull();
  expect(optionPicture(option())).toBeNull();
});

test('without a picture the choice shows its initial', () => {
  expect(optionInitial(option(undefined, 'rabby'))).toBe('R');
  expect(optionInitial(option(undefined, '  MetaMask'))).toBe('M');
  expect(optionInitial(option(undefined, ''))).toBe('');
});
