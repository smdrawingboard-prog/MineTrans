interface LeadData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  position: string;
  miningSector: string;
  riskArea: string;
  siteLocation: string;
  annualTurnover: string;
  biSumInsured: string;
  indemnityPeriod: string;
  keyFacility: string;
  previousClaims: string;
  currentInsurer: string;
  siteVisitAvailability: string;
  message: string;
  submittedAt: string;
}

export async function sendLeadNotificationEmail(lead: LeadData): Promise<void> {
  try {
    // Log lead data to console (in production, integrate with email service like SendGrid, AWS SES, etc.)
    console.log("📧 New BI Review Lead Received:", {
      timestamp: new Date().toISOString(),
      companyName: lead.companyName,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      position: lead.position,
      miningSector: lead.miningSector,
      riskArea: lead.riskArea,
      siteLocation: lead.siteLocation,
      annualTurnover: lead.annualTurnover,
      biSumInsured: lead.biSumInsured,
      indemnityPeriod: lead.indemnityPeriod,
      keyFacility: lead.keyFacility,
      previousClaims: lead.previousClaims,
      currentInsurer: lead.currentInsurer,
      siteVisitAvailability: lead.siteVisitAvailability,
      message: lead.message,
    });

    // TODO: Integrate with email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: process.env.SALES_EMAIL,
    //   from: process.env.FROM_EMAIL,
    //   subject: `New BI Review Request from ${lead.companyName}`,
    //   html: generateEmailHTML(lead),
    // });

    // For now, we'll just log it and consider it successful
    console.log("✅ Lead notification logged successfully");
  } catch (error) {
    console.error("❌ Error sending lead notification:", error);
    throw error;
  }
}

function generateEmailHTML(lead: LeadData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #AD6A3D;">New BI Review Request</h2>
      <p><strong>Company:</strong> ${lead.companyName}</p>
      <p><strong>Contact:</strong> ${lead.contactName}</p>
      <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
      <p><strong>Phone:</strong> ${lead.phone}</p>
      <p><strong>Position:</strong> ${lead.position}</p>
      <p><strong>Mining Sector:</strong> ${lead.miningSector}</p>
      <p><strong>Primary Risk Area:</strong> ${lead.riskArea}</p>
      <p><strong>Message:</strong></p>
      <p>${lead.message || "No additional message"}</p>
      <p><small>Submitted: ${new Date(lead.submittedAt).toLocaleString()}</small></p>
    </div>
  `;
}
