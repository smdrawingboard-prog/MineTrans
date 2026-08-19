---
target: Homepage (index.html)
total_score: 32
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 0
timestamp: 2026-08-19T11-34-50Z
slug: client-public-index-html
---
Method: dual-agent (A: general-purpose design review · B: general-purpose detector/browser evidence)

## Fix Verification

All 5 fixes from the last pass were independently re-tested by Assessment A under adversarial conditions, and cross-checked in source by Assessment B:

| Fix | Result | Evidence |
|---|---|---|
| P0 — stat band correct with no JS | **PASS** | Values now hardcoded in markup, not JS-injected; no "0" state possible even to flash |
| P0 — Instrument Rule (mono font) | **PASS** | Computed `font-family` confirmed `IBM Plex Mono` on `.stat .cnt`, `.facet .fnum`, `.flow .node .st`; source grep confirms font load + `--mf` + all 3 usages |
| P1 — Approach/Products headings + zoom | **PASS** | Eyebrow+H2+lede present; lightbox opens full-res image on both desktop click and mobile tap |
| P1 — aria-expanded on nav dropdown | **PASS** | Full lifecycle verified: false→true on focus/hover, stays true while tabbing inside the menu, resets false on tab-out |
| P2 — hero CTA | **PASS** | `.herocta` present, correctly styled as a quieter secondary CTA that doesn't compete with the nav button |

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4/4 | Nav, dropdown, lightbox, and flow-diagram states all give clear feedback |
| 2 | Match System / Real World | 4/4 | Domain vocabulary correct throughout |
| 3 | User Control and Freedom | 3/4 | No skip-to-content link ahead of the nav |
| 4 | Consistency and Standards | 4/4 | Facet cards, engine panels, eyebrow pattern applied identically everywhere |
| 5 | Error Prevention | 3/4 | No form on this page to misuse; nothing to prove this against |
| 6 | Recognition Rather Than Recall | 4/4 | Numbered facets, consistent iconography |
| 7 | Flexibility and Efficiency | n/a | Genuinely inapplicable to a first-touch marketing page |
| 8 | Aesthetic and Minimalist Design | 4/4 | Faithfully restrained, matches "quietly luxurious" brief |
| 9 | Error Recovery | 3/4 | No active error states exist; alt text is the only fallback |
| 10 | Help and Documentation | 3/4 | Resources are a click away via nav, no in-context help |
| **Total** | | **32/36** | **Good (89%)** |

**Up from 25/36 on the first run** (both runs scored 9/10 applicable heuristics, so this is a direct like-for-like comparison).

## Design Specificity Verdict

**LLM assessment**: Still reads as authored for this exact vertical — the copper-on-onyx palette, the three risk-specific diagrams, the BI-failure flow animation with its FSP-relevant payoff, and the now-legible Approach/Products infographics all reinforce specificity rather than diluting it.

**Deterministic scan**: CLI ran degraded (regex fallback, acknowledged undercount), 4 hits. Browser overlay found 8 distinct rule types across 21 messages.

**False positives**, re-confirmed against DESIGN.md:
- `dark-glow` — the BI-failure diagram's glow. Reserved, documented.
- `kicker-above-heading` (×5) / `hero-eyebrow-chip` / `all-caps-body` (hero eyebrow) — The Eyebrow Rule, the site's signature.
- `all-caps-body` + `undersized-ui-text` (photo caption, 10.5px) — the documented Photo Bands signature component.
- `border-accent-on-rounded` (nav dropdown) — documented deliberate accent (surfaced the same DESIGN.md radius/code mismatch as before: doc says 4px, code is 2px — still unfixed, trivial).
- `repeated-container-text` ("RUNNING" ×3) — intentional parallel node states.
- `overused-font` (Inter) — previously confirmed intentional.
- `all-caps-body` on the new `.herocta` link (32 chars) — consistent with the same Label-role uppercase convention already used on every other button/link in the system (`.ctabtn`, `.btn-nav`, nav links); not a new defect, just the established pattern applied to new markup.

**Genuine findings, pre-existing and outside the 5-issue scope**: `side-tab` (`.block`, still dead/unused CSS on this page), `line-length` (~108–122 chars/line on the footer's `.fsp` legal disclaimer), `skipped-heading` (h2→h4 in the footer, no h3), `em-dash-overuse` (12, advisory).

## Overall Impression

The fix pass held up completely under adversarial re-testing — no cosmetic-only fixes, nothing broke under stress (JS disabled, tab-order edge cases, mobile touch). The homepage moved from "acceptable, bordering good" to solidly "Good." What's left is smaller and mostly pre-existing: a nav that's carried 8 top-level items since before this critique cycle started, and a borderline-AA contrast case on the failure-state text.

## What's Working

1. **The fix-to-verification loop itself** — all 5 claimed fixes were genuinely, not cosmetically, correct. That's not always true of a first-pass fix.
2. **The lightbox-everywhere pattern** now covers the facet diagrams and both engine panels with one reused implementation — exactly the consistency DESIGN.md asks for.
3. **The Instrument Rule is now load-bearing, not aspirational** — seeing 53166 / 01 — The Mine / FAILED all drop into mono next to serif/sans prose genuinely reads as "a firm that measures things."

## Remaining Issues

**[P2] Primary nav carries 8 top-level items**, exceeding the site's own "minimal choices" bar (Home, Insurance▾, Mining Risk, Insights, News, BI Methodology, FAQ, Blueprint, plus the CTA). A first-time visitor is asked to parse 8 destinations before the hero has finished making its case. Pre-existing, not introduced by this fix pass, but real and flagged independently by cognitive-load analysis. **Fix**: group Insights/News/FAQ/Blueprint under a secondary "Resources" dropdown (mirroring the existing Insurance dropdown pattern), leaving 4–5 primary items. → `/impeccable layout`

**[P3] Failure-red on charcoal is a borderline AA contrast case.** `#E04B4B` on `#1E1D20` measures ~4.22:1 — just under the 4.5:1 threshold for normal text — on the flow node status labels (FAILED/STOPPED/IDLE) at 11px. This is the page's emotional peak moment; it should be the most legible text on the page, not the most marginal. **Fix**: brighten the red slightly for text use, or bump the status label size one more step. → `/impeccable audit`

**[P3] Cleanup debt, pre-existing, not blocking**: dead `.block`/`.blockgrid` CSS still ships unused; DESIGN.md's dropdown-radius prose (4px) doesn't match the actual CSS (2px); the footer's legal disclaimer runs long lines (~108–122 chars); 12 em-dashes across body copy (advisory only); footer heading outline skips h3.

## Persona Red Flags

**Jordan (first-timer)**: The Approach/Products friction is gone. Only remaining friction is the 8-item nav forcing a choice before the hero lands its pitch.
**Riley (stress-tester)**: Deliberately tried to break every fix — JS off, tab-order edge cases, mobile touch on the lightbox. Nothing broke.
**Casey (mobile)**: The persona this P1 fix was explicitly for is now served — eyebrow→H2→lede→tappable zoom panel, not a headless illegible scroll-past.

## Questions to Consider

1. Was the 8-item nav a deliberate scope decision at some point, or has it just never been revisited since the site grew past 4-5 sections?
2. Now that Approach/Products have full heading treatment, should they be pulled higher in the page — ahead of the photo band — since they now explain the *how* right after the facet cards explain the *what*?
