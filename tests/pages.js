// Every built page, for the axe and Lighthouse runs. Keep in step with src/.
export const PAGES = [
  '/',
  '/pricing/',
  '/templates/',
  '/templates/change-order-remodelers/',
  '/templates/change-order-handymen/',
  '/templates/estimate/',
  '/templates/change-order-painters/',
  '/templates/estimate-painters/',
  '/templates/change-order-flooring/',
  '/templates/estimate-flooring/',
  '/templates/change-order-decks/',
  '/templates/estimate-decks/',
  '/templates/change-order-bathrooms/',
  '/templates/estimate-bathrooms/',
  '/templates/change-order-kitchens/',
  '/templates/estimate-kitchens/',
  '/state-rules/california/',
  '/state-rules/virginia/',
  '/privacy/',
  '/404.html',
];

// The two local servers Playwright starts: the root build and the GitHub Pages subpath build.
export const ORIGINS = { '/': 'http://localhost:8080', '/jobchit-site/': 'http://localhost:8081' };
