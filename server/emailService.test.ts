import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { buildLeadEmail, sendLeadNotificationEmail, type LeadData } from "./services/emailService";

const lead: LeadData = {
  companyName: "Acme <Platinum> Mine",
  contactName: "Thandi Nkosi",
  email: "thandi@acme.example",
  phone: "+27 82 123 4567",
  position: "Finance",
  miningSector: "PGMs",
  riskArea: "BI",
  siteLocation: "Rustenburg",
  annualTurnover: "R2bn",
  biSumInsured: "R500m",
  indemnityPeriod: "18 months",
  keyFacility: "Primary mill",
  previousClaims: "",
  currentInsurer: "",
  siteVisitAvailability: "Next week",
  message: "Please call",
  submittedAt: "2026-10-20T10:00:00.000Z",
};

let server: Server;
let status = 200;
let received: { auth?: string; body?: any }[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      received.push({ auth: req.headers.authorization, body: JSON.parse(raw) });
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(status === 200 ? { id: "test" } : { message: "bad" }));
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  process.env.RESEND_API_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}/emails`;
});

afterAll(() => server.close());

beforeEach(() => {
  received = [];
  status = 200;
  process.env.RESEND_API_KEY = "re_test";
  process.env.LEAD_NOTIFY_TO = "roger@minetrans.co.za, jp@minetrans.co.za";
  delete process.env.LEAD_FROM_EMAIL;
});

describe("lead notification email", () => {
  it("sends to every configured recipient with reply-to set to the enquirer", async () => {
    expect(await sendLeadNotificationEmail(lead)).toBe(true);
    expect(received).toHaveLength(1);
    const { auth, body } = received[0];
    expect(auth).toBe("Bearer re_test");
    expect(body.to).toEqual(["roger@minetrans.co.za", "jp@minetrans.co.za"]);
    expect(body.from).toBe("MineTrans Website <leads@minetrans.co.za>");
    expect(body.reply_to).toBe("thandi@acme.example");
    expect(body.subject).toContain("BI Review request");
    expect(body.text).toContain("Business Interruption");
  });

  it("escapes HTML from form input", () => {
    const { html } = buildLeadEmail(lead);
    expect(html).toContain("Acme &lt;Platinum&gt; Mine");
    expect(html).not.toContain("<Platinum>");
  });

  it("labels BI Methodology page enquiries", () => {
    const { subject } = buildLeadEmail({ ...lead, message: "[BI Methodology page enquiry] hi" });
    expect(subject).toContain("BI Methodology enquiry");
  });

  it("returns false instead of throwing when the provider rejects", async () => {
    status = 422;
    await expect(sendLeadNotificationEmail(lead)).resolves.toBe(false);
  });

  it("returns false and sends nothing when LEAD_NOTIFY_TO is empty or has no valid address", async () => {
    process.env.LEAD_NOTIFY_TO = "";
    await expect(sendLeadNotificationEmail(lead)).resolves.toBe(false);
    process.env.LEAD_NOTIFY_TO = " , not-an-email ";
    await expect(sendLeadNotificationEmail(lead)).resolves.toBe(false);
    delete process.env.LEAD_NOTIFY_TO;
    await expect(sendLeadNotificationEmail(lead)).resolves.toBe(false);
    expect(received).toHaveLength(0);
  });

  it("omits empty optional fields and handles an empty message", () => {
    const { text } = buildLeadEmail({ ...lead, message: "", previousClaims: "", currentInsurer: "" });
    expect(text).not.toContain("Message:");
    expect(text).not.toContain("Previous BI claims:");
    expect(text).toContain("Company: Acme <Platinum> Mine");
  });

  it("returns false instead of throwing on a provider server error (500)", async () => {
    status = 500;
    await expect(sendLeadNotificationEmail(lead)).resolves.toBe(false);
  });

  it("returns false and sends nothing when not configured", async () => {
    delete process.env.RESEND_API_KEY;
    await expect(sendLeadNotificationEmail(lead)).resolves.toBe(false);
    expect(received).toHaveLength(0);
  });
});
