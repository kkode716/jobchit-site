# jobchit-site

The Jobchit marketing site: the landing page with the waitlist, pricing, free change-order and estimate templates, and state requirement pages. Static HTML built with Eleventy 3; no app code, no secrets, no customer data.

## Run it

```bash
npm ci
npx playwright install chromium
npm run build     # _site/, including the template PDFs
npm run serve     # http://localhost:8080/
```

## Test it

```bash
npm test          # builds at / and /jobchit-site/, then unit, BDD (playwright-bdd) and axe tests
npm run lhci      # Lighthouse CI, mobile and desktop; reports in .lighthouseci/
```

gitleaks runs in Docker with the pinned image in `.github/workflows/ci.yml`.

## Build settings

| Variable | Default | What it does |
|---|---|---|
| `PATH_PREFIX` | `/` | Path the site lives under, such as `/jobchit-site/` on github.io |
| `SITE_URL` | `http://localhost:8080` | Origin only, used for canonical links, the sitemap and robots.txt |
| `CONTACT_EMAIL` | empty | The address on the Privacy page; the Pages workflow refuses to publish without it |
| `PUBLISH` | unset | `1` leaves out pages marked `draft: true` |
| `OUT_DIR` | `_site` | Output folder |

## Rules for content

- Requirement pages quote the statute word for word from the official source, show the date it was verified, and end with the fixed footer. They start as `draft: true` and go live only after the founder approves them.
- Never write "legally binding", "compliant", "guaranteed", "meets California law", or anything about e-signature validity. `test/unit/banned.test.mjs` fails the build on these.
- The waitlist slot on the home page (`src/_includes/waitlist.njk`) is where the Tally embed goes.

Deploys run only by hand, from `.github/workflows/pages.yml`.
