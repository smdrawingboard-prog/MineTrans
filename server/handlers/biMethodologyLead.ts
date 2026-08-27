import { Request, Response } from "express";
import { z } from "zod";
import { sendLeadNotificationEmail } from "../services/emailService";
import { appendBIMethodologyLead } from "../services/googleSheetsSync";

/**
 * Lean lead-capture endpoint for the public BI Methodology page
 * (client/public/bi-methodology.html), a static page with no React/tRPC
 * runtime. Reuses the same email + Google Sheets side-channels as the
 * detailed BIReviewDialog submission, with a shorter set of required
 * fields appropriate for a content-page enquiry.
 */
const requestSchema = z.object({
  contactName: z.string().trim().min(1, "Name is required").max(200),
  companyName: z.string().trim().min(1, "Company / mine name is required").max(200),
  email: z.string().trim().email("A valid email is required"),
  phone: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  popiaConsent: z.literal(true, {
    message: "POPIA consent is required",
  }),
});

export async function biMethodologyLeadHandler(req: Request, res: Response) {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Please complete all required fields and accept the POPIA consent.",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { contactName, companyName, email, phone, message, popiaConsent } = parsed.data;
  const submittedAt = new Date().toISOString();

  const stored = await appendBIMethodologyLead({
    submittedAt,
    contactName,
    companyName,
    email,
    phone,
    operationDetails: message,
    popiaConsent,
  });

  if (!stored) {
    res.status(502).json({
      success: false,
      message: "We could not record your details. Please try again or email us directly.",
    });
    return;
  }

  const notificationLead = {
    companyName,
    contactName,
    email,
    phone,
    position: "",
    miningSector: "",
    riskArea: "",
    siteLocation: companyName,
    annualTurnover: "",
    biSumInsured: "",
    indemnityPeriod: "",
    keyFacility: "",
    previousClaims: "",
    currentInsurer: "",
    siteVisitAvailability: "",
    message: message
      ? `[BI Methodology page enquiry] ${message}`
      : "[BI Methodology page enquiry]",
    submittedAt,
  };

  try {
    await sendLeadNotificationEmail(notificationLead);
    res.json({
      success: true,
      message: "Thank you — a MineTrans advisor will be in touch shortly.",
    });
  } catch (error) {
    console.error("[Leads] Error submitting BI methodology lead:", error);
    res.status(502).json({
      success: false,
      message: "Something went wrong. Please try again or email us directly.",
    });
  }
}
