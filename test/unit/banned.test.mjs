import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findBanned } from '../../scripts/banned.mjs';
import { builtHtml } from './helpers.mjs';

test('findBanned catches each banned claim, in any case and across line breaks', () => {
  const samples = {
    'legally binding': 'This change order is Legally\n  Binding.',
    compliant: 'Stay compliant with state rules.',
    guarantee: 'Payment guaranteed.',
    'meets california law': 'This form meets California law.',
    'legally valid': 'E-signatures are legally valid.',
    enforceable: 'An enforceable signature.',
    'holds up in court': 'It holds up in court.',
    'esign act': 'Covered by the ESIGN Act.',
    ueta: 'Under UETA, signatures count.',
    penalt: 'Avoid penalties of up to $5,000.',
  };
  for (const [phrase, text] of Object.entries(samples)) {
    assert.ok(findBanned(text).includes(phrase), `missed "${phrase}" in: ${text}`);
  }
});

test('findBanned passes plain copy', () => {
  assert.deepEqual(findBanned('Get every change signed before the work starts. Ask a lawyer about your situation.'), []);
});

test('no built page makes a banned claim', () => {
  const pages = builtHtml();
  assert.ok(pages.length >= 9, `expected at least 9 built pages, found ${pages.length}`);
  for (const { path, html } of pages) assert.deepEqual(findBanned(html), [], path);
});
