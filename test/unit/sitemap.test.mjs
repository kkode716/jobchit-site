import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read, builtHtml, isNoindex, SITE_SUB } from './helpers.mjs';

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const PUBLIC = ['/', '/pricing/', '/templates/', '/templates/change-order-remodelers/', '/templates/change-order-handymen/', '/templates/estimate/', '/templates/change-order-painters/', '/templates/estimate-painters/', '/templates/change-order-flooring/', '/templates/estimate-flooring/', '/templates/change-order-decks/', '/templates/estimate-decks/', '/templates/change-order-bathrooms/', '/templates/estimate-bathrooms/', '/templates/change-order-kitchens/', '/templates/estimate-kitchens/', '/state-rules/california/', '/state-rules/virginia/', '/privacy/'];

test('the sitemap lists every public page and nothing marked noindex', () => {
  const urls = locs(read('sitemap.xml')).map((u) => new URL(u).pathname);
  assert.deepEqual([...urls].sort(), [...PUBLIC].sort());
  for (const { path, html } of builtHtml()) {
    const url = '/' + path.replace(/index\.html$/, '');
    if (isNoindex(html)) assert.ok(!urls.includes(url), `${url} is noindex but in the sitemap`);
  }
});

test('the subpath build puts the prefix on sitemap, canonical and robots URLs', () => {
  for (const u of locs(read('sitemap.xml', SITE_SUB))) assert.match(new URL(u).pathname, /^\/jobchit-site\//);
  assert.match(read('index.html', SITE_SUB), /<link rel="canonical" href="[^"]+\/jobchit-site\/">/);
  assert.match(read('robots.txt', SITE_SUB), /^Sitemap: \S+\/jobchit-site\/sitemap\.xml$/m);
});

test('the 404 page is noindex', () => {
  assert.ok(isNoindex(read('404.html')));
});

test('the home page carries the Search Console verification tag, and only the home page (K3)', () => {
  const tag = '<meta name="google-site-verification" content="gQ9wdC0cLuiTcsNNDOZcYEvO8kqXFWDH4hyWjFSv-hk">';
  assert.ok(read('index.html').includes(tag), 'home page is missing the verification tag');
  for (const { path, html } of builtHtml()) if (path !== 'index.html') assert.ok(!html.includes('google-site-verification'), `${path} has the verification tag`);
});
