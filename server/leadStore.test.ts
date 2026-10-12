import { describe, expect, it, vi, beforeEach } from "vitest";

const getDb = vi.fn();
const appendBIReviewLead = vi.fn();
vi.mock("./db", () => ({ getDb: () => getDb() }));
vi.mock("./services/googleSheetsSync", () => ({
  appendBIReviewLead: (l: unknown) => appendBIReviewLead(l),
  appendBIMethodologyLead: vi.fn(),
}));

import { saveLead, syncLeadToSheets } from "./services/leadStore";

describe("leadStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null (so callers fall back to Sheets) when no database is configured", async () => {
    getDb.mockResolvedValue(null);
    const id = await saveLead("bi-review", { companyName: "A", contactName: "B", email: "a@b.co" }, {});
    expect(id).toBeNull();
  });

  it("saves to the database and returns the insert id", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    const values = vi.fn().mockResolvedValue([{ insertId: 7 }]);
    getDb.mockResolvedValue({ execute, insert: () => ({ values }) });
    const id = await saveLead("bi-review", { companyName: "A", contactName: "B", email: "a@b.co" }, { x: 1 });
    expect(id).toBe(7);
    expect(values.mock.calls[0][0]).toMatchObject({ source: "bi-review", email: "a@b.co" });
  });

  it("reports a Sheets failure without throwing and records the attempt", async () => {
    appendBIReviewLead.mockResolvedValue(false);
    const where = vi.fn().mockResolvedValue(undefined);
    const set = vi.fn(() => ({ where }));
    getDb.mockResolvedValue({ update: () => ({ set }) });
    const ok = await syncLeadToSheets(7, "bi-review", {});
    expect(ok).toBe(false);
    expect(set.mock.calls[0][0]).toMatchObject({ sheetsSynced: "false" });
  });
});
