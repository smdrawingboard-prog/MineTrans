---
target: Homepage (index.html)
total_score: 33
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 0
timestamp: 2026-08-20T07-22-58Z
slug: client-public-index-html
---
Method: dual-agent (A: general-purpose design review · B: general-purpose detector/browser evidence)

## Fix Verification

**Nav restructure (8→5 top-level items) — PASS.** Exactly 5 top-level entries confirmed live (Home, Insurance▾, Mining Risk, Resources▾, Blueprint) plus the CTA. Resources contains all 4 items with correct copy, mirrors Insurance's hover/focus/aria-expanded lifecycle precisely. Blueprint correctly stayed standalone (confirmed independently gating to an "Employee Access" page).

**Mobile dropdown off-screen bug — PARTIAL.** The click-triggered path (what the last fix targeted) is genuinely fixed on both dropdowns — confirmed via computed styles (`transform:none`, `rect.left:20`, fully on-screen) on a live 390px viewport. But a **different trigger for the same bug survived**: tabbing to a dropdown button via keyboard *without* pressing Enter/clicking reveals the submenu through the unscoped `.hasdrop:focus-within .dropmenu` rule, which never gained the `.open` class the mobile fix depends on — so it still renders with `position:absolute` and `transform:matrix(1,0,0,1,-140,0)`, overlapping Mining Risk/Resources/Blueprint/the CTA underneath it.

**Failure-red contrast — unchanged, not addressed.** `#E04B4B` at 11px on effective charcoal background still measures ≈4.22:1, below the 4.5:1 AA threshold. "STOPPED"/"IDLE" lack the compensating text-shadow "FAILED" has, so they're the more under-threshold labels.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Flow diagram's live state changes have no `aria-live` region |
| 2 | Match System / Real World | 4/4 | Domain-accurate terminology throughout |
| 3 | User Control and Freedom | 3/4 | Lightbox has no focus trap; auto-looping animation has no pause control |
| 4 | Consistency and Standards | 4/4 | Resources dropdown is a faithful mirror of Insurance |
| 5 | Error Prevention | 4/4 | All 11 linked pages resolve, no dead links/assets |
| 6 | Recognition Rather Than Recall | 4/4 | Eyebrow labels, numbered facets, dropdown subtext orient continuously |
| 7 | Flexibility and Efficiency | n/a | No power-user path applicable to a persuade-mode page |
| 8 | Aesthetic and Minimalist Design | 4/4 | Restrained, on-brand, matches the "quietly luxurious" register |
| 9 | Error Recovery | 3/4 | Nothing helps a keyboard user recover from the dropdown/lightbox focus gaps |
| 10 | Help and Documentation | 4/4 | Dropdown subtext, FAQ, footer compliance text serve this role well |
| **Total** | | **33/36** | **Good (92%)** |

**Trend: 25 → 32 → 33 (out of 36 all three runs, directly comparable).** Consistency jumped to a clean 4/4 this round; the net gain is smaller than round 2 because this pass surfaced genuine new focus-management findings that round 2's narrower fix didn't cover.

## Design Specificity Verdict

Still reads as authored specifically for this vertical — domain-accurate operational vocabulary (Pit/Shaft, Primary Mill, Rail/Port), the three facets map exactly to PRODUCT.md's risk categories, and the BI-failure animation is the actual sales argument made visceral, not decorative motion. The "Assay Office" system is applied with discipline — no drift into generic dark-fintech territory.

**Deterministic scan**: CLI ran degraded (regex fallback, 4 hits). Browser overlay found the header count and 11 distinct rule types.

**False positives**, re-confirmed against DESIGN.md: `dark-glow` (reserved), `side-tab`/`.block` (DESIGN.md's own named legacy exception, and dead/unused on this page), `overused-font` (Inter, previously confirmed), `border-accent-on-rounded` ×2 (now fires twice since there are two dropdowns — same documented accent), `hero-eyebrow-chip`/`kicker-above-heading` ×5 (The Eyebrow Rule), `all-caps-body` ×3 (all on Label-role elements per DESIGN.md), `tiny-text`/`undersized-ui-text` (11px/10.5px are documented scale steps, all Label-role), `repeated-container-text` (intentional parallel node states). No 8px-radius finding on index.html itself (the one known instance is on insights.html's dynamic blog card, confirmed out of scope again).

