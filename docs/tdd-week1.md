# TDD evidence: $0 site, Week 1 (2026-10-29)

Source plan: the approved plan in NewVenture/HANDOFF.md (session 10). No checkpoint commits: the founder's rule is to commit only when asked, so this file holds the RED and GREEN record instead.

## User journeys

- As a contractor, I want to reach the waitlist from the hero and the pricing page, so I can sign up when the form opens.
- As a contractor, I want to print or download a change-order or estimate template without an account or email.
- As a contractor in California, I want the statute quoted with its source and the date it was checked.
- As a visitor, I want to see the yearly price when I choose Yearly.
- As a visitor without JavaScript or with reduced motion, I want every section and the final total shown, not hidden by animation.
- As the founder, I want the same build to work at jobchit.com and under `<user>.github.io/jobchit-site/`, and draft pages kept out of any publish.

## RED

| Run | Command | Result |
|---|---|---|
| Unit, before any page or `money.js` existed | `npm run test:unit` | 2 pass (the banned-phrase matcher), 8 fail: no built site, `money.js` missing |
| BDD against an empty placeholder site | `npx playwright test --project=bdd` | 14 of 14 scenarios fail |
| One-page PDF guard, added after the remodeler PDF ran to 2 pages | `npm run pdf` | `change-order-remodelers: the sheet is 1580px tall in print and won't fit one page (960px)` |
| Publish build leaves out drafts | `node --test test/unit/publish-build.test.mjs` | fails: `the draft California page was built` |

## GREEN

| Run | Command | Result |
|---|---|---|
| Full suite from a clean tree | `npm test` | builds at `/` and `/jobchit-site/` with PDFs; unit 15/15; Playwright 50/50 (14 BDD scenarios, 36 axe runs) |
| Lighthouse CI | `npm run lhci` | 9 pages, mobile and desktop: performance, accessibility and best practices 100; SEO 100 except the 404 page (noindex by design, checked audit by audit) |
| gitleaks | Docker image pinned in `ci.yml`, `dir` mode over the working tree | no leaks found |

Fixes the tests forced: a duplicate landmark name on template pages (axe `landmark-unique`), the no-JS scroll step (page timers don't run with JavaScript off), the phone layout leaking into print at 720px wide, and the description box's ruled lines not printing.

## What the tests guarantee

| # | Guarantee | Test | Type |
|---|---|---|---|
| 1 | "Join the waitlist" in the hero and on the pricing plan card lands on `#waitlist`, which loads the Tally form (stubbed in tests); if Tally is blocked or JavaScript is off, a link opens the form on Tally | `features/waitlist.feature` | BDD |
| 2 | The templates page lists all three; each template page has an h1, Print (calls `window.print`), Download PDF returning `application/pdf`, and no form, email field or sign-in text | `features/templates.feature` | BDD |
| 3 | Every template PDF fits one US Letter page | `scripts/pdf.mjs` guard, run by `npm run build` | build check |
| 4 | The California page quotes §7159(c)(5) word for word, every blockquote cites leginfo, it links the source, shows "Verified on" with an ISO date, and ends with the exact R3 footer | `features/requirement-page.feature`, `test/unit/requirement-page.test.mjs` | BDD, unit |
| 5 | A draft requirement page is noindex, out of the sitemap and linked from no other page; a publish build leaves out every draft page (checked on a fixture, since the founder approved the California page on 2026-10-29) | `test/unit/requirement-page.test.mjs`, `sitemap.test.mjs`, `publish-build.test.mjs` | unit |
| 6 | Yearly shows $240 and flips `aria-pressed`; Monthly goes back to $24 | `features/pricing.feature` | BDD |
| 7 | With JavaScript off, and with reduced motion, nothing in `main` is below full opacity, the signature is drawn and the total reads $1,551.91 | `features/motion.feature` | BDD |
| 8 | With motion, the signature is undrawn until its card reaches mid-screen, then draws; the total counts up to $1,551.91 | `features/motion.feature` | BDD |
| 9 | Under `/` and `/jobchit-site/`, every internal link, stylesheet, font and PDF answers 200, stays under the prefix, and every `#anchor` exists | `features/subpath.feature` | BDD |
| 10 | No built page says "legally binding", "compliant", "guaranteed", "meets California law", or anything about e-signature validity or penalties | `test/unit/banned.test.mjs` | unit |
| 11 | `formatMoney` writes en-US dollars to 2 decimals; `countUpValue` eases out from 0 and lands exactly on the total | `test/unit/money.test.mjs` | unit |
| 12 | Sitemap, canonical and robots URLs carry the subpath in the subpath build; the 404 page is noindex | `test/unit/sitemap.test.mjs` | unit |
| 13 | 0 axe violations (WCAG 2.2 A/AA plus best practice) on all 9 pages, light and dark, at 375 and 1440 | `tests/a11y.spec.js` | a11y |

## Known gaps

- The mockup comparison is a visual review of screenshots, not a pixel diff, as the plan says.
- Tests and axe use a stub in place of Tally, so the form's own markup isn't covered. The real embed was checked by hand at 375 and 1440, light and dark, and axe found 0 WCAG violations in it on 2026-10-30.
