# MineTrans

The website and advisor training/certification platform for **MineTrans
Insurance Brokers** — specialist mining and marine insurance broking for
Sub-Saharan Africa.

MineTrans Insurance Brokers is a Juristic Representative of Donaldson
Group (Pty) Ltd — FSP No. 53166.

---

## What's in this repo

A full-stack React + Express app (originally scaffolded via Manus):

| Path | What it is |
|---|---|
| `client/src/App.tsx` | Client-side router — wires up all the app's pages |
| `client/src/pages/` | React pages: certification/student portal, admin dashboard, course viewer, quizzes, final exam, analytics |
| `client/src/components/` | Shared UI (course layout/sidebar, dashboard layout, AI chat box, `ui/` = shadcn-style primitives) |
| `client/src/data/courseData.ts` | The training course content (12-step Business Interruption methodology, 18-category underwriting questionnaire) |
| `client/public/*.html` | Static marketing/info pages (home, insurance, risk, insights, news, FAQ, contact, etc.) served as-is |
| `client/index.html` | SPA shell (SEO/social-share tags live here) |
| `server/` | Express + tRPC API — auth, certification logic, mining news fetching, newsletter, leads, blog, Google Sheets sync, PDF certificate generation |
| `drizzle/` | Database schema + migrations (MySQL via Drizzle ORM) |
| `shared/` | Types/constants shared between client and server |

## Running it locally

Needs [Node.js](https://nodejs.org) (LTS) and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev       # starts the dev server (client + API) — see console output for the URL
```

To build the production bundle:

```bash
pnpm run build   # builds client (dist/public) and server (dist/index.js)
pnpm start        # runs the built server
```

The server needs a few environment variables to run for real (database,
auth, integrations) — see `server/_core/env.ts` for the full list
(`DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, etc.). None of these are
committed to the repo; set them via your hosting provider or a local
`.env` file (already gitignored).

## Brand

- Palette: Onyx `#0A0A0B` · Graphite `#1E1D20` · Platinum `#C9CACE` ·
  Copper `#AD6A3D` · Bone `#F7F5F1`
- Fonts: Playfair Display (headings) · Jost (labels) · Inter (body)
- All figures in course/marketing content are illustrative only and do
  not constitute financial advice under the FAIS Act.
