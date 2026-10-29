import { HtmlBasePlugin } from '@11ty/eleventy';

export default function (eleventyConfig) {
  // Rewrites every root-relative href and src in the HTML output to sit under PATH_PREFIX.
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });

  // Draft pages (front matter `draft: true`) build locally for review but stay out of the nav, the sitemap and search,
  // and a publish build (PUBLISH=1, the Pages workflow) leaves them out entirely until the founder approves them (D19).
  if (process.env.PUBLISH) eleventyConfig.addPreprocessor('drafts', '*', (data) => (data.draft ? false : undefined));
  eleventyConfig.addFilter('live', (pages) => pages.filter((p) => !p.data.draft));
  eleventyConfig.addCollection('sitemap', (api) =>
    api.getAll().filter((p) => p.outputPath?.endsWith('.html') && !p.data.draft && !p.data.noindex),
  );
  eleventyConfig.addCollection('stateRules', (api) => api.getFilteredByGlob('src/state-rules/*.njk'));
}

export const config = {
  dir: { input: 'src', output: process.env.OUT_DIR || '_site' },
  pathPrefix: process.env.PATH_PREFIX || '/',
  htmlTemplateEngine: 'njk',
};
