---
name: MineTrans Insurance Brokers
description: A dark, copper-accented editorial system for a specialist mining & marine insurance broker, built around precision-measured risk.
colors:
  onyx: "#0A0A0B"
  charcoal: "#1E1D20"
  graphite: "#3A383D"
  platinum: "#C9CACE"
  bone: "#F7F5F1"
  copper: "#AD6A3D"
  copper-bright: "#C9854F"
  danger: "#E04B4B"
  danger-content: "#C94F4F"
  danger-deep: "#7D3B3B"
  shadow-black: "#000000"
typography:
  display:
    fontFamily: "'Playfair Display', serif"
    fontSize: "clamp(2.125rem, 5.4vw, 4rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  label:
    fontFamily: "'Jost', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.08em"
  body:
    fontFamily: "'Inter', sans-serif"
    fontSize: "16px"
    fontWeight: 300
    lineHeight: 1.65
    letterSpacing: "normal"
  mono:
    fontFamily: "'IBM Plex Mono', monospace"
    fontSize: "14px"
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: "0.02em"
  # The four roles above are representative anchors for prose. `scale` is the
  # full enumerated ramp actually in use across 10+ pages built incrementally
  # over time — real, organic steps, not a fabricated 4/8pt system. See the
  # Typography section's "organic scale" note for how to use it.
  scale:
    3xs: "7px"
    2xs: "10px"
    2xs-half: "10.5px"
    xs: "11px"
    xs-half: "11.5px"
    sm: "12px"
    sm-half: "12.5px"
    base: "13px"
    base-half: "13.5px"
    base-plus: "14px"
    base-plus-half: "14.5px"
    md: "15px"
    md-half: "15.5px"
    lg: "16px"
    lg-plus: "17px"
    xl: "18px"
    xl-plus: "19px"
    2xl: "20px"
    2xl-plus: "21px"
    3xl: "22px"
    3xl-plus: "23px"
    3xl-plus2: "24px"
    4xl: "25px"
    4xl-plus: "26px"
    4xl-plus2: "27px"
    4xl-plus3: "28px"
    5xl: "29px"
    5xl-plus: "30px"
    6xl: "32px"
    7xl: "34px"
    7xl-plus: "38px"
    8xl: "40px"
    9xl: "44px"
    9xl-plus: "46px"
    9xl-plus2: "50px"
    10xl: "48px"
    11xl: "56px"
    12xl: "64px"
    13xl: "86px"
rounded:
  sharp: "2px"
  card: "4px"
  panel: "6px"
  loose: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "44px"
components:
  button-primary:
    backgroundColor: "{colors.copper-bright}"
    textColor: "{colors.onyx}"
    typography: "{typography.label}"
    rounded: "{rounded.sharp}"
    padding: "15px 34px"
  button-primary-hover:
    backgroundColor: "{colors.bone}"
  card-facet:
    backgroundColor: "{colors.charcoal}"
    rounded: "{rounded.card}"
    padding: "34px 28px"
---

# Design System: MineTrans Insurance Brokers

## Overview

**Creative North Star: "The Assay Office"**

MineTrans reads like the private office where a mine's risk gets weighed, certified, and sealed — not a marketing site dressed up to look serious. The palette is near-black onyx and charcoal, the type pairs an old-world serif (Playfair Display) for authority with a tightly-tracked uppercase sans (Jost) for procedure, and every number that matters — statistics, line references, table values, node status — drops into monospace (IBM Plex Mono) so it visibly reads as *measured*, not narrated. Copper is the one accent, used sparingly: a thin structural line, a single button, a label. The overall register is **quietly luxurious** — restrained and expensive-feeling rather than flashy — and it explicitly rejects the neon-glow, dense-dashboard energy of flashy fintech/crypto products. Nothing here should feel like it's trying to impress; it should feel like it's already trusted.

The system is presently flat by construction (see Elevation & Depth for the confirmed direction to open this up going forward), and its one recurring piece of drama — a colored glow ring — is reserved exclusively for signaling risk state in the BI-failure animation, never used decoratively.

**Key Characteristics:**
- Near-black onyx/charcoal surfaces with a single copper accent, used sparingly
- Serif display headlines (Playfair Display) paired with heavily-tracked uppercase sans labels (Jost)
- Numbers and data render in monospace (IBM Plex Mono) to read as measured fact, not prose
- Sharp, small corner radii (2–4px) — nothing rounded enough to feel soft or consumer-app
- Flat by default; the only chromatic glow is a reserved semantic for risk-state visualization

## Colors

