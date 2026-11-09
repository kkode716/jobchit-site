import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read, builtHtml, isNoindex } from './helpers.mjs';

const FOOTER = 'General information, not legal advice. Check with your state licensing board or a lawyer.';
const PAGES = {
  'state-rules/california/index.html': /^https:\/\/leginfo\.legislature\.ca\.gov\/faces\/codes_displaySection\.xhtml\?lawCode=BPC&amp;sectionNum=7159(\.10)?$/,
  'state-rules/virginia/index.html': /^https:\/\/law\.lis\.virginia\.gov\/(admincode\/title18\/agency50\/chapter22\/section260|vacode\/title54\.1\/chapter11\/section54\.1-1100)\/$/,
};

for (const [page, official] of Object.entries(PAGES)) {
  test(`${page}: the footer matches the fixed text exactly`, () => {
    const match = read(page).match(/<p class="rule-footer">([\s\S]*?)<\/p>/);
    assert.ok(match, 'no .rule-footer paragraph');
    assert.equal(match[1], FOOTER);
  });

  test(`${page}: every quote cites the official source`, () => {
    const cites = [...read(page).matchAll(/<blockquote[^>]*\bcite="([^"]*)"/g)].map((m) => m[1]);
    assert.ok(cites.length >= 1, 'no cited blockquote');
    for (const cite of cites) assert.match(cite, official);
  });

  test(`${page}: a draft carries noindex and no other page links to it`, () => {
    const html = read(page);
    if (!isNoindex(html)) return; // approved and live: nothing to hide
    const slug = page.replace(/index\.html$/, '');
    for (const { path, html: other } of builtHtml()) {
      if (path === page) continue;
      assert.doesNotMatch(other, new RegExp(`href="[^"]*${slug}"`), `${path} links to the draft page`);
    }
  });
}

test('the Virginia page is live after the founder approved it (K1, 2026-11-08)', () => {
  assert.ok(!isNoindex(read('state-rules/virginia/index.html')), 'the Virginia page still carries the draft noindex');
  assert.match(read('index.html'), /<a href="\/state-rules\/virginia\/">Virginia<\/a>/, 'the home FAQ does not link the Virginia page');
});
