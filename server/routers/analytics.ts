import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  logPageView,
  logNewsEngagement,
  getPageViewStats,
  getNewsEngagementStats,
  getTopCategories,
} from "../db";

export const analyticsRouter = router({
  /**
   * Log a page view
   */
  logPageView: publicProcedure
    .input(
      z.object({
        page: z.string(),
        referrer: z.string().optional(),
        userAgent: z.string().optional(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await logPageView(
          input.page,
          input.referrer,
          input.userAgent,
          input.sessionId
        );
        return { success: true };
      } catch (error) {
        console.error("[Analytics] Page view log error:", error);
        return { success: false };
      }
    }),

  /**
   * Log news engagement (view, click, share)
   */
  logNewsEngagement: publicProcedure
    .input(
      z.object({
        articleId: z.number(),
        action: z.enum(["view", "click", "share"]),
        category: z.string().optional(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await logNewsEngagement(
          input.articleId,
          input.action,
          input.category,
          input.sessionId
        );
        return { success: true };
      } catch (error) {
        console.error("[Analytics] Engagement log error:", error);
        return { success: false };
      }
    }),

  /**
   * Get page view statistics
   */
  getPageStats: publicProcedure
    .input(
      z.object({
        page: z.string(),
        days: z.number().optional().default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const stats = await getPageViewStats(input.page, input.days);
        return { success: true, ...stats };
      } catch (error) {
        console.error("[Analytics] Get page stats error:", error);
        return { success: false, totalViews: 0, uniqueSessions: 0 };
      }
    }),

  /**
   * Get news engagement statistics
   */
  getEngagementStats: publicProcedure
    .input(z.object({ days: z.number().optional().default(30) }))
    .query(async ({ input }) => {
      try {
        const stats = await getNewsEngagementStats(input.days);
        return { success: true, stats };
      } catch (error) {
        console.error("[Analytics] Get engagement stats error:", error);
        return { success: false, stats: [] };
      }
    }),

  /**
   * Get top performing categories
   */
  getTopCategories: publicProcedure
    .input(
      z.object({
        days: z.number().optional().default(30),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const categories = await getTopCategories(input.days, input.limit);
        return { success: true, categories };
      } catch (error) {
        console.error("[Analytics] Get top categories error:", error);
        return { success: false, categories: [] };
      }
    }),

  /**
   * Get comprehensive dashboard stats
   */
  getDashboardStats: publicProcedure
    .input(z.object({ days: z.number().optional().default(30) }))
    .query(async ({ input }) => {
      try {
        const homeStats = await getPageViewStats("/index.html", input.days);
        const newsStats = await getPageViewStats("/news.html", input.days);
        const engagementStats = await getNewsEngagementStats(input.days);
        const topCategories = await getTopCategories(input.days, 5);

        return {
          success: true,
          pages: {
            home: homeStats,
            news: newsStats,
          },
          engagement: engagementStats,
          topCategories,
        };
      } catch (error) {
        console.error("[Analytics] Get dashboard stats error:", error);
        return {
          success: false,
          pages: {
            home: { totalViews: 0, uniqueSessions: 0 },
            news: { totalViews: 0, uniqueSessions: 0 },
          },
          engagement: [],
          topCategories: [],
        };
      }
    }),
});
