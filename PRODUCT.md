# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two confirmed audiences on this codebase:

- **Prospective and current institutional clients** — procurement, risk, and finance
  people at mining operations and companies moving valuable metals, evaluating or
  managing insurance cover. They reach the marketing site (`client/public/*.html`)
  researching commercial assets, liability, business interruption, plant & machinery,
  and land/air/sea transit cover.
- **MineTrans's own advisors/staff** — internal users who complete the certification
  program (`/certification/*`) to become credentialed on the company's Business
  Interruption methodology and underwriting questionnaire. This is internal
  credentialing, not an open-market course (confirmed; the "Employee Access" blueprint
  page and FAIS-regulated advisor context both point the same way). Admin users manage
  courses, students, and certificates via `/certification/admin/*`.

## Product Purpose

MineTrans Insurance Brokers structures mining and marine insurance cover for
Sub-Saharan Africa — commercial assets, liability, business interruption, plant &
machinery, and transit insurance for the metals a mine moves. This repo is both the
public-facing site that wins and informs that business, and the internal platform that
trains and certifies MineTrans's own advisors on the firm's underwriting methodology.
Success on the marketing side is a qualified inquiry (the "Request a BI Review" flow);
success on the certification side is an advisor who has completed the course, passed
its quizzes, and holds a valid certificate.

## Positioning

MineTrans's differentiator is depth of methodology, not just broking volume: a codified
12-step Business Interruption calculation process and an 18-category underwriting
questionnaire specific to mining risk, which double as both sales evidence (the
BI-methodology page) and the internal training curriculum. A generalist broker cannot
credibly show this level of structured, mining-specific underwriting rigor.

## Operating Context

- MineTrans Insurance Brokers is a Juristic Representative of Donaldson Group (Pty) Ltd
  — FSP No. 53166 — and operates under South Africa's FAIS Act. All figures in
  course/marketing content are illustrative only and must not read as financial advice.
- The certification flow is sequential: course sections → section quizzes → final exam
  → certificate issuance (PDF), with per-student progress and attempt tracking.
- Admins manage courses, students/advisors, and certificates from a separate dashboard;
  there's also a student-progress → Google Sheets sync and a Sheets-sourced blog service
  in the codebase, but per the README neither is wired into any UI yet — treat both as
  dormant scaffolding, not live product surface.
- The "Request a BI Review" lead form on the marketing home page emails the sales team
  and best-effort logs to a Google Sheet; it must keep working even when the Sheets
  integration isn't configured.

## Capabilities and Constraints

- Full-stack React + Express app; tRPC API; MySQL via Drizzle ORM. Marketing pages are
  static HTML served as-is (`client/public/*.html`); the certification/admin experience
  is a client-side-routed React SPA (`client/src/App.tsx`).
- Certificates are generated as PDFs on completion.
- Course content — the 12-step BI methodology and 18-category underwriting
  questionnaire — is real, proprietary company IP, not filler copy; treat it as
  authoritative when building around it.

## Brand Commitments

- Confirmed identity system (from the existing README, applies across the product):
  - Palette: Onyx `#0A0A0B` · Graphite `#1E1D20` · Platinum `#C9CACE` · Copper `#AD6A3D`
    · Bone `#F7F5F1`
  - Fonts: Playfair Display (headings) · Jost (labels) · Inter (body)
- The certification portal currently does **not** follow this system — it runs its own
  slate-900/amber-600 dashboard palette (e.g. `CertificationLanding.tsx`). Confirmed:
  this is drift, not a deliberate second brand — the portal should converge onto the
  Onyx/Copper/Bone/Playfair-Jost-Inter system over time. Don't treat the slate/amber
  look as a visual reference to preserve when working on certification screens.

## Evidence on Hand

- Real, substantial course content: the 12-step Business Interruption methodology and
  18-category mining underwriting questionnaire (`client/src/data/courseData.ts`).
- Regulatory facts that are real and must be used verbatim where shown: FSP No. 53166,
  Juristic Representative of Donaldson Group (Pty) Ltd, FAIS Act disclaimer language.
- No confirmed customer testimonials, case studies, press mentions, or pricing exist in
  the repo — do not fabricate any of these for marketing or training surfaces.

## Product Principles

1. Regulatory correctness is non-negotiable — FSP number, Juristic Representative
   status, and the "illustrative only, not financial advice" framing must appear
   wherever figures or case content are shown.
2. Methodology is the product's proof, not decoration — the BI methodology and
   underwriting questionnaire should read as rigorous, specific, and mining-literate,
   never generic insurance-broker copy.
3. One brand, two audiences — the public site persuades institutional buyers; the
   certification portal operates advisors through a credentialing workflow. Both should
   converge on the same Onyx/Copper/Bone/Playfair-Jost-Inter identity rather than
   reading as separate products.
4. The certification flow is internal and credentialing-grade — clarity, progress
   legibility, and trustworthy assessment (quizzes, attempts, certificates) outrank
   marketing flourish inside `/certification/*`.
5. Never invent evidence — no fabricated testimonials, benchmarks, customer names, or
   pricing on any surface.

## Accessibility & Inclusion

WCAG 2.1 AA (confirmed).
