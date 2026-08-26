# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

MineTrans is the website and advisor training/certification platform for MineTrans
Insurance Brokers (specialist mining and marine insurance broking for Sub-Saharan
Africa, a Juristic Representative of Donaldson Group (Pty) Ltd — FSP No. 53166). A
full-stack React + Express app, originally scaffolded via Manus.

## Commands

```bash
pnpm install         # install deps
pnpm dev              # dev server (client + API via tsx watch), see console for URL
pnpm run build        # build client (dist/public) + server (dist/index.js)
pnpm start             # run the built production server
pnpm check            # tsc --noEmit
pnpm format          # prettier --write .
pnpm test              # vitest run
pnpm db:push          # drizzle-kit generate && drizzle-kit migrate
pnpm crawl:news      # tsx scripts/crawlMiningNews.ts (manual mining-news crawl)
```

Run a single test file: `pnpm vitest run server/auth.logout.test.ts`. Test files live
alongside the code they test under `server/**/*.test.ts` (see `vitest.config.ts`); only
the `server/` tree is included.

The server needs environment variables to run for real (database, auth, integrations)
— see `server/_core/env.ts` for the full list (`DATABASE_URL`, `JWT_SECRET`,
`OAUTH_SERVER_URL`, etc.). None are committed; set them via a local `.env` (gitignored)
or the hosting provider.

## Architecture

**Client/server split with path aliases**: `@` → `client/src`, `@shared` → `shared`,
`@assets` → `attached_assets` (see `vite.config.ts` / `vitest.config.ts`). The client is
a Vite + React 19 SPA using `wouter` for routing (wired up in `client/src/App.tsx`) and
`@tanstack/react-query` + tRPC for data fetching. UI primitives in
`client/src/components/ui` are shadcn-style (see `components.json`), styled with
Tailwind v4.

**API is tRPC, not REST**, mounted at `/api/trpc` (`server/_core/index.ts`). All
application routers are composed in `server/routers.ts` into one `appRouter`
(`newsletter`, `newsSearch`, `analytics`, `certification`, `leads`, `blog`, plus inline
`miningNews` and the `system` router). Any new API surface should be added as a tRPC
router here, not a raw Express route — the comment in `routers.ts` notes that any new
raw Express route must start with `/api/` so the gateway routes it correctly, and that
socket.io registration (if ever needed) happens in `server/_core/index.ts`.

**Procedure tiers** (`server/_core/trpc.ts`): `publicProcedure`, `protectedProcedure`
(requires `ctx.user`), `adminProcedure` (requires `ctx.user.role === 'admin'`). Context
(`server/_core/context.ts`) currently always resolves `user: null` — auth/session
wiring into context is not yet implemented, so protected/admin procedures will always
reject as written until that's filled in.

**`server/_core/` and `shared/_core/` are template/scaffolding code** (env loading,
trpc setup, storage proxy, notification, LLM helper, vite dev middleware, generic
errors) — distinguish this from the app-specific code in `server/routers/`,
`server/services/`, and `server/handlers/`.

**Two Express endpoints exist outside tRPC** and are registered before the tRPC
middleware in `server/_core/index.ts`: `/api/scheduled/refreshMiningNews` (cron-style
trigger for the mining news crawler) and `/api/bi-assessment/generate` (PDF generation,
see `server/services/certificateGenerator.ts` for the pdfkit pattern).

**Database**: MySQL via Drizzle ORM. Schema and migrations live in `drizzle/`
(`drizzle/schema.ts`, `drizzle/relations.ts`, numbered SQL migration files under
`drizzle/`). `server/db.ts` and `server/storage.ts` are the query/data-access layer;
`server/services/certificationDb.ts` holds certification-specific queries. Run
`pnpm db:push` after changing `drizzle/schema.ts` to generate + apply migrations.

**Course content**: the 12-step Business Interruption methodology and 18-category
underwriting questionnaire that drive the certification platform live as static data in
`client/src/data/courseData.ts`, not the database — treat that file as the source of
truth for course structure/copy.

**Static marketing pages**: `client/public/*.html` are standalone marketing/info pages
(home, insurance, risk, insights, news, FAQ, contact, etc.) served as-is, separate from
the React SPA shell in `client/index.html` (which carries SEO/social-share tags).

**Google Sheets integrations** (optional, best-effort — env vars unset just skip the
sheet, the underlying feature still works):
- "Request a BI Review" form → logs to a Sheet (`GOOGLE_SHEETS_CREDENTIALS`,
  `GOOGLE_SHEETS_BI_REVIEW_ID`, `Leads` tab), in addition to emailing sales.
- `server/services/googleSheetsSync.ts` (admin: student progress → Sheets) and
  `server/services/blogService.ts` (blog posts sourced from a public Sheet via
  `GOOGLE_SHEETS_BLOG_ID`) are separate, pre-existing pieces of scaffolding — neither is
  currently wired into any UI.

## Brand

- Palette: Onyx `#0A0A0B` · Graphite `#1E1D20` · Platinum `#C9CACE` · Copper `#AD6A3D`
  · Bone `#F7F5F1`
- Fonts: Playfair Display (headings) · Jost (labels) · Inter (body)
- All figures in course/marketing content are illustrative only and do not constitute
  financial advice under the FAIS Act.
