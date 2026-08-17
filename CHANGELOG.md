# Changelog

## 2026-08-17 — Homepage infographics, course visuals, and a critical deployment fix

### Added

- **Homepage — "Our Products" / "Our Approach" infographics.** Added isometric product-engine and approach diagrams to the homepage (later superseded by a polished webp version merged in from a parallel branch — see *Changed* below).
- **Homepage — risk-assessment infographics on the three insurance facet cards.** Each of the three cards on the homepage ("The Mine", "Machinery", "Transit") now leads with its own risk-assessment diagram (`mine-risk-assessment.png`, `machinery-risk-assessment.png`, `transit-risk-assessment.png`), stored under `client/public/images/diagrams/`.
- **Click-to-enlarge lightbox.** The three facet-card infographics are clickable, opening a full-resolution lightbox overlay (closable via the ✕ button, backdrop click, or Escape). Card text remains a separate link to the relevant insurance page, so the two interactions don't collide.
- **Insurance detail pages — matching infographics.** `insurance-mine.html`, `insurance-machinery.html`, and `insurance-transit.html` each got their matching infographic placed right after the hero section, using the same lightbox pattern as the homepage.
- **Course — tailings risk assessment infographic.** Added a design/governance/monitoring/consequences diagram to the "Tailings Management" module (Part II, category 6) of the training course. This required reintroducing a minimal `'image'` content-block type to `CourseContent.tsx` (icons, progress bar, and reveal animations from an earlier iteration were **not** brought back — see *Removed*).

### Fixed

- **Dead links and CTAs across orphaned pages** (`courses.html`, `student-portal.html`, `blueprint-content.html`, `training-showcase.html` — none of these are linked from the main site nav, but all are still part of the deployed build):
  - Removed dead `<link href="styles.css">` references from `courses.html` and `student-portal.html` (both already carry a complete inline `<style>` block).
  - Replaced broken `/manus-storage/*` image references — a path that only resolves via a dev-server-only proxy plugin — with real local assets (`images/logo/mt-badge.png`, `favicon.ico`).
  - Fixed `training-showcase.html`'s root-relative (`href="/"`) links so they resolve correctly on both the custom domain (`www.minetrans.co.za`) and the raw GitHub Pages URL.
- **Critical: the React SPA was never actually reachable in production.** A custom Vite plugin (`vitePluginCopyHtmlFiles`) that copies the 16 static marketing pages into the build output was silently overwriting the React app's own built `index.html` with the marketing homepage. This meant the entire `/certification/*` route tree — including the login-gated course, student dashboard, admin dashboard, quiz, and final exam — had no reachable HTML entry point on the live site, regardless of what any link pointed to.
  - **Fix:** `vite.config.ts` now preserves the Vite-built SPA shell as `404.html` before the marketing homepage overwrite happens. GitHub Pages serves `404.html` (with the original URL/pathname intact) for any path that isn't a real static file, so client-side routes like `/certification/course` now resolve correctly via wouter's router reading `window.location.pathname`. This is the standard "SPA on a static host" fallback trick.
  - Verified end-to-end with a local script that mimics GitHub Pages' actual 404-fallback behavior: navigating to `/certification/course` now boots the app and correctly shows the "Access Restricted — Please log in" gate for unauthenticated visitors.
  - The "Enroll Now" / "Start Your Journey" CTAs on `training-showcase.html` now point to `certification/course`, which — thanks to the fix above — is a real, working, employees-only (login-gated) destination.

### Changed

- Merged in a parallel branch's polished "Our Approach" / "Our Products" webp infographics on the homepage, replacing the earlier hand-built PNG versions.
- Removed the thick left-border style on course note callouts (flagged by the design-quality detector as an "AI-slop" side-tab pattern).

### Removed

- **Rolled back an earlier course-fatigue feature and 13 site-wide stock photos** at the user's request: real photography across marketing pages, a 26-icon topic system, a course progress bar, localStorage-backed completion tracking, and reveal/transition animations were all reverted via `git revert` on both the feature branch and `main`. (The minimal `'image'` block type reintroduced later for the tailings infographic is unrelated to this reverted feature — it's a narrower, standalone addition.)

### Notes for future maintainers

- `client/public/index.html` is the file served at the site root — it is a **fully static, hand-written marketing page**, not the React app. The actual React SPA entry is `client/index.html` (mounts `#root`, loads `/src/main.tsx`).
- Any client-side-routed page (anything under `/certification/*`, `/admin/*`, etc.) is only reachable through the `404.html` fallback described above. If `vite.config.ts`'s `vitePluginCopyHtmlFiles` is ever refactored, make sure the `404.html` preservation step stays intact, or the entire React app will silently go dark again.
- `courses.html`, `student-portal.html`, `training-showcase.html`, and `blueprint-content.html` are built and deployed but not linked from the main site navigation. Worth deciding whether they should be linked in, redirected, or removed.
