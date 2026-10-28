const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// Over file:// the page loads the local andy-fx.js rather than the CDN build
const url = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;

test('loads without errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url);
  await expect(page.locator('h1')).toHaveText('Seasonal effects for any website.');
  const themeCount = await page.evaluate(() => AndyFX.themes.length);
  await expect(page.locator('#themes button, #seasons button')).toHaveCount(themeCount);
  await expect(page.locator('#badge')).toHaveText('Auto');
  expect(errors).toEqual([]);
});

test('picking a theme shows it and spawns sprites', async ({ page }) => {
  await page.goto(url);
  const christmas = page.locator('[data-theme="christmas"]');
  await christmas.click();
  await expect(christmas).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#active')).toHaveText('🎄 Christmas');
  await expect(page.locator('#badge')).toHaveText('Manual');
  await expect(page.locator('#code')).toContainText("theme: 'christmas'");
  await expect(page.locator('.fx').first()).toBeAttached();
});

test('pause clears sprites and reset goes back to auto', async ({ page }) => {
  await page.goto(url);
  await page.locator('[data-theme="christmas"]').click();
  await page.locator('#toggle').click();
  await expect(page.locator('#why')).toHaveText('Paused');
  await expect(page.locator('.fx')).toHaveCount(0);
  await page.locator('#reset').click();
  await expect(page.locator('#badge')).toHaveText('Auto');
  await expect(page.locator('#why')).toHaveText('');
});

test('respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  await expect(page.locator('#why')).toContainText('reduced motion');
});
