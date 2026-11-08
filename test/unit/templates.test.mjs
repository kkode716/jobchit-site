import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import templates from '../../src/_data/templates.js';
import { read, SITE } from './helpers.mjs';

const TRADES = ['painters', 'flooring', 'decks', 'bathrooms', 'kitchens'];
const SLUGS = ['change-order-remodelers', 'change-order-handymen', 'estimate', ...TRADES.flatMap((t) => [`change-order-${t}`, `estimate-${t}`])];

test('the template list has a change order and an estimate for each trade', () => {
  assert.deepEqual(templates.map((t) => t.slug).sort(), [...SLUGS].sort());
  for (const t of templates) assert.ok(t.name && t.summary, `${t.slug} needs a name and summary`);
});

test('every template page has the sheet foot, and change orders say when work starts', () => {
  for (const slug of SLUGS) {
    const html = read(`templates/${slug}/index.html`);
    assert.match(html, /<p class="sheet__foot">Free template from jobchit\.com\. General information, not legal advice\.<\/p>/, slug);
    if (slug.startsWith('change-order')) {
      assert.match(html, /sheet__notice/, `${slug} has no start-of-work notice`);
      assert.match(html, /Check with your state licensing board\./, `${slug} lost the state-rules tip`);
    }
  }
});

test('every template PDF is one US Letter page', () => {
  for (const slug of SLUGS) {
    const pdf = readFileSync(join(SITE, 'templates', `${slug}.pdf`), 'latin1');
    assert.match(pdf, /\/Type \/Pages\s*\/Count 1\b/, `${slug}.pdf is not one page`);
    assert.match(pdf, /\/MediaBox \[0 0 612 792\]/, `${slug}.pdf is not US Letter`);
  }
});
