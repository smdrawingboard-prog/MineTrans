import { describe, it, expect } from "vitest";

// These are optional, deployment-specific integrations (see README's
// "Google Sheets" section) — CI and local dev commonly don't have them
// configured, so this validates format *when present* rather than
// requiring them to exist.
describe("Google Sheets Integration", () => {
  const sheetIdPattern = /^[a-zA-Z0-9_-]+$/;

  it("should have validly formatted sheet IDs when configured", () => {
    const sheetIds = {
      GOOGLE_SHEETS_BLOG_ID: process.env.GOOGLE_SHEETS_BLOG_ID,
      GOOGLE_SHEETS_NEWS_ID: process.env.GOOGLE_SHEETS_NEWS_ID,
      GOOGLE_SHEETS_BI_REVIEW_ID: process.env.GOOGLE_SHEETS_BI_REVIEW_ID,
      GOOGLE_SHEETS_COURSES_ID: process.env.GOOGLE_SHEETS_COURSES_ID,
    };

    for (const [name, value] of Object.entries(sheetIds)) {
      if (value === undefined) {
        console.log(`ℹ️  ${name} not configured, skipping format check`);
        continue;
      }
      expect(value, `${name} should match expected sheet ID format`).toMatch(
        sheetIdPattern
      );
    }
  });

  it("should have a non-empty API key when configured", () => {
    const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

    if (apiKey === undefined) {
      console.log("ℹ️  BUILT_IN_FORGE_API_KEY not configured, skipping check");
      return;
    }
    expect(apiKey.length).toBeGreaterThan(10);
  });
});
