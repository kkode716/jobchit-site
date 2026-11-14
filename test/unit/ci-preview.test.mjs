import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as preview from '../../scripts/apply-ci-preview.mjs';
const repository = process.env.JOBCHIT_TEST_SOURCE || resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const digest = raw => createHash('sha256').update(raw).digest('hex');
function fixture(callback) {
  const parent = mkdtempSync(join(tmpdir(), 'jobchit-ci-preview-'));
  const cwd = join(parent, 'repo');
  try {
    execFileSync('git', ['clone', '--quiet', '--no-hardlinks', '--no-checkout', repository, cwd]);
    const git = (...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' }).trim();
    git('checkout', '--quiet', '--detach', 'HEAD');
    const base = git('rev-parse', 'HEAD');
    const old = readFileSync(join(cwd, 'README.md'), 'utf8');
    writeFileSync(join(cwd, 'README.md'), old + '\nPreview validation fixture.\n');
    const patch = Buffer.from(execFileSync('git', ['-C', cwd, 'diff', '--binary', 'HEAD']));
    git('restore', '--', 'README.md');
    const inputs = { base_sha: base, patch_sha256: digest(patch), patch_base64: patch.toString('base64') };
    return callback({ cwd, git, old, inputs, patch });
  } finally { rmSync(parent, { recursive: true, force: true }); }
}
test('applies a checked uncommitted patch and attests the exact staged tree without a commit', () => fixture(({ cwd, git, old, inputs }) => {
  assert.equal(typeof preview.applyPreview, 'function');
  const result = preview.applyPreview(cwd, inputs);
  assert.equal(result.base_sha, inputs.base_sha);
  assert.equal(result.patch_sha256, inputs.patch_sha256);
  assert.equal(result.tree_sha, git('write-tree'));
  assert.equal(result.mode, 'uncommitted_preview');
  assert.equal(git('rev-parse', 'HEAD'), inputs.base_sha);
  assert.equal(readFileSync(join(cwd, 'README.md'), 'utf8'), old + '\nPreview validation fixture.\n');
  assert.match(git('diff', '--cached', '--name-only'), /^README.md$/);
}));
test('wrong patch digest refuses without altering the checkout', () => fixture(({ cwd, git, inputs }) => {
  assert.equal(typeof preview.applyPreview, 'function');
  assert.throws(() => preview.applyPreview(cwd, { ...inputs, patch_sha256: '0'.repeat(64) }), /patch_hash/);
  assert.equal(git('status', '--porcelain'), '');
}));
test('wrong base refuses without altering the checkout', () => fixture(({ cwd, git, inputs }) => {
  assert.equal(typeof preview.applyPreview, 'function');
  assert.throws(() => preview.applyPreview(cwd, { ...inputs, base_sha: '0'.repeat(40) }), /base_mismatch/);
  assert.equal(git('status', '--porcelain'), '');
}));
test('invalid base64 and capacity refuse before applying', () => fixture(({ cwd, git, inputs }) => {
  assert.equal(typeof preview.applyPreview, 'function');
  for (const patch_base64 of ['!!!!', inputs.patch_base64 + '\n', Buffer.alloc(48001).toString('base64')]) {
    assert.throws(() => preview.applyPreview(cwd, { ...inputs, patch_base64 }), /patch_encoding_or_capacity/);
  }
  assert.equal(git('status', '--porcelain'), '');
}));
test('existing local changes are preserved and refused', () => fixture(({ cwd, git, inputs }) => {
  assert.equal(typeof preview.applyPreview, 'function');
  writeFileSync(join(cwd, 'owner-note.txt'), 'preserve\n');
  assert.throws(() => preview.applyPreview(cwd, inputs), /checkout_not_clean/);
  assert.equal(readFileSync(join(cwd, 'owner-note.txt'), 'utf8'), 'preserve\n');
  assert.equal(git('diff', '--cached', '--name-only'), '');
}));
test('workflow and credential paths are refused before any application', () => fixture(({ cwd, git, inputs }) => {
  assert.equal(typeof preview.applyPreview, 'function');
  for (const name of ['.github/workflows/ci.yml', '.env', 'scripts/apply-ci-preview.mjs']) {
    const patch = Buffer.from(`diff --git a/${name} b/${name}\nnew file mode 100644\n--- /dev/null\n+++ b/${name}\n@@ -0,0 +1 @@\n+preview\n`);
    assert.throws(() => preview.applyPreview(cwd, { ...inputs, patch_base64: patch.toString('base64'), patch_sha256: digest(patch) }), /protected_path/);
    assert.equal(git('status', '--porcelain'), '');
  }
}));
test('CLI rejects malformed events without printing their potentially private content', async () => fixture(({ cwd, git }) => {
  const event = join(cwd, '..', 'event.json');
  writeFileSync(event, 'PRIVATE_SENTINEL not JSON');
  let failure;
  try {
    execFileSync(process.execPath, [fileURLToPath(new URL('../../scripts/apply-ci-preview.mjs', import.meta.url))], { cwd, encoding: 'utf8', env: { ...process.env, GITHUB_EVENT_PATH: event, JOBCHIT_PREVIEW_EVIDENCE: join(cwd, '..', 'proof.json') }, stdio: ['pipe','pipe','pipe'] });
  } catch (error) { failure = error; }
  assert.ok(failure);
  assert.equal(failure.status, 1);
  assert.doesNotMatch(failure.stderr, /PRIVATE/);
  assert.equal(git('status', '--porcelain'), '');
}));
test('post-check proof rejects source mutations after the attested patch', () => fixture(({ cwd, inputs }) => {
  assert.equal(typeof preview.verifyPreview, 'function');
  const result = preview.applyPreview(cwd, inputs);
  assert.equal(preview.verifyPreview(cwd, result).source_tree_unchanged_after_checks, true);
  writeFileSync(join(cwd, 'README.md'), 'changed after checks\n');
  assert.throws(() => preview.verifyPreview(cwd, result), /preview_source_changed/);
}));
test('post-check proof rejects changed staging or unexpected untracked inputs', () => fixture(({ cwd, git, inputs }) => {
  assert.equal(typeof preview.verifyPreview, 'function');
  const result = preview.applyPreview(cwd, inputs);
  writeFileSync(join(cwd, 'owner-note.txt'), 'unexpected\n');
  assert.throws(() => preview.verifyPreview(cwd, result), /preview_source_changed/);
  git('add', '--', 'owner-note.txt');
  assert.throws(() => preview.verifyPreview(cwd, result), /preview_tree_changed/);
}));
test('ignore policy and package-manager credential policy paths are protected at every depth', () => fixture(({ cwd, git, inputs }) => {
  for (const name of ['.gitignore','src/.gitignore','.git/info/ignore','.git/info/exclude','.gitmodules','src/.gitmodules','.npmrc','config/.npmrc','.yarnrc','src/.yarnrc.yml','.gitleaksignore','src/.eleventyignore']) {
    const patch = Buffer.from(`diff --git a/${name} b/${name}\nnew file mode 100644\n--- /dev/null\n+++ b/${name}\n@@ -0,0 +1 @@\n+preview\n`);
    assert.throws(() => preview.applyPreview(cwd, { ...inputs, patch_base64: patch.toString('base64'), patch_sha256: digest(patch) }), /protected_path/);
    assert.equal(git('status', '--porcelain'), '');
  }
}));
test('post-check proof detects untracked source even when mutable Git ignore metadata hides it', () => fixture(({ cwd, inputs }) => {
  const result = preview.applyPreview(cwd, inputs);
  writeFileSync(join(cwd, '.git/info/exclude'), 'src/hidden-preview-input.js\n');
  writeFileSync(join(cwd, 'src/hidden-preview-input.js'), 'unexpected source input\n');
  assert.throws(() => preview.verifyPreview(cwd, result), /preview_source_changed/);
}));
test('initial cleanliness detects an ignored untracked source input before applying', () => fixture(({ cwd, inputs }) => {
  writeFileSync(join(cwd, '.git/info/exclude'), 'src/hidden-preview-input.js\n');
  writeFileSync(join(cwd, 'src/hidden-preview-input.js'), 'unexpected source input\n');
  assert.throws(() => preview.applyPreview(cwd, inputs), /checkout_not_clean/);
}));
test('only fixed generated output roots are excluded from untracked input checks', async () => fixture(({ cwd, inputs }) => {
  const result = preview.applyPreview(cwd, inputs);
  for (const root of ['node_modules','_site','_site-sub','.features-gen','test-results','playwright-report','.lighthouseci','review-shots']) {
    mkdirSync(join(cwd, root), { recursive: true });
    writeFileSync(join(cwd, root, 'generated-output.txt'), 'generated\n');
  }
  assert.equal(preview.verifyPreview(cwd, result).source_tree_unchanged_after_checks, true);
}));
