const { test, expect } = require('@playwright/test');
const AndyFX = require('../andy-fx.js');

// 1-based month, unlike Date
const theme = (y, m, d, options) => AndyFX.detectTheme(new Date(y, m - 1, d), options);

test('picks holidays by date and country', () => {
  expect(theme(2025, 12, 25, { country: 'US' })).toBe('christmas');
  expect(theme(2025, 10, 31, { country: 'US' })).toBe('halloween');
  expect(theme(2025, 11, 1, { country: 'MX' })).toBe('diademuertos');
  expect(theme(2025, 11, 27, { country: 'US' })).toBe('thanksgiving');
  expect(theme(2025, 4, 20, { country: 'US' })).toBe('easter');
  expect(theme(2025, 1, 29, { country: 'CN' })).toBe('lunarnewyear');
  expect(theme(2026, 1, 1, { country: 'DE' })).toBe('fireworks');
});

test('skips holidays outside their regions', () => {
  expect(theme(2025, 10, 31, { country: 'DE' })).toBe('off');
  expect(theme(2025, 11, 27, { country: 'GB' })).toBe('off');
  expect(theme(2025, 12, 25, { country: 'IL' })).not.toBe('christmas');
});

test('seasonal fallback follows the hemisphere', () => {
  expect(theme(2025, 7, 15, { country: 'US', fallback: 'seasonal' })).toBe('summer');
  expect(theme(2025, 7, 15, { country: 'AU', fallback: 'seasonal' })).toBe('winter');
});

test('validates options', () => {
  expect(() => new AndyFX({ theme: 'nope' })).toThrow(/unknown theme/);
  expect(() => new AndyFX({ intensity: 'loud' })).toThrow();
  expect(new AndyFX({ country: 'us' }).country).toBe('US');
});

test('upcoming lists holidays', () => {
  const list = AndyFX.upcoming({ country: 'all' });
  expect(list.length).toBeGreaterThan(5);
  for (const h of list) expect(h.end >= h.start).toBe(true);
});
