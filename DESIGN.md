---
name: MineTrans
description: Mining & marine insurance brokers for Sub-Saharan Africa — the marketing site and advisor certification platform.
colors:
  onyx: "#0A0A0B"
  charcoal: "#1E1D20"
  graphite: "#3A383D"
  survey-grey: "#C9CACE"
  assay-copper: "#AD6A3D"
  assay-copper-bright: "#C9854F"
  ledger-white: "#F7F5F1"
  hairline: "rgba(201,202,206,0.14)"
  hairline-copper: "rgba(173,106,61,0.4)"
  error-red: "rgba(224,75,75,1)"
typography:
  display:
    fontFamily: "'Playfair Display', serif"
    fontSize: "clamp(34px, 5.4vw, 64px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Playfair Display', serif"
    fontSize: "clamp(26px, 4vw, 44px)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  label:
    fontFamily: "'Jost', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.05em"
    textTransform: "uppercase"
  eyebrow:
    fontFamily: "'Jost', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.38em"
    textTransform: "uppercase"
  body:
    fontFamily: "'Inter', sans-serif"
    fontSize: "clamp(15px, 1.5vw, 18px)"
    fontWeight: 300
    lineHeight: 1.65
rounded:
  sm: "2px"
  md: "4px"
spacing:
  section: "clamp(56px, 9vh, 110px)"
  gutter: "clamp(20px, 5vw, 64px)"
  card-padding: "34px 28px"
  block-padding: "26px 24px"
components:
  button-primary:
    backgroundColor: "{colors.assay-copper-bright}"
    textColor: "{colors.onyx}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "15px 34px"
  button-primary-hover:
    backgroundColor: "{colors.ledger-white}"
    textColor: "{colors.onyx}"
  card-facet:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.survey-grey}"
    rounded: "{rounded.md}"
    padding: "{spacing.card-padding}"
  card-facet-hover:
    backgroundColor: "{colors.charcoal}"
---

# Design System: MineTrans

## Overview

**Creative North Star: "The Assay Report"**

MineTrans's marketing and training surfaces read like a certified assay report on a
valuable metal: dark, precise, evidentiary. The onyx-black canvas and thin hairline
rules are the paper of a technical document; Playfair Display headlines are the
authoritative typeset title; Jost's uppercase, wide-tracked small-caps labels are the
stamped, measured annotations along the margin; Inter body copy is the plain
explanatory prose underneath. Assay Copper is the one warm material in the system — it
appears sparingly, the way a seal or a highlighted figure would on a real report, never
as decoration.

This is a Persuade surface (the marketing site) built with the discipline of an Operate
surface: nothing performs looseness or informality. The system currently exists fully
realized only in `client/public/*.html` (the static marketing pages). The certification
portal (`client/src/pages/CertificationLanding.tsx` and siblings) and the shadcn/ui
component library (`client/src/index.css`) run an unrelated generic blue-on-white /
slate-amber theme — this is confirmed drift, not a second intentional world (see
PRODUCT.md, Brand Commitments). Do not treat the portal's current look as a design
reference; it is the thing that needs to converge onto this system.

**Key Characteristics:**
- Onyx-black canvas with a single warm accent (copper), never a busy palette.
- Editorial serif display type over engraved small-caps labels; body text stays quiet.
- Flat, hairline-bordered surfaces as the base language — with one confirmed exception:
  primary buttons and cards now carry real shadow/lift (see Elevation & Depth), not
  just a border.
- Near-square geometry (2-4px radii) throughout; nothing rounded or soft.
- Numbers and named steps (12-step methodology, 18-category questionnaire) are treated
  as first-class content, not buried in prose.

## Colors

The palette is almost monochrome — onyx, charcoal, and two light neutrals — with copper
as the system's only accent, deployed rarely and always with intent.

### Primary
- **Assay Copper** (`#AD6A3D`) / **Assay Copper Bright** (`#C9854F`): the system's one
  accent. Used for eyebrows, CTA fills, hover states, active nav indicators, and the
  left-edge stripe on content blocks. Never used as a large background fill outside a
  button or the confirmed hover-glow shadow.

### Neutral
- **Onyx** (`#0A0A0B`): primary page background and footer background.
- **Deep Charcoal** (`#1E1D20`): card and content-block surface color — the "raised"
  layer above onyx.
- **Graphite** (`#3A383D`): reserved third-tier surface tone; used sparingly beyond
  charcoal.
