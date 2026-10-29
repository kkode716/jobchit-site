import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export const SITE = new URL('../../_site/', import.meta.url).pathname;
export const SITE_SUB = new URL('../../_site-sub/', import.meta.url).pathname;

// Every built HTML file as { path, html }, path relative to the output folder.
export function builtHtml(root = SITE) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) out.push({ path: relative(root, full), html: readFileSync(full, 'utf8') });
    }
  };
  walk(root);
  return out;
}

export const read = (path, root = SITE) => readFileSync(join(root, path), 'utf8');

export const isNoindex = (html) => /<meta name="robots" content="noindex">/.test(html);
