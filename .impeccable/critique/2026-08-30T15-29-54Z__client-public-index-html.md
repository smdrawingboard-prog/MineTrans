---
target: client/public/index.html
total_score: 19
max_score: 36
na_heuristics: 9
p0_count: 2
p1_count: 2
timestamp: 2026-08-30T15-29-54Z
slug: client-public-index-html
---
Method: dual-agent (A: a47dc2f20175e142a · B: a6c9c8b0d56dd5346)

## Design Health Score

| # | Heuristic | Score | Key Finding |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | 5s intro splash has no progress/skip indicator; `.burger` never sets `aria-expanded` (unlike `.dropbtn`, which correctly does); 1.3–1.5 MB diagrams load with no placeholder |
| 2 | Match System / Real World | 3 | Strong trade vocabulary throughout; loses a point for unglossed "Blueprint" nav item sitting between "Mining Risk" and "Request a Review" |
| 3 | User Control and Freedom | 1 | `.introsplash` is `z-index:500` with no `pointer-events:none`, above `nav`'s `z-index:200` — the whole site is unclickable for 5.0s with no dismiss; the BI flow animation loops forever with no pause/replay; Tab is dead inside the lightbox |
| 4 | Consistency and Standards | 3 | Design-system discipline is otherwise high; `.ctaband h2{max-width:none}` breaks the documented "never full-width headline" rule; fixed tinted photo background contradicts DESIGN.md's Onyx-base rule |
| 5 | Error Prevention | 2 | `.facet` card lifts/highlights as one unit on hover, but the image region opens a lightbox while only the body region navigates — a predictable wrong click |
| 6 | Recognition Rather Than Recall | 2 | The three product tiers (Guarantee/Core/Flex) and the entire "Our Approach" argument exist only inside `.webp` images and their `alt` text — unsearchable, unselectable, invisible to screen readers |
| 7 | Flexibility and Efficiency of Use | 1 | `sessionStorage` gates the splash per-session (new tab = pay the toll again); no skip link; no anchor nav despite 5 sections carrying unused IDs |
| 8 | Aesthetic and Minimalist Design | 3 | Restrained and well-spaced; `.statband` pads two real facts with two non-facts ("3 Insurance Facets", "1 Point of Accountability") set in the page's loudest type |
| 9 | Error Recovery | n/a | No forms/failure states on this surface (lives on contact.html) |
| 10 | Help and Documentation | 2 | `bi-methodology.html` and `faq.html` exist but are buried in a dropdown and never linked from the body copy that makes the claims they'd answer |
| **Total** | | **19/36** | **Poor (address weak dimensions)** — 53%, below the 70% "Good" line |

## Design Specificity Verdict

**LLM assessment (Assessment A):** The core of the page could not be lifted to another product — the `#flowbox` BI cascade (Pit/Shaft → Mill → Plant → Rail/Port, with `RUNNING`/`FAILED`/`STOPPED` mono status states and a red glow ring reserved exclusively for this failure signal) makes the business-interruption argument as a mechanism, not a stock illustration, and the three-facet grid correctly resolves PRODUCT.md's hardest positioning problem (mine/machinery/transit as one broker, never separable products). But the page is bookended by transplantable generics: the intro splash, the four-stat band, and both "Our Approach"/"Our Products" sections are just a `.webp` in a bordered box — swappable onto any B2B site with the images changed. Verdict: specific at its heart, generic at both ends, and mis-weighted at the entrance — the highest-attention five seconds on the whole site are spent on the parent company's name, not the methodology PRODUCT.md names as the lead claim.

**Deterministic scan (Assessment B):** `detect.mjs` ran in DEGRADED mode (missing htmlparser2/css-select/css-tree/domutils — regex fallback only, not a clean bill of health). One finding: `em-dash-overuse` (12 instances, advisory/slop category), treated as a likely false positive — the em-dashes follow one consistent rhetorical pattern (numbered facet asides) rather than incidental AI cadence.

**Browser evidence:** No browser automation tool was available to either subagent this session, so responsive/overflow/contrast findings below are source-level analysis and computed estimates, not confirmed live-rendering defects.

## Overall Impression

The site's best idea — showing business interruption as a live, mechanized cascade with a genuine fear→relief arc — is buried between two pieces of friction that actively work against it: a five-second unskippable gate at the door, and zero path to action right after the moment the animation earns the visitor's attention. The design system itself is followed with real discipline — this isn't a page that doesn't know its own rules, it's one that breaks a few of them at exactly the highest-stakes moments (the entrance, the regulatory footer, the conversion point after the animation).

## What's Working

1. The `#flowbox` BI cascade is a product argument rendered as a mechanism, not a metaphor — it mirrors the actual sales conversation and correctly earns the system's one reserved chromatic glow rather than borrowing it decoratively.
2. Design-system discipline is unusually high for a marketing page — every eyebrow carries its 34px copper rule at 0.38em tracking, every numeral renders in IBM Plex Mono, radii hold the documented 2/4/6px ladder exactly.
3. The three-facet grid solves the hardest positioning problem correctly — mine/machinery/transit read as one broker's three risk categories, not three separable products.

## Priority Issues

