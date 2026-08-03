import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { sendLeadNotificationEmail } from "../services/emailService";
import { appendBIReviewLead } from "../services/googleSheetsSync";

export const leadsRouter = router({
  submitBIReview: publicProcedure
    .input(
      z.object({
        companyName: z.string().min(1, "Company name required"),
        contactName: z.string().min(1, "Contact name required"),
        email: z.string().email("Valid email required"),
        phone: z.string().min(1, "Phone number required"),
        position: z.enum(["Finance", "Operations", "Risk", "Insurance", "Other"]),
        miningSector: z.string().min(1, "Mining sector required"),
        riskArea: z.enum(["BI", "Tailings", "Machinery", "Supply", "Multiple"]),
        siteLocation: z.string().optional(),
        annualTurnover: z.string().optional(),
        biSumInsured: z.string().optional(),
        indemnityPeriod: z.enum(["12 months", "18 months", "24 months", "36 months", "Not sure"]),
        keyFacility: z.string().optional(),
        previousClaims: z.string().optional(),
        currentInsurer: z.string().optional(),
        siteVisitAvailability: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const lead = {
        companyName: input.companyName,
        contactName: input.contactName,
        email: input.email,
        phone: input.phone,
        position: input.position,
        miningSector: input.miningSector,
        riskArea: input.riskArea,
        siteLocation: input.siteLocation || "",
        annualTurnover: input.annualTurnover || "",
        biSumInsured: input.biSumInsured || "",
        indemnityPeriod: input.indemnityPeriod,
        keyFacility: input.keyFacility || "",
        previousClaims: input.previousClaims || "",
        currentInsurer: input.currentInsurer || "",
        siteVisitAvailability: input.siteVisitAvailability || "",
        message: input.message || "",
        submittedAt: new Date().toISOString(),
      };

      // Google Sheets is a best-effort side-channel: log a lead there
      // without letting a Sheets outage or missing config fail the
      // submission — email notification remains the source of truth.
      const sheetsSync = appendBIReviewLead(lead).catch((error) => {
        console.error("[Leads] Google Sheets sync failed for BI review lead:", error);
        return false;
      });

      try {
        await sendLeadNotificationEmail(lead);
        await sheetsSync;

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
