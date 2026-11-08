// Shared Lighthouse CI settings: every built page, every category at 0.9 or higher.
// Results stay on disk (.lighthouseci/); nothing is uploaded.
const all = { 'categories:performance': ['error', { minScore: 0.9 }], 'categories:accessibility': ['error', { minScore: 1 }], 'categories:best-practices': ['error', { minScore: 0.9 }], 'categories:seo': ['error', { minScore: 0.9 }] };
// The 404 page and any draft pages carry noindex on purpose, which fails the crawlability audit, so their SEO score is checked audit by audit.
const { 'categories:seo': _seo, ...noindexed } = all;

module.exports = (preset) => ({
  ci: {
    collect: { staticDistDir: './_site', maxAutodiscoverUrls: 0, numberOfRuns: 1, settings: preset === 'desktop' ? { preset: 'desktop' } : {} },
    assert: {
      assertMatrix: [
        { matchingUrlPattern: '^(?!.*(404|state-rules\/virginia)).*$', assertions: all },
        // Draft until the founder approves it (D19); drop this row and the exclusion above when it goes live.
        { matchingUrlPattern: 'state-rules/virginia', assertions: { ...noindexed, 'document-title': 'error', 'meta-description': 'error', 'link-text': 'error', 'crawlable-anchors': 'error' } },
        { matchingUrlPattern: '404', assertions: { ...noindexed, 'document-title': 'error', 'meta-description': 'error', 'link-text': 'error', 'crawlable-anchors': 'error', 'http-status-code': 'off' } },
      ],
    },
    upload: { target: 'filesystem', outputDir: `.lighthouseci/${preset}` },
  },
});
