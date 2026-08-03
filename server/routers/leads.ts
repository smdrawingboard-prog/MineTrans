import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { sendLeadNotificationEmail } from "../services/emailService";

export const leadsRouter = router({
  submitBIReview: publicProcedure
    .input(
      z.object({
        companyName: z.string().min(1, "Company name required"),
        contactName: z.string().min(1, "Contact name required"),
        email: z.string().email("Valid email required"),
        phone: z.string().min(1, "Phone number required"),
        position: z.enum(["CFO", "COO", "Risk", "Insurance", "Other"]),
        miningSector: z.string().min(1, "Mining sector required"),
        riskArea: z.enum(["BI", "Tailings", "Machinery", "Supply", "Multiple"]),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Send email notification to sales team
        await sendLeadNotificationEmail({
          companyName: input.companyName,
          contactName: input.contactName,
          email: input.email,
          phone: input.phone,
          position: input.position,
          miningSector: input.miningSector,
          riskArea: input.riskArea,
          message: input.message || "",
          submittedAt: new Date().toISOString(),
        });

        return {
          success: true,
          message: "Your request has been submitted successfully. We will contact you within 24 hours.",
        };
      } catch (error) {
        console.error("Error submitting BI review request:", error);
        return {
          success: false,
          message: "Failed to submit request. Please try again.",
        };
      }
    }),
});
