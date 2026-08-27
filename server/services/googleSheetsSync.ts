import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";
import * as certDb from "./certificationDb";

/**
 * Google Sheets integration for syncing student data
 * Requires GOOGLE_SHEETS_CREDENTIALS and GOOGLE_SHEETS_ID env variables
 */

interface GoogleSheetsConfig {
  spreadsheetId: string;
  credentials: {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
  };
}

let sheetsClient: any = null;
let leadsSheetsClient: sheets_v4.Sheets | null = null;

const LEADS_RANGE = "Leads!A:Q";
const SHEETS_REQUEST_TIMEOUT_MS = 10_000;

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
  token_uri?: string;
  type?: string;
}

export interface BIReviewLead {
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

function parseServiceAccountCredentials(rawCredentials: string): ServiceAccountCredentials {
  let parsed: Partial<ServiceAccountCredentials>;

  try {
    parsed = JSON.parse(rawCredentials) as Partial<ServiceAccountCredentials>;
  } catch {
    throw new Error("GOOGLE_SHEETS_CREDENTIALS is not valid JSON");
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("GOOGLE_SHEETS_CREDENTIALS is missing client_email or private_key");
  }

  return {
    ...parsed,
    client_email: parsed.client_email,
    // JSON.parse normally expands escaped newlines. This also handles
    // platforms that preserve the literal sequence in a multiline key.
    private_key: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

function getLeadsSheetsClient(): sheets_v4.Sheets | null {
  if (leadsSheetsClient) return leadsSheetsClient;

  const rawCredentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!rawCredentials) {
    console.error("[Google Sheets] GOOGLE_SHEETS_CREDENTIALS is not configured");
    return null;
  }

  try {
    const credentials = parseServiceAccountCredentials(rawCredentials);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    leadsSheetsClient = google.sheets({ version: "v4", auth });
    return leadsSheetsClient;
  } catch {
    // Do not log the raw credentials or the underlying parser/auth object.
    console.error("[Google Sheets] Service-account credentials could not be initialized");
    return null;
  }
}

function getGoogleApiStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;

  const candidate = error as {
    code?: string | number;
    response?: { status?: number };
  };

  if (typeof candidate.response?.status === "number") {
    return candidate.response.status;
  }

  const numericCode = Number(candidate.code);
  return Number.isFinite(numericCode) ? numericCode : undefined;
}

function getGoogleApiCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" || typeof code === "number" ? String(code) : undefined;
}

function toLeadRow(lead: BIReviewLead): string[] {
  const row = [
    lead.submittedAt,
    lead.companyName,
    lead.contactName,
    lead.email,
    lead.phone,
    lead.position,
    lead.miningSector,
    lead.riskArea,
    lead.siteLocation,
    lead.annualTurnover,
    lead.biSumInsured,
    lead.indemnityPeriod,
    lead.keyFacility,
    lead.previousClaims,
    lead.currentInsurer,
    lead.siteVisitAvailability,
    lead.message,
  ].map((value) => String(value ?? ""));

  if (row.length !== 17) {
    throw new Error("BI Review row must contain exactly 17 values");
  }

  return row;
}

/**
 * Appends one BI Review submission to Leads!A:Q.
 *
 * This function intentionally performs a single append attempt. Retrying an
 * append after an ambiguous network timeout can create duplicate lead rows.
 * The caller receives false and may present a safe retry message instead.
 */
export async function appendBIReviewLead(lead: BIReviewLead): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_BI_REVIEW_ID;
  const client = getLeadsSheetsClient();

  if (!spreadsheetId) {
    console.error("[Google Sheets] GOOGLE_SHEETS_BI_REVIEW_ID is not configured");
    return false;
  }

  if (!client) return false;

  try {
    const response = await client.spreadsheets.values.append(
      {
        spreadsheetId,
        range: LEADS_RANGE,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          majorDimension: "ROWS",
          values: [toLeadRow(lead)],
        },
      },
      {
        timeout: SHEETS_REQUEST_TIMEOUT_MS,
      }
    );

    const updatedRows = response.data.updates?.updatedRows ?? 0;
    if (updatedRows !== 1) {
      console.error("[Google Sheets] Append completed without confirming one inserted row", {
        updatedRows,
      });
      return false;
    }

    console.info("[Google Sheets] BI Review lead stored", {
      updatedRows,
      updatedRange: response.data.updates?.updatedRange,
    });
    return true;
  } catch (error) {
    // Log operational metadata only. Never log the lead, private key, access
    // token, request headers, or full Google API error response.
    console.error("[Google Sheets] BI Review append failed", {
      status: getGoogleApiStatus(error),
      code: getGoogleApiCode(error),
      timeoutMs: SHEETS_REQUEST_TIMEOUT_MS,
    });
    return false;
  }
}

