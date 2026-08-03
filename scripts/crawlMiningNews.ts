import fs from "node:fs";
import path from "node:path";
import { fetchAllMiningNews } from "../server/services/miningNewsFetcher";

const OUTPUT_PATH = path.join(import.meta.dirname, "..", "client", "public", "news-data.json");

async function main() {
  const articles = await fetchAllMiningNews();

  const existing = fs.existsSync(OUTPUT_PATH)
    ? JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"))
    : null;

  const newHeadlines = new Set(articles.map((a) => a.headline));
  const existingHeadlines = new Set(
    (existing?.articles || []).map((a: { headline: string }) => a.headline)
  );
  const changed =
    !existing ||
    newHeadlines.size !== existingHeadlines.size ||
    [...newHeadlines].some((h) => !existingHeadlines.has(h));

  if (!changed) {
    console.log("[crawlMiningNews] No relevant news changes — leaving news-data.json untouched");
    return;
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    articles,
  };
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
  console.log(`[crawlMiningNews] Wrote ${articles.length} articles to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("[crawlMiningNews] Failed:", error);
  process.exit(1);
});