Deliberately restrained: one dark neutral family, one accent, used almost everywhere at low saturation.

### Primary
- **Molten Copper** (`#AD6A3D`): the accent's structural form — thin rule lines (the dash before every eyebrow label), left-border accents, table/stat figure color, thin card borders on hover. It is felt more than seen.
- **Molten Copper, Bright** (`#C9854F`): the accent's spoken form — eyebrow label text, primary CTA buttons, active/emphasis states. Where Molten Copper is structure, this is voice.

### Tertiary
- **Failure Red** (`#E04B4B` on the homepage and insurance-facet pages; `#C94F4F` with a `#7D3B3B` darker gradient stop on the risk/insights/news/faq/contact page family): reserved exclusively for danger/error/failure signaling — the BI-failure animation's active-failure glow and node state, and form validation error text. It is the system's only non-copper, non-neutral hue, and it appears nowhere else (no decorative use, no "warning" tint on unrelated components). The exact hex drifts slightly by page family (same pattern as the two hero-size families in Typography) — treat both as the same semantic token, not two different reds. Opacity variants (10–75%) build the failure glow's layered rings; the solid value is reserved for text/icon states.

### Neutral
- **Onyx** (`#0A0A0B`): the base background of every page — near-black, not pure black.
- **Charcoal** (`#1E1D20`): raised surface color — cards, the nav dropdown, the mono/formula panels, alternating table rows.
- **Graphite** (`#3A383D`): secondary surface / alternate table row, a step lighter than Charcoal — used sparingly where a second layer of depth is needed without reaching for a shadow.
- **Platinum** (`#C9CACE`): secondary/body text and hairline borders (`rgba(201,202,206,.14)` as the standing 1px divider color across the entire site).
- **Bone** (`#F7F5F1`): primary text and headline color; also the hover-state text color for nav links and CTA buttons (copper background flips to bone text on hover).

### Named Rules
**The One-Accent Rule.** Copper is the only *expressive* hue in the system — used for identity, emphasis, and interaction. Failure Red is not a second accent; it is a reserved semantic exclusively for danger/error states (see the Reserved Glow Rule in Elevation & Depth). No screen should introduce a third hue, and Failure Red should never be used for anything other than signaling failure.

**The Structure-vs-Voice Rule.** Base Copper (`#AD6A3D`) is for lines, dashes, and borders — things you register peripherally. Copper-Bright (`#C9854F`) is for anything meant to be read — labels, buttons, active emphasis. Don't swap them.

## Typography

**Display Font:** Playfair Display (serif), with a system-serif fallback
**Label Font:** Jost (sans-serif), with a system-sans fallback
**Body Font:** Inter (sans-serif), with a system-sans fallback
**Mono Font:** IBM Plex Mono (monospace), with a system-mono fallback

**Character:** An old-world serif for gravitas, a tightly-tracked geometric sans for procedure and navigation, a plain-spoken sans for reading, and monospace reserved exclusively for anything numeric. The pairing reads as "a firm that measures things," not "a firm that markets things."

### Hierarchy
- **Display / H1** (weight 500, `clamp(34px, 5.4vw, 64px)`, line-height 1.08, letter-spacing −0.01em): page heroes on the homepage and the three insurance-facet pages. Italic spans within it (`em`) switch to Copper-Bright for emphasis words. Content pages (risk, insights, news, FAQ, contact, insurance overview) run a taller variant, `clamp(38px, 6.6vw, 86px)`, line-height 1.05 — a deliberate, consistent second hero scale for that page family, not drift.
- **H2** (weight 500, `clamp(26px, 4vw, 44px)`, line-height 1.15, max-width 22ch): section headings; wraps deliberately narrow, never a full-width headline. The same content-page family uses `clamp(28px, 4.2vw, 50px)`, max-width 20ch.
- **H3** (weight 500, 20px): card and sub-section titles.
- **Body / Lede** (weight 300, `clamp(15px, 1.5vw, 18px)`, line-height 1.65, Platinum on Onyx): section intros; body copy proper runs closer to 14–16px, same weight 300.
- **Label / Eyebrow** (weight 400, 12px, letter-spacing 0.08–0.38em, uppercase, Copper-Bright): the widest tracking (0.38em) is reserved for the eyebrow kicker above every section H2, always preceded by a 34×1px Copper rule.
- **Mono / Data** (weight 300, 12–24px depending on context, Copper or Bone): every statistic, table value, line-reference number, and diagram status label — never used for prose.

