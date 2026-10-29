import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read, builtHtml, isNoindex } from './helpers.mjs';

const FOOTER = 'General information, not legal advice. Check with your state licensing board or a lawyer.';
const PAGE = 'state-rules/california/index.html';

test('the California page footer matches the fixed text exactly', () => {
  const match = read(PAGE).match(/<p class="rule-footer">([\s\S]*?)<\/p>/);
  assert.ok(match, 'no .rule-footer paragraph');
  assert.equal(match[1], FOOTER);
});

test('every statute quote cites the official leginfo page', () => {
  const quotes = [...read(PAGE).matchAll(/<blockquote([^>]*)>/g)];
  assert.ok(quotes.length >= 1, 'no blockquote');
  for (const [, attrs] of quotes) assert.match(attrs, /cite="https:\/\/leginfo\.legislature\.ca\.gov\/faces\/codes_displaySection\.xhtml\?lawCode=BPC&amp;sectionNum=7159(\.10)?"/);
});

test('a draft requirement page carries noindex and no other page links to it', () => {
  const html = read(PAGE);
  if (!isNoindex(html)) return; // approved and live: nothing to hide
  for (const { path, html: other } of builtHtml()) {
    if (path === PAGE) continue;
    assert.doesNotMatch(other, /href="[^"]*state-rules\/california\/"/, `${path} links to the draft page`);
  }
});
