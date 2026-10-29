// Every built page, for the axe and Lighthouse runs. Keep in step with src/.
export const PAGES = [
  '/',
  '/pricing/',
  '/templates/',
  '/templates/change-order-remodelers/',
  '/templates/change-order-handymen/',
  '/templates/estimate/',
  '/state-rules/california/',
  '/privacy/',
  '/404.html',
];

// The two local servers Playwright starts: the root build and the GitHub Pages subpath build.
export const ORIGINS = { '/': 'http://localhost:8080', '/jobchit-site/': 'http://localhost:8081' };
