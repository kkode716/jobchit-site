// Builds /templates/<slug>.pdf from each template page with Playwright's page.pdf(), using the page's print styles.
// Usage: node scripts/pdf.mjs <built site folder>   (PATH_PREFIX must match the build)
import { chromium } from '@playwright/test';
import { join } from 'node:path';
import templates from '../src/_data/templates.js';
import { serve } from './serve.mjs';

const dir = process.argv[2] || '_site';
const prefix = process.env.PATH_PREFIX || '/';
const server = await serve(dir, 0, prefix);
const origin = `http://localhost:${server.address().port}`;
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const { slug } of templates) {
    const res = await page.goto(`${origin}${prefix}templates/${slug}/`, { waitUntil: 'networkidle' });
    if (res.status() !== 200) throw new Error(`${slug}: HTTP ${res.status()}`);
    await page.emulateMedia({ media: 'print', colorScheme: 'light' });
    // Every template must fit one US Letter page: 7.5 x 10 in inside 0.5 in margins, at 96 px per inch.
    await page.setViewportSize({ width: 720, height: 960 });
    const height = await page.evaluate(() => document.querySelector('.sheet').getBoundingClientRect().height);
    if (height > 960) throw new Error(`${slug}: the sheet is ${Math.ceil(height)}px tall in print and won't fit one page (960px)`);
    await page.pdf({ path: join(dir, 'templates', `${slug}.pdf`), format: 'Letter', preferCSSPageSize: true, printBackground: true });
    console.log(`PDF  ${join(dir, 'templates', `${slug}.pdf`)}`);
  }
} finally {
  await browser.close();
  server.close();
}
