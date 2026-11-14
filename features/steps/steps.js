import { expect } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import { ORIGINS } from '../../tests/pages.js';
import { stubTally } from '../../tests/tally.js';
import templates from '../../src/_data/templates.js';

// ctx.page is the page every step acts on; "JavaScript is off" swaps it for a page in a no-JS context.
export const test = base.extend({
  ctx: async ({ page }, use) => {
    const ctx = { page, contexts: [] };
    await stubTally(page);
    await use(ctx);
    for (const c of ctx.contexts) await c.close();
  },
});
const { Given, When, Then } = createBdd(test);

Given('JavaScript is off', async ({ ctx, browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  ctx.contexts.push(context);
  ctx.page = await context.newPage();
});

Given('I prefer reduced motion', async ({ ctx }) => {
  await ctx.page.emulateMedia({ reducedMotion: 'reduce' });
});

Given('I open {string}', async ({ ctx }, path) => {
  const res = await ctx.page.goto(path);
  expect(res.status()).toBe(200);
});

// Waitlist

When('I choose {string} in the hero', async ({ ctx }, name) => {
  await ctx.page.locator('.hero').getByRole('link', { name }).click();
});

When('I choose {string} on the plan card', async ({ ctx }, name) => {
  await ctx.page.getByRole('article', { name: 'Jobchit' }).getByRole('link', { name }).click();
});

Then('I am at the waitlist section', async ({ ctx }) => {
  await expect(ctx.page).toHaveURL(/\/#waitlist$/);
  const section = ctx.page.locator('section#waitlist');
  await expect(section).toBeInViewport();
  await expect(section.getByTitle('Join the Jobchit waitlist')).toBeVisible();
});

Given('Tally is blocked', async ({ ctx }) => {
  await ctx.page.unroute('https://tally.so/**');
  await ctx.page.route('https://tally.so/**', (route) => route.abort());
});

Then('the waitlist form loads from Tally', async ({ ctx }) => {
  const form = ctx.page.locator('section#waitlist').getByTitle('Join the Jobchit waitlist');
  await expect(form).toHaveAttribute('src', /^https:\/\/tally\.so\/embed\/Nqr5NB\?.*dynamicHeight=1/);
  await expect(ctx.page.frameLocator('section#waitlist iframe').getByRole('heading', { name: 'Stub form' })).toBeVisible();
});

Then('I can open the form on Tally', async ({ ctx }) => {
  await expect(ctx.page.locator('section#waitlist').getByRole('link', { name: 'Open it on Tally' })).toHaveAttribute('href', 'https://tally.so/r/Nqr5NB');
});

// Templates

Then('the template search listings use forms and keep their headings', async ({ request }) => {
  for (const [prefix, origin] of Object.entries(ORIGINS)) {
    for (const { slug, name } of templates) {
      const response = await request.get(`${origin}${prefix}templates/${slug}/`);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html, `${prefix}${slug} title`).toMatch(/<title>(?:Change order|Estimate) form\b/);
      expect(html, `${prefix}${slug} description`).toMatch(/<meta name="description" content="[^"<>]*\bform\b/);
      expect(html, `${prefix}${slug} heading`).toContain(`<h1 id="h1" class="h1">${name}</h1>`);
    }
    const directory = await request.get(`${origin}${prefix}templates/`);
    expect(directory.status()).toBe(200);
    const html = await directory.text();
    expect(html).toContain('<title>Free change-order and estimate forms | Jobchit</title>');
    expect(html).toContain('<meta name="description" content="Printable change-order and estimate forms ');
    expect(html).toContain('<h1 id="h1" class="h1">Free change-order and estimate templates</h1>');
  }
});

Then('I see a link to each of these templates:', async ({ ctx }, table) => {
  const names = table.raw().map(([name]) => name);
  for (const name of names) await expect(ctx.page.getByRole('main').getByRole('link', { name, exact: true })).toBeVisible();
  await expect(ctx.page.getByRole('main').locator('.tpl-card__title a')).toHaveCount(names.length);
});

