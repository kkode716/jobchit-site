import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from './pages.js';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

for (const path of PAGES) {
  for (const colorScheme of ['light', 'dark']) {
    for (const width of [375, 1440]) {
      test(`axe: ${path} ${colorScheme} ${width}`, async ({ browser, baseURL }) => {
        const context = await browser.newContext({ baseURL, colorScheme, viewport: { width, height: 900 } });
        const page = await context.newPage();
        await page.goto(path);
        // Reveal every section and let the demos finish, so axe checks the page as a reader sees it.
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) {
            scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 80));
          }
        });
        if (path === '/') await page.waitForTimeout(3600);
        await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
        await context.close();
      });
    }
  }
}
