import { Request, Response } from "express";
import { deleteOldMiningNews, insertMiningNewsBatch } from "../db";
import { fetchAllMiningNews } from "../services/miningNewsFetcher";

/**
 * Scheduled handler to refresh mining news weekly
 * Called by the Heartbeat cron system every Monday at 9:00 UTC
 */
export async function refreshMiningNewsHandler(req: Request, res: Response) {
  try {
    console.log("[Mining News Refresh] Starting scheduled news refresh");

    // Delete old articles (older than 90 days)
    await deleteOldMiningNews(90);
    console.log("[Mining News Refresh] Deleted old articles");

    // Fetch new articles from sources
    const articles = await fetchAllMiningNews();
    console.log(`[Mining News Refresh] Fetched ${articles.length} new articles`);

    // Insert into database
    if (articles.length > 0) {
      await insertMiningNewsBatch(articles);
      console.log(`[Mining News Refresh] Inserted ${articles.length} articles into database`);
    }

    // Return success response
    res.json({
      ok: true,
      articlesAdded: articles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Mining News Refresh] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";

    res.status(500).json({
      error: errorMessage,
      stack: errorStack,
      context: {
        url: req.url,
        handler: "refreshMiningNews",
      },
      timestamp: new Date().toISOString(),
    });
  }
}
