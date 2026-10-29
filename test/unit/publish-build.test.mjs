import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The Pages workflow builds with PUBLISH=1. Draft pages must not be in that output at all (D19, R3).
// Built from a fixture folder so the check holds whether or not a real page is a draft right now.
test('a publish build leaves out draft pages and keeps the rest', () => {
  const out = mkdtempSync(join(tmpdir(), 'jobchit-publish-'));
  try {
    execFileSync('npx', ['eleventy', '--quiet', '--input=test/fixtures/drafts', `--output=${out}`], { env: { ...process.env, PUBLISH: '1' }, stdio: 'pipe' });
    assert.ok(!existsSync(join(out, 'draft/index.html')), 'the draft page was built');
    assert.ok(existsSync(join(out, 'live/index.html')), 'the live page is missing');
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('without PUBLISH, draft pages still build for local review', () => {
  const out = mkdtempSync(join(tmpdir(), 'jobchit-preview-'));
  try {
    const env = { ...process.env };
    delete env.PUBLISH;
    execFileSync('npx', ['eleventy', '--quiet', '--input=test/fixtures/drafts', `--output=${out}`], { env, stdio: 'pipe' });
    assert.ok(existsSync(join(out, 'draft/index.html')));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
