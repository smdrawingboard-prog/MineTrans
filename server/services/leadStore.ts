import { and, eq, lt, sql } from "drizzle-orm";
import { leads } from "../../drizzle/schema";
import { getDb } from "../db";
import {
  appendBIMethodologyLead,
  appendBIReviewLead,
  type BIMethodologyLead,
  type BIReviewLead,
} from "./googleSheetsSync";

export type LeadSource = "bi-review" | "bi-methodology";

const MAX_SHEETS_ATTEMPTS = 10;
let tableReady: Promise<boolean> | null = null;

/**
 * Migrations are not run on deploy, so create the table on first use.
 * Mirrors the generated drizzle migration; safe to run repeatedly.
 */
function ensureLeadsTable(): Promise<boolean> {
  if (!tableReady) {
    tableReady = (async () => {
      const db = await getDb();
      if (!db) {
        tableReady = null; // database not available yet; check again next time
        return false;
      }
      try {
        await db.execute(sql`CREATE TABLE IF NOT EXISTS \`leads\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`source\` varchar(40) NOT NULL,
          \`companyName\` varchar(255) NOT NULL,
          \`contactName\` varchar(255) NOT NULL,
          \`email\` varchar(320) NOT NULL,
          \`phone\` varchar(60),
          \`payload\` text NOT NULL,
          \`sheetsSynced\` enum('true','false') NOT NULL DEFAULT 'false',
          \`sheetsAttempts\` int NOT NULL DEFAULT 0,
          \`createdAt\` timestamp NOT NULL DEFAULT (now()),
          CONSTRAINT \`leads_id\` PRIMARY KEY(\`id\`)
        )`);
        return true;
      } catch (error) {
        console.error("[Leads] Could not ensure leads table:", error);
        tableReady = null; // allow a retry on the next lead
        return false;
      }
    })();
  }
  return tableReady;
}

/** Saves the durable copy. Returns the row id, or null if the database is unavailable. */
export async function saveLead(
  source: LeadSource,
  lead: { companyName: string; contactName: string; email: string; phone?: string },
  fullPayload: unknown
): Promise<number | null> {
  try {
    if (!(await ensureLeadsTable())) return null;
    const db = await getDb();
    if (!db) return null;
    const [result] = await db.insert(leads).values({
      source,
      companyName: lead.companyName.slice(0, 255),
      contactName: lead.contactName.slice(0, 255),
      email: lead.email.slice(0, 320),
      phone: lead.phone ? lead.phone.slice(0, 60) : null,
      payload: JSON.stringify(fullPayload),
    });
    return Number((result as { insertId: number }).insertId);
  } catch (error) {
    console.error("[Leads] Failed to save lead to database:", error);
    return null;
  }
}

async function pushToSheets(source: LeadSource, payload: unknown): Promise<boolean> {
  return source === "bi-review"
    ? appendBIReviewLead(payload as BIReviewLead)
    : appendBIMethodologyLead(payload as BIMethodologyLead);
}

/** Mirrors a saved lead to Google Sheets and records the outcome. */
export async function syncLeadToSheets(
  id: number | null,
  source: LeadSource,
  payload: unknown
): Promise<boolean> {
  const ok = await pushToSheets(source, payload);
  if (id === null) return ok; // no database row to update
  const db = await getDb();
  if (db) {
    try {
      await db
        .update(leads)
        .set({
          sheetsSynced: ok ? "true" : "false",
          sheetsAttempts: sql`${leads.sheetsAttempts} + 1`,
        })
        .where(eq(leads.id, id));
    } catch (error) {
      console.error("[Leads] Failed to record Sheets sync state:", error);
    }
  }
  return ok;
}

/** Retries leads whose Sheets write failed. Returns how many were synced. */
export async function retryUnsyncedLeads(limit = 20): Promise<number> {
  if (!(await ensureLeadsTable())) return 0;
  const db = await getDb();
  if (!db) return 0;
  const pending = await db
    .select()
    .from(leads)
    .where(and(eq(leads.sheetsSynced, "false"), lt(leads.sheetsAttempts, MAX_SHEETS_ATTEMPTS)))
    .limit(limit);
  let synced = 0;
  for (const row of pending) {
    try {
      const ok = await syncLeadToSheets(row.id, row.source as LeadSource, JSON.parse(row.payload));
      if (ok) synced++;
    } catch (error) {
      console.error("[Leads] Retry failed for lead", row.id, error);
    }
  }
  return synced;
}
