// Optional manual CI preview: apply one exact uncommitted text patch, never commit or deploy.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const MAX_BYTES = 48000;
const hash = raw => createHash('sha256').update(raw).digest('hex');
// Deliberately fixed build/dependency output roots, independent of repository or user ignore rules.
const GENERATED_ROOTS = ['node_modules','_site','_site-sub','.features-gen','test-results','playwright-report','.lighthouseci','review-shots'];
function untrackedInputs(cwd) {
  return execFileSync('git', ['ls-files', '--others', '-z', ...GENERATED_ROOTS.map(root => '--exclude=/' + root + '/'), '--exclude=/.DS_Store'], { cwd, encoding: 'utf8', maxBuffer: 1024 * 1024 });
}
export function applyPreview(cwd, inputs) {
  if (!inputs || !/^[a-f0-9]{40}$/.test(inputs.base_sha || '') || !/^[a-f0-9]{64}$/.test(inputs.patch_sha256 || '')) throw Error('preview_identity');
  const encoded = inputs.patch_base64;
  if (typeof encoded !== 'string' || encoded.length === 0 || encoded.length > 64000 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) throw Error('patch_encoding_or_capacity');
  const patch = Buffer.from(encoded, 'base64');
  if (patch.length > MAX_BYTES || patch.toString('base64') !== encoded || patch.includes(0)) throw Error('patch_encoding_or_capacity');
  if (hash(patch) !== inputs.patch_sha256) throw Error('patch_hash');
  const text = new TextDecoder('utf-8', { fatal: true }).decode(patch);
  if (/^(?:rename|copy) (?:from|to) |^GIT binary patch$|^(?:old|new) mode |^(?:new|deleted) file mode (?!100644$)/m.test(text)) throw Error('unsupported_patch_operation');
  const git = (args, input) => execFileSync('git', args, { cwd, input, encoding: 'utf8', maxBuffer: 1024 * 1024 });
  if (git(['rev-parse', 'HEAD']).trim() !== inputs.base_sha) throw Error('base_mismatch');
  if (git(['status', '--porcelain=v1', '--untracked-files=no']).trim() || untrackedInputs(cwd)) throw Error('checkout_not_clean');
  const numstat = git(['apply', '--numstat', '-z', '-'], patch);
  const paths = numstat.split('\0').filter(Boolean).map(row => row.split('\t').slice(2).join('\t'));
  if (!paths.length || paths.length > 64) throw Error('patch_file_capacity');
  for (const path of paths) {
    if (!path || /[\x00-\x1f\x7f\\]/.test(path) || path.startsWith('/') || path.split('/').includes('..')) throw Error('patch_path');
    if (/^(?:\.github(?:\/|$)|\.gitleaks\.toml$|scripts\/apply-ci-preview\.mjs$|test\/unit\/ci-preview\.test\.mjs$)/i.test(path) || /(?:^|\/)\.git(?:\/|$)/i.test(path) || /(?:^|\/)(?:\.[^/]*ignore|\.gitmodules|\.env(?:\.[^/]*)?|\.npmrc|\.yarnrc(?:\.yml)?|\.netrc|credentials(?:\.[^/]*)?|[^/]*\.(?:pem|key))$/i.test(path)) throw Error('protected_path');
  }
  git(['apply', '--check', '--index', '--whitespace=error-all', '-'], patch);
  git(['apply', '--index', '--whitespace=error-all', '-'], patch);
  return { mode: 'uncommitted_preview', base_sha: inputs.base_sha, patch_sha256: inputs.patch_sha256, tree_sha: git(['write-tree']).trim(), changed_paths: paths };
}
export function verifyPreview(cwd, evidence) {
  if (!evidence || evidence.mode !== 'uncommitted_preview' || !/^[a-f0-9]{40}$/.test(evidence.base_sha || '') || !/^[a-f0-9]{40}$/.test(evidence.tree_sha || '') || !/^[a-f0-9]{64}$/.test(evidence.patch_sha256 || '')) throw Error('preview_proof_identity');
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1024 * 1024 }).trim();
  if (git(['rev-parse', 'HEAD']) !== evidence.base_sha || git(['write-tree']) !== evidence.tree_sha) throw Error('preview_tree_changed');
  try { git(['diff', '--quiet']); } catch { throw Error('preview_source_changed'); }
  if (untrackedInputs(cwd)) throw Error('preview_source_changed');
  return { ...evidence, source_tree_unchanged_after_checks: true };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const evidence = process.env.JOBCHIT_PREVIEW_EVIDENCE;
    if (!evidence) throw Error('evidence_destination_required');
    const checking = process.argv[2] === '--verify';
    const result = checking ? verifyPreview(process.cwd(), JSON.parse(readFileSync(evidence, 'utf8'))) : applyPreview(process.cwd(), JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')).inputs);
    writeFileSync(evidence, JSON.stringify(result, null, 2) + '\n', { flag: checking ? 'w' : 'wx' });
    console.log(JSON.stringify(result));
  } catch (error) {
    const known = new Set(['preview_identity','patch_encoding_or_capacity','patch_hash','unsupported_patch_operation','base_mismatch','checkout_not_clean','patch_file_capacity','patch_path','protected_path','evidence_destination_required','preview_source_changed','preview_tree_changed','preview_proof_identity']);
    console.error('CI preview rejected: ' + (known.has(error.message) ? error.message : 'event_or_git_rejected'));
    process.exitCode = 1;
  }
}
