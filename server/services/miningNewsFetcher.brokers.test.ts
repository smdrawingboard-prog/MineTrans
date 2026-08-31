import { describe, expect, it } from "vitest";
import type { InsertMiningNews } from "@shared/schema";
import { isExcludedBrokerArticle } from "./miningNewsFetcher";

function article(fields: Partial<InsertMiningNews>): InsertMiningNews {
  return {
    headline: "Placeholder mining headline for testing",
    excerpt: "",
    publication: "Mining Weekly",
    sourceUrl: "https://example.com/article",
    publishedAt: new Date(),
    category: "General",
    ...fields,
  } as InsertMiningNews;
}

// Roger's rule: none of these competitor brokers may appear in the MineTrans feed.
describe("competitor broker exclusion", () => {
  const blocked: [string, Partial<InsertMiningNews>][] = [
    ["Marsh", { headline: "Marsh appoints new mining practice leader" }],
    ["Marsh McLennan", { headline: "Marsh McLennan grows its Africa team" }],
    ["Aon", { headline: "Aon report warns of rising mining risk" }],
    ["Lockton", { headline: "Lockton expands African operations" }],
    ["GIB Insurance", { headline: "GIB Insurance launches mining product" }],
    ["GIB (bare)", { headline: "GIB names new mining lead for the region" }],
    ["Price Forbes", { headline: "Price Forbes backs new mining facility" }],
    ["Compendium", { headline: "Compendium Insurance Brokers named on panel" }],
    ["Willis Towers Watson", { headline: "Willis Towers Watson mining survey out" }],
    ["WTW", { headline: "WTW releases its annual mining risk review" }],
    ["Maksure", { headline: "Maksure Risk Solutions grows mining book" }],
    ["OLEA", { headline: "OLEA Africa expands its broking network" }],
    ["named in excerpt", { excerpt: "Analysis by Aon shows premiums rising" }],
    ["named in source URL", { sourceUrl: "https://www.marsh.com/za/mining.html" }],
    ["named in publication", { publication: "Lockton Africa" }],
  ];

  it.each(blocked)("excludes an article mentioning %s", (_label, fields) => {
    expect(isExcludedBrokerArticle(article(fields))).toBe(true);
  });
});

// Two broker names are also ordinary English words. Mining coverage uses both innocently,
// and those articles must still reach the feed.
describe("legitimate mining coverage is not excluded", () => {
  const allowed: [string, Partial<InsertMiningNews>][] = [
    ["salt marsh", { headline: "Tailings dam water management advances", excerpt: "Salt marsh rehabilitation near the facility" }],
    ["wetland marsh", { headline: "Wetland marsh restoration at a closed mine" }],
    ["compendium of", { headline: "A compendium of new mining safety regulations" }],
    ["Marshall / marshalling", { headline: "Marshall Mining reports record output", excerpt: "Marshalling yard upgrades" }],
    ["unrelated results story", { headline: "Harmony raises dividend after profit surge" }],
    ["Gibraltar / Gibson", { headline: "Gibraltar mine expands", excerpt: "Gibson Ltd invests" }],
  ];

  it.each(allowed)("keeps an article mentioning %s", (_label, fields) => {
    expect(isExcludedBrokerArticle(article(fields))).toBe(false);
  });
});
