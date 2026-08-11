import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  subscribeToNewsletter,
  getActiveSubscribers,
  unsubscribeFromNewsletter,
  logEmail,
} from "../db";

export const newsletterRouter = router({
  /**
   * Subscribe to the mining news newsletter
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        categories: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await subscribeToNewsletter(input.email, input.name, input.categories);
        return {
          success: true,
          message: "Successfully subscribed to newsletter",
        };
      } catch (error) {
        console.error("[Newsletter] Subscription error:", error);
        return { success: false, message: "Failed to subscribe" };
      }
    }),

  /**
   * Unsubscribe from newsletter using token
   */
  unsubscribe: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await unsubscribeFromNewsletter(input.token);
        return { success: true, message: "Successfully unsubscribed" };
      } catch (error) {
        console.error("[Newsletter] Unsubscribe error:", error);
        return { success: false, message: "Failed to unsubscribe" };
      }
    }),

  /**
   * Get subscriber count (public stat)
   */
  getSubscriberCount: publicProcedure.query(async () => {
    try {
      const subscribers = await getActiveSubscribers();
      return { count: subscribers.length };
    } catch (error) {
      console.error("[Newsletter] Error getting subscriber count:", error);
      return { count: 0 };
    }
  }),
});