/**
 * Initialize Google Sheets client with credentials
 */
export async function initializeGoogleSheets(config: GoogleSheetsConfig) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: config.credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    sheetsClient = google.sheets({ version: "v4", auth });
    console.log("[Google Sheets] Initialized successfully");
    return true;
  } catch (error) {
    console.error("[Google Sheets] Initialization failed:", error);
    return false;
  }
}

/**
 * Create or update a sheet with student data
 */
export async function syncStudentDataToSheets(spreadsheetId: string, sheetName: string = "Students") {
  if (!sheetsClient) {
    console.error("[Google Sheets] Client not initialized");
    return false;
  }

  try {
    // Get all students
    const students = await certDb.getAllStudents();

    // Prepare data for sheets
    const headers = ["ID", "Name", "Email", "Status", "Enrolled Date", "Completed Date"];
    const rows = students.map((s) => [
      s.id,
      s.name,
      s.email,
      s.status,
      new Date(s.enrolledAt).toLocaleDateString(),
      s.completedAt ? new Date(s.completedAt).toLocaleDateString() : "",
    ]);

    // Clear existing data
    await sheetsClient.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`,
    });

    // Write headers and data
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers, ...rows],
      },
    });

    console.log(`[Google Sheets] Synced ${students.length} students to sheet "${sheetName}"`);
    return true;
  } catch (error) {
    console.error("[Google Sheets] Sync failed:", error);
    return false;
  }
}

/**
 * Sync student progress data to a separate sheet
 */
export async function syncProgressDataToSheets(spreadsheetId: string, sheetName: string = "Progress") {
  if (!sheetsClient) {
    console.error("[Google Sheets] Client not initialized");
    return false;
  }

  try {
    const students = await certDb.getAllStudents();
    const courses = await certDb.getAllCourses();

    // Prepare data for sheets
    const headers = [
      "Student Name",
      "Email",
      ...courses.map((c) => `${c.title} (%)`.substring(0, 30)), // Limit header length
    ];

    const rows = await Promise.all(
      students.map(async (s) => {
        const progressData: (string | number)[] = [s.name, s.email];

        for (const course of courses) {
          const progress = await certDb.getStudentCourseProgress(s.id, course.id);
          const percentage = progress && progress.progress && progress.progress.length > 0
            ? Math.round((progress.progress.filter((p) => p.completed).length / progress.progress.length) * 100)
            : 0;
          progressData.push(String(percentage));
        }

        return progressData;
      })
    );

    // Clear existing data
    await sheetsClient.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`,
    });

    // Write headers and data
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers, ...rows],
      },
    });

    console.log(`[Google Sheets] Synced progress data for ${students.length} students`);
    return true;
  } catch (error) {
    console.error("[Google Sheets] Progress sync failed:", error);
    return false;
  }
}

/**
 * Sync quiz attempt data to a separate sheet
 */
export async function syncQuizAttemptsToSheets(spreadsheetId: string, sheetName: string = "Quiz Attempts") {
  if (!sheetsClient) {
    console.error("[Google Sheets] Client not initialized");
    return false;
  }

  try {
    // Note: This would require a method to get all quiz attempts from the database
    // For now, we'll create a template sheet

    const headers = [
      "Student Name",
      "Quiz ID",
      "Score",
      "Total Points",
      "Percentage",
      "Passed",
      "Attempt Date",
    ];

    // Clear existing data
    await sheetsClient.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`,
    });

    // Write headers
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers],
      },
    });

    console.log(`[Google Sheets] Created quiz attempts sheet`);
    return true;
  } catch (error) {
    console.error("[Google Sheets] Quiz attempts sheet creation failed:", error);
    return false;
  }
}

/**
 * Create a new spreadsheet for certification data
 */
export async function createCertificationSpreadsheet(title: string) {
  if (!sheetsClient) {
    console.error("[Google Sheets] Client not initialized");
    return null;
  }

  try {
    const response = await sheetsClient.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
        sheets: [
          { properties: { title: "Students" } },
          { properties: { title: "Progress" } },
          { properties: { title: "Quiz Attempts" } },
          { properties: { title: "Certificates" } },
        ],
      },
    });

    const spreadsheetId = response.data.spreadsheetId;
    console.log(`[Google Sheets] Created spreadsheet: ${spreadsheetId}`);

    // Sync initial data
    await syncStudentDataToSheets(spreadsheetId, "Students");
    await syncProgressDataToSheets(spreadsheetId, "Progress");
    await syncQuizAttemptsToSheets(spreadsheetId, "Quiz Attempts");

    return spreadsheetId;
  } catch (error) {
    console.error("[Google Sheets] Spreadsheet creation failed:", error);
    return null;
  }
}