**Organic scale, not a fabricated system.** This site was built incrementally across many pages rather than from a strict 4/8pt scale, so the real font-size range in use spans roughly 10–64px in fine, half-pixel steps (10.5px, 12.5px, 13.5px, etc. all recur legitimately). The full ramp is enumerated in the frontmatter's `typography.scale` — that's the honest documented range, not an invented tidy one. New work should snap to an existing step in that ramp rather than introducing yet another one-off in-between value (e.g. a new "13.2px").

### Named Rules
**The Instrument Rule.** Any character that represents a measured value — a stat counter, a table cell, a line number, a node's status — renders in IBM Plex Mono. Regular prose never does, even when it contains a number inline.

**The Eyebrow Rule.** Every section opens with an uppercase, wide-tracked (0.38em) Copper-Bright label, prefixed by a 34px Copper rule line. This is the system's most consistent signature — never omit the rule line, never tighten the tracking.

## Layout

Content sits in a single centered container, `max-width: 1180px`, with responsive side padding `clamp(20px, 5vw, 64px)` (`.wrap`). Vertical rhythm between sections is generous and fluid: `clamp(56px, 9vh, 110px)` top-and-bottom per `<section>`, so density eases on smaller viewports without a breakpoint table. The three-facet grid (insurance categories) and stat rows are 3–4 column CSS grids at desktop, collapsing to a single column under 900px (facets) or two columns under 800px (stats) — simple, content-driven breakpoints rather than a formal grid scale. Full-bleed photo bands and diagram panels break out of `.wrap` entirely and run edge-to-edge, the one deliberate exception to the centered-container rule.

## Elevation & Depth

**As built, the system is flat almost everywhere.** Cards, buttons, and panels use a 1px hairline border (`rgba(201,202,206,.14)`, i.e. Platinum at 14% opacity) instead of a shadow to separate a surface from the page. The one existing ambient shadow is the nav dropdown's `0 24px 48px rgba(0,0,0,.5)` — a neutral black elevation shadow, no color.

**Confirmed direction going forward: open elevation up.** Ambient shadows are now sanctioned for surfaces that need to visibly lift off the page (dropdowns, modals/lightboxes, hover-elevated cards, popovers) — extend the dropdown's neutral black shadow family rather than reinventing one per component.

**The glow stays reserved.** Separately from ambient elevation, the BI-failure animation uses a colored glow ring — Copper for a safe/recovering state, red (`#E04B4B`) for an active-failure state — as `box-shadow: 0 0 0 Npx rgba(...), 0 0 Npx Npx rgba(...)`. This is a confirmed, deliberate exception representing risk state, not decoration. **Opening up elevation does not extend to colored glows outside this one component** — a new colored/chromatic glow on an ordinary card or button is the generic "AI-slop" dark-glow pattern this system has explicitly rejected, not a use of this rule.

### Shadow Vocabulary
- **Popover** (`box-shadow: 0 24px 48px rgba(0,0,0,.5)`): dropdown menus, and the baseline for any new floating/overlay surface.
- **Risk-safe glow** (`box-shadow: 0 0 0 6px rgba(173,106,61,.15)`): reserved — BI-methodology risk visualizations only.
- **Risk-danger glow** (`box-shadow: 0 0 0 8px rgba(224,75,75,.14), 0 0 34px 6px rgba(224,75,75,.45)`): reserved — BI-methodology risk visualizations only.

### Named Rules
**The Reserved Glow Rule.** Colored glow shadows exist in exactly one place: signaling safe/danger risk state on the BI-failure diagram. Every other elevated surface uses a neutral black shadow or no shadow at all.

## Shapes

Corners are small and sharp — this is not a soft, consumer-app system. **Buttons and CTAs use 2px radius** (`.btn-nav`, `.ctabtn`), functionally square. **Cards and content panels use 4px radius** (`.facet`, `.block`, the dropdown menu). A newer, slightly looser **6px radius** has entered on image-diagram containers (the homepage "engine" panels, facet-card thumbnails) — treat 6px as the ceiling for anything photographic or illustrative; text-bearing UI stays at 2–4px. An occasional **8px radius** appears on standalone inline-styled callout boxes on a couple of insights/reference pages — a minor one-off, not a pattern to extend; prefer 4px for any new card or panel. Borders are 1px hairlines by default (Platinum at 14% opacity); a 2px Copper border marks emphasis (dropdown top edge, legacy left-border accent blocks, active facet-card hover).

## Components

Buttons, cards, and inputs should feel **quietly confident**: understated at rest, with one clear, deliberate reaction on interaction — never idle motion, never a hover state that leaves the viewer guessing whether something happened.