Then('I see the heading {string}', async ({ ctx }, name) => {
  await expect(ctx.page.getByRole('heading', { level: 1, name, exact: true })).toBeVisible();
});

Then('the page asks for no sign-in or email', async ({ ctx }) => {
  await expect(ctx.page.locator('form, input[type="email"], input[type="password"]')).toHaveCount(0);
  await expect(ctx.page.getByText(/sign in|log in|sign up/i)).toHaveCount(0);
});

Then('I see a {string} button', async ({ ctx }, name) => {
  await expect(ctx.page.getByRole('button', { name, exact: true })).toBeVisible();
});

Then('I see a {string} link', async ({ ctx }, name) => {
  await expect(ctx.page.getByRole('link', { name, exact: true })).toBeVisible();
});

Then('the {string} link returns a PDF', async ({ ctx }, name) => {
  const href = await ctx.page.getByRole('link', { name, exact: true }).getAttribute('href');
  const res = await ctx.page.request.get(new URL(href, ctx.page.url()).href);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toBe('application/pdf');
  expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

When('I press {string}', async ({ ctx }, name) => {
  if (name === 'Print') {
    await ctx.page.evaluate(() => {
      window.__printed = 0;
      window.print = () => { window.__printed += 1; };
    });
  }
  await ctx.page.getByRole('button', { name, exact: true }).click();
});

Then('the print dialog opens', async ({ ctx }) => {
  expect(await ctx.page.evaluate(() => window.__printed)).toBe(1);
});

// Requirement page

Then('I see the statute quoted with {string}', async ({ ctx }, text) => {
  await expect(ctx.page.locator('blockquote').filter({ hasText: text })).toHaveCount(1);
});

Then('every quote cites the official source on leginfo.legislature.ca.gov', async ({ ctx }) => {
  const cites = await ctx.page.locator('blockquote').evaluateAll((els) => els.map((el) => el.cite));
  expect(cites.length).toBeGreaterThan(0);
  for (const cite of cites) expect(cite).toMatch(/^https:\/\/leginfo\.legislature\.ca\.gov\/faces\/codes_displaySection\.xhtml\?lawCode=BPC&sectionNum=7159(\.10)?$/);
});

Then('I see a link to the official source', async ({ ctx }) => {
  await expect(ctx.page.locator('main a[href^="https://leginfo.legislature.ca.gov/"]').first()).toBeVisible();
});

Then('every quote cites an official page on {string}', async ({ ctx }, host) => {
  const cites = await ctx.page.locator('blockquote').evaluateAll((els) => els.map((el) => el.cite));
  expect(cites.length).toBeGreaterThan(0);
  for (const cite of cites) expect(new URL(cite).origin).toBe(`https://${host}`);
});

Then('I see a link to the official source on {string}', async ({ ctx }, host) => {
  await expect(ctx.page.locator(`main a[href^="https://${host}/"]`).first()).toBeVisible();
});

Then('I see the date it was last verified', async ({ ctx }) => {
  const line = ctx.page.getByText(/^Verified on /);
  await expect(line).toBeVisible();
  await expect(line.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
});

Then('the page ends with the footer {string}', async ({ ctx }, text) => {
  const last = ctx.page.locator('main article > :last-child');
  await expect(last).toHaveText(text);
  await expect(last).toHaveClass('rule-footer');
});

// Pricing

Then('the {string} button is pressed', async ({ ctx }, name) => {
  await expect(ctx.page.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
});

Then('the {string} button is not pressed', async ({ ctx }, name) => {
  await expect(ctx.page.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'false');
});

Then('the price shows {string}', async ({ ctx }, price) => {
  await expect(ctx.page.locator('[data-price]')).toHaveText(price);
});

// Motion

// Scrolls from the test side, since page timers don't run with JavaScript off.
When('I scroll to the bottom', async ({ ctx }) => {
  const height = await ctx.page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 400) {
    await ctx.page.mouse.wheel(0, 400);
    await ctx.page.waitForTimeout(50);
  }
});

const toMiddle = (selector) => async ({ ctx }) => {
  await ctx.page.locator(selector).evaluate((el) => el.scrollIntoView({ block: 'center' }));
};
When('I scroll the signature card to the middle of the screen', toMiddle('[data-reveal="sign"]'));
When('I scroll the estimate card to the middle of the screen', toMiddle('[data-reveal="total"]'));

Then('every section is fully visible', async ({ ctx }) => {
  const faded = await ctx.page.evaluate(async () => {
    await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {})));
    return [...document.querySelectorAll('main *')]
      .filter((el) => el.hasAttribute('data-wait') || Number(getComputedStyle(el).opacity) < 1)
      .map((el) => el.outerHTML.slice(0, 80));
  });
  expect(faded).toEqual([]);
});

