---
target: client/public/index.html
total_score: 19
max_score: 28
na_heuristics: 7,9,10
p0_count: 2
p1_count: 2
timestamp: 2026-08-27T17-34-06Z
slug: client-public-index-html
---
# Design Critique — `client/public/index.html` (MineTrans homepage)

**Method: dual-agent** (A: general-purpose subagent — source read + image inspection; no browser-automation tool was available to it, flagged where relevant · B: general-purpose subagent — full detector run + live Playwright browser inspection at desktop/mobile)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Hover/focus states and animated counters work; no active-section scroll indicator |
| 2 | Match System / Real World | 3 | Accurate mining/insurance vocabulary throughout |
| 3 | User Control and Freedom | 2 | 5s intro splash has no skip/dismiss control and replays every new tab |
| 4 | Consistency and Standards | 2 | The reserved red BI-failure glow (documented as exclusive to a separate component) is already running on this page |
| 5 | Error Prevention | 3 | No forms on this page to break |
| 6 | Recognition Rather Than Recall | 3 | Dropdown sub-labels aid recognition |
| 7 | Flexibility and Efficiency | n/a | Persuade-mode landing page |
| 8 | Aesthetic and Minimalist Design | 3 | Disciplined system undercut by 5x reused cube graphic, a gradient-text instance, and a skipped heading level |
| 9 | Error Recovery | n/a | No error states on a static marketing page |
| 10 | Help and Documentation | n/a | FAQ/BI-methodology exist as separate linked resources |
| **Total** | | **19/28** | **Acceptable (68%)** |

## Design Specificity Verdict

Copy layer is genuinely MineTrans-specific (FSP 53166, three named facets, mining vocabulary, accurate JSON-LD, a real 1915 mining-patent-drawing watermark). Illustration layer undercuts it: `our-approach.webp` and `our-products.webp` reuse the identical AI-generated isometric "glowing cube with ACTUARIAL/TECHNICAL/TECHNOLOGY strata" motif, recurring a 3rd/4th/5th time inside the facet risk-assessment PNGs — a generic B2B-SaaS-explainer genre repeated five times on one page, undermining the claim that the 12-step methodology is a real differentiator. Warm sunset-photo intro also doesn't match the onyx/copper system.

Detector (CLI degraded-mode + browser-injected real DOM scan) found: em-dash-overuse (12, both agree), all-caps-body (x4), border-accent-on-rounded (x2, likely nav dropdown), hero-eyebrow-chip, undersized-ui-text (10.5px, below 11px floor), tiny-text (11px x2), overused-font (Inter 49%), kicker-above-heading (x5), repeated-container-text ("RUNNING" x3), gradient-text, skipped-heading (h2->h4, no h3). No horizontal overflow, no broken images, no page-caused console errors at either viewport.

False positives against this project's own DESIGN.md: hero-eyebrow-chip and kicker-above-heading are literally "The Eyebrow Rule," DESIGN.md's own signature pattern. overused-font (Inter, body font) is expected. tiny-text (11px) is a documented step in DESIGN.md's own type scale.

Real findings worth fixing: undersized-ui-text (10.5px, genuinely below the system's own floor), skipped-heading (real a11y defect), gradient-text (DESIGN.md never sanctions gradient type), all-caps-body on 32-52 char runs longer than a short eyebrow kicker.

## Overall Impression

Good bones — real product specificity in copy, disciplined type/color system, a strong mid-page emotional beat (BI-failure cascade animation) — undercut by reusing one generic illustration five times where the real differentiator deserves a bespoke visual, and by running the one visual effect the system explicitly reserves for elsewhere.

## What's Working

- Trust stats (FSP 53166, 3 facets, 1 accountability point, 100% compliant) front-loaded right after the hero, correctly in the reserved monospace font.
- Facet-card lightbox: keyboard focus-trap, Escape-to-close, focus restored to trigger, descriptive alt text.
- Repeated, specific value prop ("one point of accountability across three interconnected risk categories") at hero, section, and CTA.

## Priority Issues

[P0] The homepage runs the "reserved" red BI-failure glow itself. Why: DESIGN.md reserves colored glows exclusively for a BI-failure component "elsewhere in the app"; this page's `.flow.fail` state already autoplays the same red glow/shake/vignette in an infinite loop. Fix: decide canonical ownership — restyle the homepage teaser copper-only and stop the loop, or update DESIGN.md if it belongs here too. Command: /impeccable harden

[P0] 5-second intro splash has no skip control and is tonally off-brand. Why: the true first-impression moment is unskippable, replays every new tab, and sits a warm sunset photo under only 32%-alpha overlay vs. the system's 80%-alpha near-black everywhere else. Fix: add a skip/dismiss affordance and grade the photo further toward onyx/copper. Command: /impeccable polish

[P1] Five instances of one reused generic "glowing cube" template graphic. Why: `our-approach.webp`, `our-products.webp`, and all three facet risk PNGs share the identical motif — the clearest "could be any B2B site" moment, undermining the real methodology differentiator. Fix: replace with a literal 12-step flow diagram and a real tiered-product comparison. Command: /impeccable distill

[P1] Regulatory disclosure is visually underweighted. Why: FSP/Donaldson Group disclosure is only 11.5px, 75%-opacity, non-linked footer text for a FAIS/POPIA-regulated purchase. Fix: link to a compliance detail page, raise contrast/weight. Command: /impeccable clarify

[P2] Heading hierarchy skips a level (h2 -> h4, no h3). Why: confirmed by the browser detector — a real a11y defect breaking screen-reader outlines. Fix: insert the missing h3 or renumber. Command: /impeccable audit

[P2] BI-failure animation loops forever, unprompted, beside running body copy. Why: effective once, but an infinite ~14.6s loop with shake/glow fights "one thing at a time" for anyone still reading. Fix: run 1-2 cycles then settle on the recovered end state, or gate replay behind a manual control. Command: /impeccable quieter

## Persona Red Flags

Jordan (first-timer): forced through 5s of unskippable, tonally mismatched intro before any value proposition.
Riley (stress-tester): notices the reused cube graphic and the infinite-looping animation; hunts for and barely finds the regulatory disclosure.
Casey (mobile): responsive CSS is conscientious and confirmed zero horizontal overflow at 390px; unconfirmed whether the two 1400px-wide raster infographics (baked-in text) stay legible at mobile width.

## Minor Observations

- Footer FSP paragraph uses `<b>` where the rest of the page uses semantic `<strong>`.
- Count-up animation on "53166" (a license number) is an odd use of the count-up pattern.
- `.impact` box copy is hardcoded in JS strings, invisible to view-source and no-JS paths.
- Hero's italic `<em>` treatment in Playfair Display is a nice, restrained flourish.
- Nav dropdown's border-radius:2px is a small pre-existing inconsistency against DESIGN.md's documented 4px dropdown radius.

## Questions to Consider

1. If colored glows are reserved exclusively for a BI-failure visualization "elsewhere in the app," why is the identical effect already autoplaying on the homepage?
2. Is the 5-second intro earning its keep for a returning evaluator opening a third comparison tab?
3. Given the real differentiator is an ownable 12-step methodology, why illustrate it with the same generic template used for the unrelated product-tier pitch?
