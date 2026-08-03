import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getLatestMiningNews, insertMiningNewsBatch, deleteOldMiningNews } from "./db";
import { fetchAllMiningNews } from "./services/miningNewsFetcher";
import { newsletterRouter } from "./routers/newsletter";
import { newsSearchRouter } from "./routers/newsSearch";
import { analyticsRouter } from "./routers/analytics";
import { certificationRouter } from "./routers/certification";
import { leadsRouter } from "./routers/leads";
import { blogRouter } from "./routers/blog";

import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  miningNews: router({
    getLatest: publicProcedure.query(async () => {
      return await getLatestMiningNews(20);
    }),
    refreshNews: publicProcedure.mutation(async () => {
      try {
        // Delete old articles (older than 90 days)
        await deleteOldMiningNews(90);
        
        // Fetch new articles
        const articles = await fetchAllMiningNews();
        
        // Insert into database
        if (articles.length > 0) {
          await insertMiningNewsBatch(articles);
        }
        
        return {
          success: true,
          articlesAdded: articles.length,
        };
      } catch (error) {
        console.error("[Mining News] Error refreshing news:", error);
        return {
          success: false,
          error: "Failed to refresh mining news",
        };
      }
    }),
  }),

  newsletter: newsletterRouter,
  newsSearch: newsSearchRouter,
  analytics: analyticsRouter,
  certification: certificationRouter,
  leads: leadsRouter,
  blog: blogRouter,
});

export type AppRouter = typeof appRouter;