const signatureDrawn = (page) => page.locator('[data-reveal="sign"] .jc-sig__stroke').evaluate((el) => {
  const s = getComputedStyle(el);
  const stamp = el.closest('[data-reveal]').querySelector('.jc-stamp');
  return (s.strokeDasharray === 'none' || parseFloat(s.strokeDashoffset) === 0) && getComputedStyle(stamp).opacity === '1';
});

Then('the signature is drawn', async ({ ctx }) => {
  await expect.poll(() => signatureDrawn(ctx.page), { timeout: 5000 }).toBe(true);
});

Then('the signature is not drawn yet', async ({ ctx }) => {
  expect(await signatureDrawn(ctx.page)).toBe(false);
});

Then('the estimate total reads {string}', async ({ ctx }, total) => {
  await expect(ctx.page.locator('[data-reveal="total"] dd.jc-total__sum')).toHaveText(total, { timeout: 6000 });
});

// Subpath

Given('the site built for {string} is served', async ({ ctx }, prefix) => {
  ctx.prefix = prefix;
  ctx.origin = ORIGINS[prefix];
});

When('I follow every internal link, stylesheet and asset from the home page and the 404 page', async ({ ctx, request }) => {
  const { origin, prefix } = ctx;
  const queue = [origin + prefix, origin + prefix + '404.html'];
  const seen = new Set(queue);
  const html = new Map();
  ctx.problems = [];
  ctx.anchors = [];
  while (queue.length) {
    const url = queue.shift();
    const res = await request.get(url, { maxRedirects: 0 });
    if (res.status() !== 200) { ctx.problems.push(`${res.status()} ${url}`); continue; }
    const type = res.headers()['content-type'] || '';
    if (!type.startsWith('text/html') && !type.startsWith('text/css')) continue;
    const body = await res.text();
    if (type.startsWith('text/html')) html.set(url, body);
    const refs = type.startsWith('text/html')
      ? [...body.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1])
      : [...body.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => m[1]);
    for (const ref of refs) {
      const target = new URL(ref.replaceAll('&amp;', '&'), url);
      if (target.origin !== origin) continue;
      if (!target.pathname.startsWith(prefix)) { ctx.problems.push(`outside ${prefix}: ${ref} on ${url}`); continue; }
      if (target.hash) ctx.anchors.push({ page: target.origin + target.pathname, id: target.hash.slice(1), from: url });
      target.hash = '';
      if (!seen.has(target.href)) { seen.add(target.href); queue.push(target.href); }
    }
  }
  ctx.html = html;
});

Then('every one answers 200 and stays under {string}', async ({ ctx }, prefix) => {
  expect(ctx.prefix).toBe(prefix);
  expect(ctx.problems).toEqual([]);
  expect(ctx.html.size).toBeGreaterThanOrEqual(8); // every public page; drafts are linked from nowhere
});

Then('every in-page anchor it points to exists', async ({ ctx }) => {
  const missing = ctx.anchors.filter(({ page, id }) => !ctx.html.get(page)?.includes(`id="${id}"`)).map((a) => `#${a.id} on ${a.page} (from ${a.from})`);
  expect(missing).toEqual([]);
});