- **Ledger White** (`#F7F5F1`): primary text — headlines, body emphasis, button text on
  hover, footer/nav text on hover.
- **Survey Grey** (`#C9CACE`): secondary text — lede paragraphs, nav links, card body
  copy, footer links at rest.
- **Hairline** (`rgba(201,202,206,0.14)`): the system's only border color at rest —
  every card, nav, and footer division uses this exact value.

### Named Rules
**The One Accent Rule.** Copper is the only saturated color in the system. If a second
accent hue is needed for a state, it must be semantic (see error red below), never
decorative.

**The Semantic Red Exception.** Validation/error states use a separate red
(`rgba(224,75,75,…)`) glow — this is a state color, not a palette option; it never
appears outside form validation.

## Typography

**Display Font:** Playfair Display (serif)
**Body Font:** Inter (sans-serif)
**Label/Mono Font:** Jost (sans-serif, used for all-caps labels and eyebrows)

**Character:** An editorial serif carrying authority and weight, paired with a
technical, wide-tracked small-caps label face — the pairing of a report's headline and
its stamped annotations. Body text stays light-weight (300) and quiet so the serif
headlines and copper accents keep all the visual weight.

### Hierarchy
- **Display** (500, `clamp(34px, 5.4vw, 64px)`, 1.08): page-level h1s. Italic spans in
  copper-bright mark the emphasized word in a headline.
- **Headline** (500, `clamp(26px, 4vw, 44px)`, 1.15): section h2s, max-width 22ch.
- **Body / Lede** (300, `clamp(15px, 1.5vw, 18px)`, 1.65): intro paragraphs, max-width
  66ch; `strong` spans switch to Ledger White at weight 500.
- **Label** (400-500, 11-12.5px, uppercase, 0.05-0.08em tracking): nav links, buttons,
  footer headings, breadcrumbs.
- **Eyebrow** (400, 12px, uppercase, 0.38em tracking, Assay Copper Bright, preceded by
  a 34px hairline): the system's signature small-caps kicker above headlines.

### Named Rules
**The Stamped Label Rule.** Anything that reads as metadata or navigation (nav links,
buttons, footer headings, breadcrumbs, eyebrows) is Jost, uppercase, letter-spaced. Any
Playfair Display text is a title, never a label.

## Layout

Content sits in a `max-width: 1180px` centered wrap with responsive gutters
(`clamp(20px, 5vw, 64px)`). Vertical rhythm between sections is generous and fluid
(`clamp(56px, 9vh, 110px)` per section). Grids collapse in two steps: 3-column facet
grids and 2-column block/footer grids both go to 1 column by 900px/800px; the 4-column
process-flow diagram goes to 2 columns at 640px. Mobile nav collapses to a full-screen
overlay panel below 800px-900px (breakpoints vary slightly per page).

Note: the shadcn/React app shell (`client/src/index.css` `.container`) uses a
1280px/2rem-padding container model, not this 1180px wrap — an existing inconsistency
between the two halves of the codebase, not a deliberate second layout system.

## Elevation & Depth

**Confirmed direction (this session): the system is moving from flat-with-hairline to
real elevation on its two most important surfaces — primary buttons and cards.**
Everything else (nav, footer, sections, content blocks) stays flat with hairline
borders as before; this is a scoped upgrade, not a system-wide shift to shadows.

- **At rest**, primary buttons and cards (facet cards, course cards) now carry a
  subtle ambient onyx shadow beneath them, so they read as physically raised off the
  onyx canvas rather than merely bordered.
- **On hover/focus**, they lift further and pick up the confirmed copper-tinted glow —
  this extends a pattern that already existed in one place (`courses.html`'s
  `.course-card:hover`) to primary buttons and all cards.
- Everything else in the system remains flat: nav bars, footer, content blocks
  (`.block`), the process-flow diagram, and secondary/ghost buttons keep the hairline
  border as their only depth cue. Don't add shadow to these without a new decision.

### Shadow Vocabulary
- **card-rest** (`box-shadow: 0 2px 12px rgba(10,10,11,0.45)`): default elevation for
  cards and primary buttons at rest.
- **card-hover / button-hover** (`box-shadow: 0 10px 30px rgba(173,106,61,0.25)`;
  `transform: translateY(-4px)`): copper-tinted lift on hover/focus, per the confirmed
  `courses.html` precedent.