**Genuine, minor, mechanical findings**: `line-length` (~108 chars/line) and `skipped-heading` (h2→h4 across unrelated landmarks — CTA band to footer) — both pre-existing, unchanged, not part of this round's scope.

## Overall Impression

The nav fix is genuinely solid — a faithful, consistent pattern replication, not a patch. But this round's deeper testing found that the mobile dropdown bug has more than one door: the CSS fix scoped to the click/`.open` path, and a keyboard-focus-without-click path walks right through the gap the fix left open. That's not a failure of the last fix — it correctly closed the trigger it was built for — but it means the underlying shape of the bug (an unscoped desktop rule beating a scoped mobile one) wasn't fully closed off.

## What's Working

1. **The Resources dropdown fix is a faithful pattern replication** — hover/focus lifecycle, aria-expanded, and visual treatment all mirror Insurance exactly. This is what "consistency" is supposed to look like, not a token patch.
2. **The failure/recovery animation remains the correct emotional peak** — the one sanctioned use of the Reserved Glow Rule, and it works precisely because it's rare and tied to the actual sales argument.
3. **Editorial restraint under real content pressure** — the 12-step methodology, 3 tiers, and 18-category questionnaire all live elsewhere; the homepage stays at 3 facets + 1 proof point.

## Priority Issues

**[P2] The mobile dropdown fix doesn't cover the keyboard-focus-without-click path.** Tabbing to "Insurance" or "Resources" without pressing Enter reveals the submenu via the unscoped `.hasdrop:focus-within .dropmenu` rule (line 60, not inside any media query), which still applies `position:absolute`/`transform:translateX(-50%)` at mobile widths since `.open` never gets added on pure focus. The floating panel overlaps Mining Risk/Resources/Blueprint/the CTA underneath it instead of pushing them down. Same defect family as the fix already shipped, different trigger. **Fix**: guard the base `:focus-within` reveal rule itself behind `@media(min-width:901px)`, so mobile relies solely on the `.open`-class path regardless of how focus arrives. → `/impeccable audit`

**[P2] The image lightbox has no focus management.** Opening it (any facet thumbnail or engine-panel image) leaves focus on the trigger; Tab moves into obscured background content instead of the visible close button — verified: first Tab after opening lands on "01 — The Mine" behind the overlay. No focus trap while open. **Fix**: move focus to the close button on open, trap Tab within `.lightbox`, return focus to the trigger on close. → `/impeccable audit`

**[P3] Failure-red contrast on the flow-diagram status labels, still unresolved from round 2.** `#E04B4B` at 11px measures ≈4.22:1 against effective charcoal, below 4.5:1 AA. "STOPPED"/"IDLE" lack the compensating text-shadow "FAILED" gets. **Fix**: lighten toward the `#E8706F` range, or extend the existing text-shadow treatment to all three failure states. → `/impeccable audit`

## Persona Red Flags

**Jordan (first-timer)**: Page's stated job still succeeds. Minor: nothing visually marks "Blueprint" as internal-only before the click lands on a password gate.
**Riley (stress-tester)**: Found both P2s by testing exactly what a careful stress test would try — pure-keyboard nav traversal and modal focus order.
**Casey (mobile)**: Primary CTA lives inside the hamburger, but the hero's own inline CTA is one scroll-free glance below the fold — doesn't block fast conversion.

## Minor Observations

- No `aria-live` region on the flow diagram's status changes — a screen-reader user gets no notification when it flips RUNNING→FAILED.
- Mobile hamburger doesn't lock body scroll while open, unlike the lightbox (which does) — an inconsistent pattern between two overlay-like surfaces, low impact since `.navlinks` is opaque.
- Footer's "Company" column omits "BI Methodology" (present in Resources, not mirrored in footer) — minor parity gap, not a broken link.
- `line-length` (~108 chars/line) and a footer `skipped-heading` (h2→h4 across unrelated landmarks) remain, both pre-existing and unchanged.

## Questions to Consider

1. If Blueprint is explicitly an internal employee gate, should it sit shoulder-to-shoulder with visitor-facing nav items at all — or would a smaller/secondary treatment (footer, a distinct "Staff" affordance) be more honest, and incidentally drop the top-level count to 4?
2. Two rounds have each closed the *obvious* trigger for the mobile dropdown bug while a third trigger survived both — worth a broader audit for other `:focus-within`-driven rules with the same "unscoped desktop rule vs. scoped mobile override" shape, rather than patching triggers one at a time?
