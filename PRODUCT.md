# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two distinct audiences, served by two parts of the same repo:

1. **Mining company decision-makers / risk managers** — visitors to the public marketing site (`client/public/*.html`) evaluating or holding mining & marine insurance cover in South Africa and Sub-Saharan Africa. Their job on the site is to understand what MineTrans covers before making contact.
2. **MineTrans's own advisors** — internal staff who use the certification platform (`/certification/*` React routes: student portal, course player, quizzes, final exam, PDF certificates, admin dashboard) to train on and be assessed against the BI methodology.

## Product Purpose

MineTrans Insurance Brokers structures and places mining & marine insurance cover across South Africa and Sub-Saharan Africa, as a Juristic Representative of Donaldson Group (Pty) Ltd (FSP No. 53166). The public site's job is to make a visitor understand the three interconnected risk categories it covers under one broker, before they make contact. The certification platform's job is to train MineTrans's own advisors to a consistent, rigorous standard on the Business Interruption methodology, with progress tracked through quizzes, a final exam, and issued certificates.

## Positioning

The core differentiator is the BI methodology itself — a structured, 12-step Business Interruption calculation methodology (documenting the operation, identifying triggers, critical assets, MFL, gross profit at risk, downtime, turnover reduction, ICOW, supply chain, mitigation, indemnity period, sum insured), layered through actuarial, technical, and technology analysis, paired with an 18-category underwriting questionnaire. This rigor is the thing a neighboring broker could not truthfully claim to match. Sub-Saharan Africa specialism and the Donaldson Group regulatory backing are supporting evidence, not the primary claim — they should never be elevated above the methodology as the lead argument.

## Operating Context

- **Public marketing site**: static pages served from `client/public/*.html` — home, insurance overview plus three category pages (The Mine, Yellow Metal & Machinery, Transit of Valuable Metals), mining risk, insights, news (auto-crawled), FAQ, contact, a public BI-methodology explainer page, and a blueprint page.
- **Certification platform**: a React SPA under `/certification/*` — student portal, course player/viewer, quiz interface, timed final exam, PDF certificate generation, and an admin dashboard for tracking advisor progress. Advisors authenticate via OAuth (`OAUTH_SERVER_URL`).
- **The BI methodology content** (`client/src/data/courseData.ts`, also mirrored as a public explainer at `bi-methodology.html`) is Part I: a 12-step calculation methodology, and Part II: an 18-category underwriting questionnaire covering equipment, maintenance, fire/explosion, geotechnical/tailings, environmental, power, transportation, supply chain, safety, governance, regulatory, financial, insurance/risk transfer, contingency, community, and emerging risks.
- **Regulated financial services context**: operates under the FAIS Act and POPIA; all illustrative figures in course/marketing content carry a standing disclaimer that they are examples, not real client data or financial advice.
- Full-stack: React + Vite client, Express + tRPC server, MySQL via Drizzle ORM (existing codebase already answers the stack question).

## Capabilities and Constraints

- The three insurance facets are load-bearing and must stay consistent everywhere they appear: **The Mine** (commercial assets, liability, business interruption), **Yellow Metal & Machinery** (plant/mobile equipment breakdown), **Transit of Valuable Metals** (land/air/sea movement).
- All figures shown in course or marketing content (illustrative revenue, gross profit at risk, downstream population counts, etc.) must remain clearly illustrative — this is a standing FAIS-compliance constraint, not a one-off editorial choice.
- The certification platform's audience is **internal-only** (MineTrans's own advisors), not external brokers or the public. Do not design public sign-up/credentialing flows for it without this being explicitly revisited.
- Undecided: whether the certification platform will ever open beyond internal advisors.

## Brand Commitments

- Name: MineTrans (MineTrans Insurance Brokers).
- Regulatory disclosure — FSP No. 53166, and status as a Juristic Representative of Donaldson Group (Pty) Ltd — must travel with the brand wherever official/legal context appears, not just live in the footer.
- Course title: "MineTrans Advanced Mining Insurance Blueprint."

## Evidence on Hand

- FSP number (53166) and the Donaldson Group (Pty) Ltd parent relationship are real, confirmed regulatory facts.
- MineTrans's POPIA (and related) registration is held under Donaldson Group (Pty) Ltd, not as a standalone MineTrans registration — copy referencing POPIA compliance should reflect that the registration sits with the parent.
- No testimonials, client case studies, or third-party press exist in the repository — future work must not fabricate them.
- Figures used in course/marketing content (e.g. USD 500m turnover, USD 320m gross profit at risk, TSF population/consequence numbers) are illustrative placeholders for teaching the methodology, never real client outcomes.

## Product Principles

1. One broker, three risk categories — mine, machinery, and transit cover should never read as separable products.
2. The methodology is the proof — BI and underwriting claims trace back to the 12-step methodology or 18-category questionnaire, not vague reassurance.
3. Illustrative is not real — course and marketing figures are always clearly examples, never dressed up as client outcomes.
4. Internal training stays internal — the certification platform serves MineTrans's own advisors; don't design it as a public-facing product.
5. Regulatory disclosure is non-negotiable — FSP number and Donaldson Group status are load-bearing brand facts, not fine print.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established beyond standard web accessibility practice.
