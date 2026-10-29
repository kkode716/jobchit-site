import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, countUpValue } from '../../src/assets/js/money.js';

test('formatMoney writes US dollars with two decimals and thousands commas', () => {
  assert.equal(formatMoney(1551.91), '$1,551.91');
  assert.equal(formatMoney(17625), '$17,625.00');
  assert.equal(formatMoney(0), '$0.00');
  assert.equal(formatMoney(56.9), '$56.90');
});

test('countUpValue starts at 0 and lands exactly on the total', () => {
  assert.equal(countUpValue(1551.91, 0), 0);
  assert.equal(countUpValue(1551.91, 1), 1551.91);
});

test('countUpValue clamps progress outside 0 to 1', () => {
  assert.equal(countUpValue(100, -0.5), 0);
  assert.equal(countUpValue(100, 2), 100);
});

test('countUpValue eases out: fast at first, never going backwards', () => {
  assert.equal(countUpValue(100, 0.5), 87.5);
  let last = -1;
  for (let t = 0; t <= 1; t += 0.05) {
    const v = countUpValue(100, t);
    assert.ok(v >= last, `value fell at t=${t}`);
    last = v;
  }
});