- **error-glow** (`box-shadow: 0 0 0 8px rgba(224,75,75,0.14), 0 0 34px 6px rgba(224,75,75,0.45)`):
  semantic only — invalid form field state, never decorative elevation.

### Named Rules
**The Raised-Ore Rule.** Primary buttons and cards are never perfectly flat. A hairline
border alone is no longer sufficient — they carry ambient shadow at rest and a
copper-tinted lift on interaction. Every other surface stays flat by design; don't
generalize this rule beyond buttons and cards.

## Shapes

Near-square geometry throughout: **2px** radius on buttons and blocks, **4px** on cards
and the process-flow container, **50%** on the small circular icon marks in
list/feature rows. Nothing in the system uses a soft/large radius — a rounder corner
reads off-brand. Borders are 1px hairline by default, with a 2px copper-accented left
edge on content blocks (`.block`) as the system's signature "flagged item" treatment.

## Components

### Buttons
- **Shape:** 2px radius (`{rounded.sm}`), no border.
- **Primary:** Assay Copper Bright background, Onyx text, Jost label typography,
  `15px 34px` padding, uppercase, 0.08em tracking. At rest: `card-rest` shadow. Hover:
  background shifts to Ledger White, shadow becomes `card-hover` (copper glow) with a
  slight lift.
- **Nav button variant:** smaller (`11px 22px`), same color logic, used in the header.
- **Secondary / Ghost:** unstyled text links in Survey Grey, transitioning to Ledger
  White on hover — no fill, no border, no shadow. Stays flat; the elevation upgrade is
  primary-only.

### Cards / Containers
- **Facet cards** (insurance-category grid): Charcoal background, 4px radius, hairline
  border, `34px 28px` padding. At rest: `card-rest` shadow (new). Hover: border shifts
  to full Assay Copper, `translateY(-4px)`, `card-hover` shadow.
- **Content blocks** (`.block`): Charcoal background, 2px radius, hairline border, plus
  a signature 2px Assay Copper left edge. Stay flat — this component is explicitly
  outside the elevation upgrade (it reads as a "flagged note," not an interactive
  card).
- **Internal Padding:** 34px/28px for facet cards, 26px/24px for content blocks.

### Inputs / Fields
- **Style:** Onyx background, hairline border, Ledger White text, `13px 15px` padding,
  14px Inter.
- **Focus:** border shifts to Hairline Copper (`rgba(173,106,61,0.4)`); no glow at
  rest.
- **Error:** the `error-glow` red ring (semantic, see Elevation & Depth) — the one
  place in the system a non-copper accent color appears.

### Navigation
- Sticky header, Onyx at 90% opacity with 14px backdrop blur, hairline bottom border.
- Logo mark: 32px square, 1px copper border, Playfair "M" mark.
- Nav links: Jost label typography in Survey Grey, shifting to Ledger White on hover
  or active page. Dropdown menus: Charcoal background, 2px copper top border, hairline
  elsewhere.
- Mobile: full-screen Onyx overlay panel below ~800-900px, hairline row dividers.

## Do's and Don'ts

### Do:
- **Do** keep copper to eyebrows, CTAs, hover states, and single accent strokes — per
  The One Accent Rule.
- **Do** give primary buttons and cards real shadow now (ambient at rest, copper glow
  on hover) — per The Raised-Ore Rule.
- **Do** use Jost uppercase small-caps for anything that functions as a label,
  metadata, or navigation; reserve Playfair Display for titles.
- **Do** keep nav, footer, content blocks, and section chrome flat with hairline
  borders — the elevation upgrade is scoped to buttons and cards only.
- **Do** treat the 12-step BI methodology and 18-category questionnaire as first-class,
  numbered content — the system's visual rhetoric (eyebrow numerals, `.fnum`, the
  process-flow diagram) exists to serve exactly this kind of content.

### Don't:
- **Don't** introduce a second accent hue outside the confirmed semantic red for
  validation errors.
- **Don't** round corners beyond the established 2-4px scale; large/soft radii are
  off-brand.
- **Don't** treat the certification portal's current slate/amber shadcn theme as a
  design reference — it is confirmed drift from this system, not an alternate world
  (see PRODUCT.md).
- **Don't** add shadow/elevation to nav, footer, or content blocks (`.block`) — the
  Raised-Ore Rule is scoped to buttons and cards.