### Buttons
- **Shape:** 2px radius, functionally square.
- **Primary:** Copper-Bright background, Onyx text, Jost label typography (12–12.5px, 0.08em tracking, uppercase), 15px/34px padding.
- **Hover / Focus:** background flips to Bone (the only color change; no scale, no shadow).

### Cards / Containers (`.facet`)
- **Corner Style:** 4px radius.
- **Background:** Charcoal on Onyx.
- **Border:** 1px hairline at rest; flips to solid Copper on hover.
- **Hover:** lifts 4px on the Y-axis (`translateY(-4px)`) — the system's one motion signature for interactive cards.
- **Internal Padding:** 34px/28px.

### Inputs / Fields
- **Style:** Onyx background (a shade darker than the Charcoal form panel it sits in), 1px Platinum hairline border, Bone text, 13px/15px padding, no radius rounding beyond the card default.
- **Label:** Jost, 11px, 0.12em tracking, uppercase, Platinum — always above the field, never inline/floating.
- **Focus:** border shifts from hairline Platinum to the copper-tinted line color (`rgba(173,106,61,.35)`) — no glow, no outline, just a color-shifted border.
- **Feedback:** inline message text below the form, Jost 12.5px; success in Copper-Bright, error in a dedicated red (`#E04B4B`) reserved for error/failure states only.

### Navigation
- Fixed, translucent Onyx (90% opacity) with a 14px backdrop blur and a 1px bottom hairline.
- Labels are Jost, 12.5px, 0.05em tracking, uppercase, Platinum at rest, Bone on hover/active.
- Dropdown submenus: Charcoal background, 2px Copper top border, 4px radius, Popover shadow, top-edge fade/slide-in transition.

### Photo Bands (signature component)
Full-bleed, edge-to-edge photography breaking out of the `.wrap` container, `clamp(240px, 38vw, 460px)` tall, `object-fit: cover`, with a bottom gradient (`transparent → rgba(10,10,11,.92)`) carrying an uppercase, wide-tracked Platinum caption. This is the system's only full-bleed treatment — everything else respects the 1180px container.

### Engine / Diagram Panels (signature component)
Bordered, Charcoal-background containers (6px radius) that hold a single illustrative or infographic image edge-to-edge, no internal padding around the image itself. Used for the homepage "Our Approach" / "Our Products" panels and the course's step-by-step methodology diagrams. Some instances (homepage facet cards) additionally support a click-to-enlarge lightbox: a fixed, centered overlay on 90%-opacity Onyx, image capped at `92vw`/`88vh` with a 4px radius and hairline border, dismissed via a circular close button, backdrop click, or Escape.

## Do's and Don'ts

### Do:
- **Do** keep Copper to a single accent role — never introduce a second hue for a new status or category.
- **Do** render every measured number (stats, table values, line refs, status labels) in IBM Plex Mono (**The Instrument Rule**).
- **Do** open the eyebrow before major section headings with the 34px Copper rule line and 0.38em tracking (**The Eyebrow Rule**) — this is the system's most recognizable signature.
- **Do** use neutral black ambient shadows (starting from the Popover value) for any surface that needs to visibly lift — this is now sanctioned, per the confirmed direction in Elevation & Depth.
- **Do** cap corner radius at 2px for buttons/CTAs and 4px for cards and text-bearing panels; reserve 6px for photographic/illustrative image containers only.
- **Do** keep new full-bleed treatments (photo bands, engine panels) as the deliberate exception to the 1180px container, not the default.

### Don't:
- **Don't** add a colored/chromatic glow to any component outside the BI-failure risk visualization — that pattern is reserved (**The Reserved Glow Rule**); a decorative colored glow anywhere else is exactly the generic AI-slop tell this system has explicitly rejected.
- **Don't** reach for a thick colored left-border ("side-tab") treatment on cards or callouts — an older `.block` pattern still has one, but the course components were deliberately moved off it this session to a uniform 1px hairline border; new work should follow the hairline treatment, not the legacy left-border one.
- **Don't** round corners past 4px on anything text-bearing (buttons, cards, inputs, nav) — soft/pill shapes read as consumer-app, not this system.
- **Don't** style this as a bright, dense, neon fintech/crypto dashboard — the confirmed anti-reference. Restraint and negative space are load-bearing, not empty.
- **Don't** use Inter, Jost, or Playfair Display outside their assigned roles (body / label / display respectively) — don't, for example, set a headline in Jost or a label in Inter.
- **Don't** use Failure Red (`#E04B4B`) for anything but danger/error/failure signaling — it is not a decorative "warm" alternative to copper.