**[P0] The intro splash locks the entire site for 5 seconds with no escape**
- Why it matters: `.introsplash` is `z-index:500`, above `nav` (`z-index:200`), with no `pointer-events:none` — the page beneath is fully rendered but unreachable until t≈5.0s, with no skip, no click-dismiss, no keyboard escape. `sessionStorage` gating means every new tab pays it again.
- Fix: Either delete the overlay or cut it to ≤1.2s and make it dismissible (click/Escape/scroll/any key) with `pointer-events:none` from the moment the fade starts. Persist the seen-flag in `localStorage`, not `sessionStorage`.
- Suggested command: /impeccable quieter

**[P0] Regulatory disclosure — cross-check against the explicit rebrand instruction earlier this session**
- Flagging with a caveat: Assessment A compared the page against PRODUCT.md, which records "MineTrans is a Juristic Representative of Donaldson Group (Pty) Ltd" as the confirmed regulatory fact, and flagged "MineTrans is a division of Donaldson Advisory Group" (used in `.fsp`, the splash, and the JSON-LD parentOrganization) as an inconsistency, plus the missing FSP number in the footer and an unqualified "100% FAIS & POPIA Compliant" stat. "Division of Donaldson Advisory Group" was the user's own explicit instruction earlier this session — so this may be PRODUCT.md being stale against a real business decision, not a page defect.
- Fix: Confirm which is current — if "division of Donaldson Advisory Group" is correct, update PRODUCT.md to match; if the Juristic Representative wording is correct, the page needs correcting site-wide (appears 22× vs. 1×). Either way, add the FSP number to the footer, and reconsider the unqualified "100% compliant" stat.
- Suggested command: /impeccable clarify

**[P1] ~5 MB of eagerly-loaded imagery, including 1.3–1.5 MB PNGs shown as ~370px thumbnails**
- Why it matters: The three facet diagram PNGs have no loading="lazy", no width/height (causing layout shift), and no WebP variant, despite the site already having a working WebP pipeline for the two infographics (84 KB each). Total eager payload ≈5 MB.
- Fix: Convert the three PNGs to WebP, add loading="lazy" + explicit dimensions + srcset, and compress or drop the fixed body background photo.
- Suggested command: /impeccable optimize

**[P1] "Our Approach" and "Our Products" exist only as raster images**
- Why it matters: The three named product tiers (MineTrans Guarantee/Core/Flex) appear nowhere in the DOM as text — only inside a .webp's alt attribute. Invisible to screen readers, unsearchable, illegible on mobile (a 1376px-wide diagram renders at ~27% of authored size on a 375px screen). Neither section has a CTA or exit.
- Fix: Rebuild both sections as HTML, reusing the existing .facetgrid component for the three tiers; keep the diagram as a supporting image beneath the text.
- Suggested command: /impeccable clarify

**[P2] Card affordance is ambiguous, and the BI animation can't be paused or replayed**
- Why it matters: `.facet:hover` visually unifies the whole card, but the image region opens a lightbox while only the body region navigates. The flow animation loops forever with no pause/replay, and the mill's flash pattern (~3.6Hz for 1.7s, repeating) has no pause control despite WCAG 2.2.2 requiring one for motion running longer than 5s.
- Fix: Move the enlarge affordance to an explicit corner control, and add a pause/replay control to the flow legend.
- Suggested command: /impeccable animate

## Persona Red Flags

**Jordan (First-Timer):** Held on a black screen for 5.0s with no progress indicator. Reads `.statband`'s "1 — Point of Accountability" and "3 — Insurance Facets" as the loudest content on the page and finds they're restatements of the H2 below. Sees "Blueprint" in the primary nav with no gloss. Reaches the product tiers and finds no price, no comparison, no CTA.

**Riley (Stress Tester):** Clicks the diagram on a facet card expecting navigation; gets a lightbox of the same image instead. Arrives mid-animation-cycle and sees a red "FAILED" alarm with zero context and no rewind/pause. Tab key is dead inside the lightbox.

**Casey (Mobile):** Downloads ~5 MB before the page is usable, spending the first 5 seconds staring at the splash. Opens the burger menu and can't close it (no Escape, no outside-tap dismiss, no icon change). Below 640px, the flow diagram's connecting line/pulse/shock wave are all hidden — the page's best asset degrades to four static boxes.

## Minor Observations

- `.ctaband h2{max-width:none}` switches off DESIGN.md's own "headlines wrap narrow" rule.
- `.hero::before`'s copper radial wash is the exact silhouette of the pattern DESIGN.md names as its rejected AI-slop tell.
- `body`'s fixed tinted photo background contradicts DESIGN.md's "Onyx is the base of every page."
- `.block`/`.blockgrid` — the legacy side-tab pattern DESIGN.md tells new work not to extend — is fully defined in this file's CSS but never used.
- The FSP registration number (53166) animates up from zero like a growth metric.
- `#insurance`, `#approach`, `#products` all carry IDs with scroll-behavior:smooth set, but nothing on the page links to any of them.
- `favicon-192.png`/`favicon-512.png` exist in client/public/ but aren't referenced anywhere in index.html.

## Questions to Consider

1. If the BI cascade is the single most persuasive thing on the page, why does it have no call to action, while "Blueprint" gets top-nav placement and the methodology page it should link to is two clicks deep in a dropdown?
2. What would the page look like with the splash, stat band, and both infographic images deleted?
3. A visitor has just watched the mill fail and read "Fixed costs continue. Payroll continues." What are they supposed to do in the next ten seconds?
