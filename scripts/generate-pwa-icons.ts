/**
 * Generate PWA Icons
 *
 * Creates placeholder PWA icons with the 漢 character on the theme color background.
 * Run with: make generate-icons
 *
 * For production, consider replacing with professionally designed icons.
 */

import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const THEME_COLOR = '#4f7d8c';
const TEXT_COLOR = '#ffffff';
const CHARACTER = '漢';

function generateSvg(size: number): string {
  const fontSize = Math.floor(size * 0.6);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${String(size)}" height="${String(size)}" viewBox="0 0 ${String(size)} ${String(size)}">
  <rect width="${String(size)}" height="${String(size)}" fill="${THEME_COLOR}"/>
  <text
    x="50%"
    y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="'Hiragino Kaku Gothic Pro', 'Yu Gothic', sans-serif"
    font-size="${String(fontSize)}"
    font-weight="bold"
    fill="${TEXT_COLOR}"
  >${CHARACTER}</text>
</svg>`;
}

const sizes = [192, 512];
const publicDir = resolve(import.meta.dirname, '..', 'public');
const APPLE_TOUCH_SIZE = 180;

for (const size of sizes) {
  const svg = generateSvg(size);
  const filename = `pwa-${String(size)}x${String(size)}.svg`;
  writeFileSync(resolve(publicDir, filename), svg, 'utf-8');
  console.log(`Generated ${filename}`);
}

// The browser tab icon: the same artwork, at a small size
writeFileSync(resolve(publicDir, 'favicon.svg'), generateSvg(64), 'utf-8');
console.log('Generated favicon.svg');

// iOS ignores SVG touch icons, so render the artwork to a PNG
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { height: APPLE_TOUCH_SIZE, width: APPLE_TOUCH_SIZE },
});
await page.setContent(`<body style="margin:0">${generateSvg(APPLE_TOUCH_SIZE)}</body>`);
await page.screenshot({ path: resolve(publicDir, 'apple-touch-icon.png') });
await browser.close();
console.log('Generated apple-touch-icon.png');

console.log('\nThe PWA manifest uses the SVGs directly.');
