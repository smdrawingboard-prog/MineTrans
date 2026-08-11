import { google } from "googleapis";
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
let leadsSheetsClient: any = null;

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

/**
 * Lazily builds a Sheets client from GOOGLE_SHEETS_CREDENTIALS (a service
 * account JSON string), independent of the admin-triggered sync client
 * above, so public lead submissions can log to Sheets without an admin
 * having called initializeGoogleSheets first.
 */
function getLeadsSheetsClient() {
  if (leadsSheetsClient) return leadsSheetsClient;

  const rawCredentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!rawCredentials) return null;

  try {
    const credentials = JSON.parse(rawCredentials);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    leadsSheetsClient = google.sheets({ version: "v4", auth });
    return leadsSheetsClient;
  } catch (error) {
    console.error("[Google Sheets] Failed to initialize leads client:", error);
    return null;
  }
}

/**
 * Append a BI Review lead submission as a new row.
 * Requires GOOGLE_SHEETS_CREDENTIALS and GOOGLE_SHEETS_BI_REVIEW_ID env vars;
 * returns false (without throwing) if either is missing or the call fails,
 * so this is safe to call as a best-effort side-channel to email delivery.
 */
export async function appendBIReviewLead(lead: BIReviewLead): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_BI_REVIEW_ID;
  const client = getLeadsSheetsClient();

  if (!client || !spreadsheetId) {
    console.warn(
      "[Google Sheets] BI Review sync not configured (set GOOGLE_SHEETS_CREDENTIALS and GOOGLE_SHEETS_BI_REVIEW_ID to enable)"
    );
    return false;
  }

  try {
    await client.spreadsheets.values.append({
      spreadsheetId,
      range: "Leads!A:Q",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
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
          ],
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("[Google Sheets] Failed to append BI review lead:", error);
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
export async function syncStudentDataToSheets(
  spreadsheetId: string,
  sheetName: string = "Students"
) {
  if (!sheetsClient) {
    console.error("[Google Sheets] Client not initialized");
    return false;
  }

  try {
    // Get all students
    const students = await certDb.getAllStudents();

    // Prepare data for sheets
    const headers = [
      "ID",
      "Name",
      "Email",
      "Status",
      "Enrolled Date",
      "Completed Date",
    ];
    const rows = students.map(s => [
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

    console.log(
      `[Google Sheets] Synced ${students.length} students to sheet "${sheetName}"`
    );
    return true;
  } catch (error) {
    console.error("[Google Sheets] Sync failed:", error);
    return false;
  }
}

/**
 * Sync student progress data to a separate sheet
 */
export async function syncProgressDataToSheets(
  spreadsheetId: string,
  sheetName: string = "Progress"
) {
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
      ...courses.map(c => `${c.title} (%)`.substring(0, 30)), // Limit header length
    ];

    const rows = await Promise.all(
      students.map(async s => {
        const progressData: (string | number)[] = [s.name, s.email];

        for (const course of courses) {
          const progress = await certDb.getStudentCourseProgress(
            s.id,
            course.id
          );
          const percentage =
            progress && progress.progress && progress.progress.length > 0
              ? Math.round(
                  (progress.progress.filter(p => p.completed).length /
                    progress.progress.length) *
                    100
                )
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

    console.log(
      `[Google Sheets] Synced progress data for ${students.length} students`
    );
    return true;
  } catch (error) {
    console.error("[Google Sheets] Progress sync failed:", error);
    return false;
  }
}

/**
 * Sync quiz attempt data to a separate sheet
 */
export async function syncQuizAttemptsToSheets(
  spreadsheetId: string,
  sheetName: string = "Quiz Attempts"
) {
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
    console.error(
      "[Google Sheets] Quiz attempts sheet creation failed:",
      error
    );
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
