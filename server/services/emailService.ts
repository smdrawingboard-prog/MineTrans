/**
 * Lead notification email.
 *
 * Sends each website lead to the MineTrans team via the Resend HTTPS API.
 * HTTPS is used rather than SMTP because Railway blocks outbound SMTP on
 * Free/Trial/Hobby plans.
 *
 * Required env (Railway → MineTrans service → Variables):
 *   RESEND_API_KEY   – API key from resend.com (sending domain mail.minetrans.co.za verified there)
 *   LEAD_NOTIFY_TO   – comma-separated recipients, e.g. "roger@minetrans.co.za,jp@minetrans.co.za"
 * Optional:
 *   LEAD_FROM_EMAIL  – defaults to "MineTrans Website <enquiries@mail.minetrans.co.za>"
 *
 * This function never throws: the lead is already stored (DB / Google Sheets)
 * before it runs, so a mail failure must not turn a saved lead into an error
 * for the visitor. Failures are logged with a clear [Lead Email] prefix.
 */

export interface LeadData {
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

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "MineTrans Website <enquiries@mail.minetrans.co.za>";
const REQUEST_TIMEOUT_MS = 10_000;

const RISK_AREA_LABELS: Record<string, string> = {
  BI: "Business Interruption",
  Tailings: "Tailings",
  Machinery: "Machinery",
  Supply: "Supply Chain",
  Multiple: "Multiple",
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseRecipients(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
}

function formatSubmitted(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", dateStyle: "medium", timeStyle: "short" }) + " SAST";
}

function leadRows(lead: LeadData): Array<[string, string]> {
  const rows: Array<[string, string]> = [
    ["Company", lead.companyName],
    ["Contact", lead.contactName],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Position", lead.position],
    ["Mining sector", lead.miningSector],
    ["Primary risk area", RISK_AREA_LABELS[lead.riskArea] ?? lead.riskArea],
    ["Site / operation", lead.siteLocation],
    ["Annual turnover / GP", lead.annualTurnover],
    ["Estimated BI sum insured", lead.biSumInsured],
    ["Indemnity period", lead.indemnityPeriod],
    ["Key facility / single point of failure", lead.keyFacility],
    ["Previous BI claims", lead.previousClaims],
    ["Current insurer / broker", lead.currentInsurer],
    ["Site visit availability", lead.siteVisitAvailability],
    ["Message", lead.message],
    ["Submitted", formatSubmitted(lead.submittedAt)],
  ];
  return rows.filter(([, v]) => v && v.trim().length > 0);
}

export function buildLeadEmail(lead: LeadData): { subject: string; html: string; text: string } {
  const isMethodology = lead.message.startsWith("[BI Methodology page enquiry]");
  const kind = isMethodology ? "BI Methodology enquiry" : "BI Review request";
  const subject = `New ${kind}: ${lead.companyName} (${lead.contactName})`.slice(0, 200);

  const rows = leadRows(lead);
  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #E4E1DA;color:#3A383D;font-weight:600;vertical-align:top;width:38%">${escapeHtml(k)}</td>` +
        `<td style="padding:8px 12px;border-bottom:1px solid #E4E1DA;color:#0A0A0B;white-space:pre-wrap">${
          k === "Email"
            ? `<a href="mailto:${escapeHtml(v)}" style="color:#AD6A3D">${escapeHtml(v)}</a>`
            : k === "Phone"
              ? `<a href="tel:${escapeHtml(v.replace(/[^\d+]/g, ""))}" style="color:#AD6A3D">${escapeHtml(v)}</a>`
              : escapeHtml(v)
        }</td></tr>`
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#F7F5F1;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:620px;margin:0 auto;padding:24px">
  <div style="background:#0A0A0B;color:#F7F5F1;padding:18px 20px;border-radius:6px 6px 0 0">
    <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#AD6A3D">MineTrans website lead</div>
    <div style="font-size:20px;margin-top:4px">New ${escapeHtml(kind)}</div>
  </div>
  <table role="presentation" style="width:100%;border-collapse:collapse;background:#FFFFFF;font-size:14px">${htmlRows}</table>
  <p style="font-size:12px;color:#3A383D;margin-top:16px">Reply to this email to respond directly to ${escapeHtml(lead.contactName)}. This lead is also saved in the MineTrans leads sheet.</p>
</div></body></html>`;

  const text =
    `New ${kind} from www.minetrans.co.za\n\n` +
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nReply to this email to respond directly to the enquirer.`;

  return { subject, html, text };
}

/** Sends the lead notification. Returns true if the provider accepted it. Never throws. */
export async function sendLeadNotificationEmail(lead: LeadData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = parseRecipients(process.env.LEAD_NOTIFY_TO);
  const from = process.env.LEAD_FROM_EMAIL?.trim() || DEFAULT_FROM;

  if (!apiKey || to.length === 0) {
    console.error(
      `[Lead Email] NOT SENT — missing ${!apiKey ? "RESEND_API_KEY" : ""}${!apiKey && to.length === 0 ? " and " : ""}${
        to.length === 0 ? "LEAD_NOTIFY_TO" : ""
      }. Lead from ${lead.companyName} is stored but nobody was emailed.`
    );
    return false;
  }

  const { subject, html, text } = buildLeadEmail(lead);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(process.env.RESEND_API_URL || RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, reply_to: lead.email, subject, html, text }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[Lead Email] Provider rejected (${response.status}): ${detail.slice(0, 500)}`);
      return false;
    }

    console.log(`[Lead Email] Sent "${subject}" to ${to.length} recipient(s)`);
    return true;
  } catch (error) {
    console.error("[Lead Email] Send failed:", error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
