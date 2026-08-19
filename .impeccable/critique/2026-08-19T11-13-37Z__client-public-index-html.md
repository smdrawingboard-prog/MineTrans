---
target: Homepage (index.html)
total_score: 25
max_score: 36
na_heuristics: 10
p0_count: 2
p1_count: 2
timestamp: 2026-08-19T11-13-37Z
slug: client-public-index-html
---
Method: dual-agent (A: general-purpose design review · B: general-purpose detector/browser evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Hover/dropdown states are clear, but no-JS / failed-image states give zero status signal |
| 2 | Match System / Real World | 4/4 | Genuine mining/marine vocabulary and equipment-accurate diagram nodes throughout |
| 3 | User Control and Freedom | 3/4 | Lightbox has close/Escape/backdrop-click; mobile dropdown isn't fully keyboard-escapable |
| 4 | Consistency and Standards | 2/4 | Homepage skips the Instrument Rule entirely (see P0 below) — 6 sibling pages implement it correctly |
| 5 | Error Prevention | 1/4 | With JS blocked, FSP Number renders "0" and compliance renders "0%" |
| 6 | Recognition Rather Than Recall | 4/4 | Nav dropdown descriptions + numbered 01/02/03 facet cards scaffold the mental model well |
| 7 | Flexibility and Efficiency | 2/4 | No way to jump to a specific facet/tier or compare cover types from the homepage |
| 8 | Aesthetic and Minimalist Design | 3/4 | Restrained palette mostly delivers the brief; two headerless orphan sections break the rhythm |
| 9 | Error Recovery | 3/4 | No active error states fail visibly, but a failed infographic load leaves a blank void, no fallback |
| 10 | Help and Documentation | n/a | Persuade-mode homepage has no task to document |
| **Total** | | **25/36** | **Acceptable, bordering Good (69%)** |

## Design Specificity Verdict

**LLM assessment**: This is not a generic template with mining copy pasted in. The vocabulary ("Yellow Metal & Machinery," "haul trucks, drill rigs," "Pit/Shaft," "Primary Mill," "Rail/Port"), the FSP 53166 disclosure woven into the hero, and especially the bespoke animated cascading-failure diagram all read as authored for this exact vertical. But the page shell (manifesto hero → stat band → 3-card grid → CTA band → footer) is a familiar modern-agency skeleton, and the two most brand-load-bearing sections on the page — "Our Approach" and "Our Products" — are bare, unstyled `<img>` drops with none of the surrounding system applied. That's where "could be anyone's site" creeps back in.

**Deterministic scan**: `detect.mjs` ran in degraded mode (HTML parser modules unavailable, fell back to regex — an acknowledged undercount) and returned 4 findings. The browser-injected overlay (real DOM/CSSOM) found substantially more: 14 distinct anti-pattern instances across `undersized-ui-text` (×4), `tiny-text` (×2), `all-caps-body` (×2), `line-length`, `skipped-heading`, `repeated-container-text`, `em-dash-overuse`, `overused-font`, `border-accent-on-rounded`, `kicker-above-heading` (×3), and `hero-eyebrow-chip`.

**False positives** (cross-checked against `DESIGN.md`, which didn't exist for either sub-agent's detector before this session but which I hold full context on):
- `dark-glow` (line 165) — the copper/red glow ring on the BI-failure diagram (`.flow.fail .node.mill`). **Reserved and documented intentional** per DESIGN.md's "The Reserved Glow Rule." Confirmed reachable/rendered in Assessment B's screenshot.
- `kicker-above-heading` (×3) and `hero-eyebrow-chip` — this *is* "The Eyebrow Rule," DESIGN.md's explicitly named signature pattern ("never omit... this is the system's most recognizable signature"). Not a defect; it's the brand.
- `repeated-container-text` ("RUNNING" ×3) — three parallel nodes in the flow diagram legitimately share a status label simultaneously by design; not duplicate-content error.
- `overused-font` (Inter) — already reviewed and confirmed intentional earlier this session; Inter is the site's established, consistent body typeface.
- `all-caps-body` (×2, 45/49 chars) — almost certainly the hero eyebrow text itself ("Mining & Marine Insurance Brokers · FSP 53166" is ~47 chars), which the Label typographic role requires to be uppercase. Not a defect, but flagged below as a length watch-item since it's long for a label.
- `border-accent-on-rounded` — the nav dropdown's 2px copper top-border is a documented, deliberate accent (DESIGN.md's Nav Dropdown component). One real doc/code mismatch surfaced during this check: DESIGN.md states the dropdown uses "4px radius," the actual CSS uses 2px — a documentation correction, not a design defect (noted in Minor Observations).
- `side-tab` (line 122, `.block`) — the pattern itself is real and DESIGN.md explicitly tells new work to avoid it, but on `index.html` specifically the `.block`/`.blockgrid` CSS is **dead code** (no element in this page's markup uses it). Both sub-agents independently flagged this as legacy debt/a copy-paste trap for the next person who reuses this file as a template.

**Genuine, actionable findings**: `undersized-ui-text`/`tiny-text` (the flow-diagram status labels and photo caption run 10–11px), `line-length` (~108 chars/line on wide viewports), `skipped-heading` (h2→h4 skip, "Insurance Solutions" in the footer), and `em-dash-overuse` (11 em-dashes, advisory-only stylistic tell) — all real, folded into the issues below.

**Visual overlays**: Assessment B's injected overlay ran successfully in a background tab (now closed) and its console findings are summarized above; no persistent in-browser overlay remains open for you to view live, but a full-page screenshot backing the findings was captured during the run.

## Overall Impression

The site's strongest material — the cascading-failure diagram, the numbered facet cards — is genuinely excellent and specific to this product. But the homepage is the one page in the whole site that doesn't fully wear its own design system: it skips the Instrument Rule outright, and its two newest, most strategically important sections (Approach/Products) were dropped in as bare images with none of the surrounding system's structure, accessibility, or mobile affordances. The single biggest opportunity is closing that gap — not redesigning anything, just finishing what's already 90% there.

## What's Working

1. **The BI cascading-failure diagram** — a bespoke, domain-accurate component that makes the abstract case for Business Interruption cover concrete and emotionally legible before immediately resolving the tension with reassurance ("Cash Flow Protected"). Exactly the right emotional beat for a regulated, high-stakes purchase decision.
2. **Facet cards** — numbered 01/02/03, zoomable diagrams, hover-lift and border-flip that match DESIGN.md's card spec precisely (4px radius, hairline→copper border, `translateY(-4px)`). High-fidelity execution where it counts most.
3. **Regulatory disclosure placement** — FSP 53166 appears in the hero, stat band, and footer, matching the product principle that it's load-bearing, not fine print.

## Priority Issues

**[P0] With JavaScript disabled or blocked, the stat band shows false regulatory data.**
- **Why it matters**: `.cnt[data-target]` elements ship with literal text content "0," only replaced by a count-up script. Confirmed via no-JS render: "FSP Number" shows "0," "FAIS & POPIA Compliant" shows "0%." On a regulated financial-services page, showing a false/blank FSP number and compliance status to any visitor without JS (ad-blockers, corporate CSP, reduced-capability browsers) is a compliance-adjacent content-integrity failure, not just a lost animation.
- **Fix**: Set the real value as the DOM's default text content; treat the count-up as progressive enhancement that animates *from* the real number, never from 0.
- **Suggested command**: `/impeccable harden`

**[P0] The homepage doesn't implement its own Instrument Rule.**
- **Why it matters**: DESIGN.md requires every stat, table value, line reference, and status label to render in IBM Plex Mono. `index.html` never loads the font or defines `--mf`, so `.stat .cnt` (53166/3/1/100%), `.facet .fnum` (01/02/03), and `.flow .node .st` (RUNNING/FAILED/STOPPED/IDLE) all render in the wrong typeface. Six sibling pages implement this correctly. The detector independently confirms the flow-diagram status labels are also undersized (10px, below the 11px floor) — a second, compounding issue on the same elements. This is the highest-traffic page being the one place the system's most checkable rule is entirely absent.
- **Fix**: Add IBM Plex Mono to the font `<link>`, define `--mf`, apply it (and bump size to ≥11px) on `.stat .cnt`, `.facet .fnum`, and `.flow .node .st`.
- **Suggested command**: `/impeccable polish`

**[P1] "Our Approach" and "Our Products" sections have no heading, no eyebrow, and no zoom — and go illegible on mobile.**
- **Why it matters**: Both sections are a bare `<img>` with no eyebrow rule-line, no `<h2>`, nothing in the heading outline between the two sections around them — violating the Eyebrow Rule ("never omit... the system's most recognizable signature") and skipping screen-reader users entirely. Unlike the facet-card diagrams, these two images have no click-to-enlarge affordance, and at 390px mobile width the baked-in text — including the names of MineTrans's three actual product tiers (Guarantee/Core/Flex) — shrinks below legible size with no way to zoom in. Per PRODUCT.md, the methodology *is* the core differentiator; right now its clearest visual expression is unreadable on the device most visitors use, and the tier names exist nowhere as real, indexable text.
- **Fix**: Add the standard eyebrow+H2 pattern to both sections; extend the existing `.fimgbtn`/lightbox pattern already built for the facet cards to these two images; use the documented 6px "Engine Panel" bordered container instead of a bare `<img>`.
- **Suggested command**: `/impeccable adapt`

**[P1] `aria-expanded` on the Insurance nav dropdown never updates.**
- **Why it matters**: `<button class="dropbtn" aria-expanded="false">` is hardcoded; the open/close handler toggles a CSS class but never touches the attribute. Screen-reader and switch-control users are told the menu is always collapsed even while it's open — on the site's primary navigation.
- **Fix**: Toggle `aria-expanded` alongside the `.open` class in the existing JS handler.
- **Suggested command**: `/impeccable audit`

**[P2] No CTA in the hero itself.**
- **Why it matters**: The hero ends after the lede with no button; the only "Request a Review" access is the persistent nav bar. On a Persuade-mode landing page, leaving the first-fold conversion path implicit delays the ask.
- **Fix**: Add a text link or secondary CTA under the lede pointing at the CTA band or contact page.
- **Suggested command**: `/impeccable layout`

## Persona Red Flags

**Jordan (confused first-timer)**: Reaches "Our Approach"/"Our Products" with no heading explaining what he's looking at — easy to skim past as decorative filler. The three product tiers exist nowhere as text or links, only inside a raster image, so there's no click-through if he wants to know which tier fits him. Must notice the persistent nav CTA or scroll past 5+ sections to find the ask — no obvious next step directly under the hero promise.

**Riley (stress-tester)**: JS-disabled load shows FSP Number and compliance as "0"/"0%" — the worst possible thing a stress test can surface on a regulated broker's page. With JS disabled, the entire cascading-failure narrative also collapses to a static all-"RUNNING" diagram with an empty impact panel — the section's whole point silently disappears. Keyboard-only: opens the Insurance dropdown via focus, but `aria-expanded` never flips to `true`, so assistive tech can't trust the state.

**Casey (distracted mobile user)**: The mobile hamburger opens to 8 stacked full-width nav rows before "Request a Review" appears at the bottom — a lot of thumb travel to the primary action. The Approach/Products infographics have no loading placeholder and were observed to sometimes fail to paint under flaky conditions, leaving a large blank void mid-scroll. On a 390px viewport their baked-in text is illegible and, unlike the facet cards, un-zoomable — Casey can't read the product tiers on her phone at all.

## Minor Observations

- Animating the FSP number as a count-up (0→53166) applies a "vanity metric" treatment to a static regulatory fact, tonally at odds with DESIGN.md's "nothing here should feel like it's trying to impress" brief.
- The homepage's `.infographic` images use 4px radius directly on the `<img>`, not the documented 6px bordered/charcoal "Engine Panel" container DESIGN.md specifically calls out for these two placements.
- `.block`/`.blockgrid` CSS (the deprecated left-border pattern DESIGN.md tells new work to avoid) ships in this page's stylesheet unused — dead weight and a trap for the next person who copies this file as a template. Both assessments independently caught this.
- `.breadcrumb` CSS is defined but unused on the homepage — leftover from the shared facet-page template.
- Lightbox open/close has no focus management — focus doesn't move to the close button on open or return to the trigger on close.
- Heading outline skips a level in the footer (h2 → h4 "Insurance Solutions," no h3) — a semantic gap for screen-reader navigation.
- Body copy runs ~108 characters/line on wide viewports, past the ~80ch comfort line; 11 em-dashes across the page's body copy is a minor stylistic AI-cadence tell worth varying in a future copy pass.
- DESIGN.md states the nav dropdown radius is "4px"; the actual CSS uses 2px — a one-line doc correction, not a design defect.
- Hero eyebrow text wraps to two lines on mobile with the copper rule-line only beside the first line — a minor snag on the system's signature element.

## Questions to Consider

1. If a visitor with JavaScript blocked sees your FSP number as "0," is that a UX bug or a FAIS-adjacent disclosure problem — and who signs off on that distinction?
2. The Instrument Rule is implemented correctly on six other pages but entirely absent from the homepage — was that a deliberate scoping decision, or did the homepage simply never get updated when the rule was established elsewhere?
3. The three product tiers (Guarantee/Core/Flex) are arguably a core differentiator per PRODUCT.md's methodology-first positioning — should they be real, linkable, indexable page content instead of text baked into a raster image?
