# Client BI workbench activation

The existing /blueprint-bi-method-assessment.html URL serves the new client workbench with its original palette, typography, left input column, dashboard and Full review layout. The previous training bundle remains in git history.

## Required deployment settings

- DATABASE_URL: existing managed MySQL connection, configured with TLS using the provider's connection parameters.
- WORKBENCH_ORIGIN: exact HTTPS origin used by staff, e.g. https://www.minetrans.co.za (no trailing slash). Redirect the other domain to this canonical origin.
- WORKBENCH_SESSION_SECRET: at least 32 random characters; keep secret.
- WORKBENCH_DATA_KEY: base64 of 32 cryptographically random bytes. Keep a separate protected backup: losing it makes stored assessments unreadable. Do not rotate without migrating encrypted payloads.
- WORKBENCH_USERS_JSON: array of {"email":"assigned email","name":"Person name","passwordHash":"bcrypt hash","role":"advisor"}. Use role "insurer" for external contributors; omitted roles retain existing advisor behaviour. Provision individual accounts privately; no default accounts, passwords or public registration. Use bcrypt cost 12 or higher. Changing a hash invalidates existing sessions.

Run `node scripts/setup-workbench.mjs` once against the intended database before deployment. It creates three new tables without changing existing tables or data. Then build and restart the existing Node server. Static-only hosting cannot provide sign-in, saves, documents or PDFs.

Run the same migration again for this update: it adds the fourth table, workbench_access. Deploy the server/workbench/fonts directory and its licence with the server; PDF export embeds these fonts. Start the server from the repository root.

## Insurer contributions

After the administrator provisions a named insurer account, the MineTrans assessment owner saves the assessment and uses Insurer access to grant that email access. The insurer signs in at the same workbench URL and selects Open saved. Assigned contributors can read all assessment versions and evidence, edit fields, upload documents and save new draft versions; they cannot create new assessments, grant access or record advisor review. The owner can revoke access at any time. No invitation email is sent. Version actor and timestamp identify contributions; simultaneous edits are protected by the existing stale-version check. Revocation cannot recall previously downloaded material.

Outstanding items link to the relevant input editor. Guided fields include mining method suggestions, coverage and evidence status choices, dated confirmation fields, and financial/recovery source guidance. Upload guidance identifies useful source documents and requires manual reconciliation; no unverified automatic document extraction is performed.

No credentials are committed, and no client data is persisted in browser storage. The public page opens an illustrative benchmark; protected operations fail closed until configured. Users see only their own assessments and documents. JWT sessions expire after eight hours. Secure HttpOnly SameSite cookies are enabled in production. Mutation requests require the configured Origin. Version writes use transactions, row locks and optimistic version checks. Encrypted immutable version snapshots record the staff actor, timestamp and calculation-engine version. Documents are encrypted and private, restricted to PDF/image/plain-text up to 2 MB. No delete endpoint is exposed.

PDFs are generated from a saved version, never unsaved browser state. Recording an advisor review requires all confirmation groups, evidence references, scenario coverage, client details and review notes; any subsequent edit becomes an unsaved draft and the next ordinary save records draft status. This is an advisor record, not an electronic signature or insurer acceptance.

Recovery phases use day offsets for parallel activities. Linked external dependency durations are concurrent from the event date; sequential dependency delays belong in the phase schedule. Asset lead times are evidence, while explicit scenario phases drive downtime. ICOW budgets are conservative additions; the economic ceiling is shown separately, not represented as confirmed recoverability. Gross loss is before deductibles and sublimits. Unconfirmed coverage is included conservatively in the candidate exposure envelope, explicitly labelled provisional; excluded scenarios remain visible but do not drive insured recommendations. Currency changes relabel values, not convert them.

Before client use: configure staff credentials and secrets, run migration, verify database backups/TLS, and test login, save/reopen, evidence upload and PDF on the production host. Review model assumptions with the MineTrans advisor. The full 18-category underwriting questionnaire is a separate course component, not represented as completed by this BI tool.

## Insurer review controls (model 2.1)

Training input provenance persists after editing client names. Confirming client-reconciled inputs is an explicit advisor declaration, not independent verification. Advisor review also requires a financial reconciliation, valuation date, forecast and seasonality treatment, stock and savings treatment, credible-event scope, dependency review, contingency rationale, client confirmation identity/date, and a populated evidence register. These are narrative assessments; the engine does not automatically apply forecast growth, seasonality, stock offsets or saved insured expenses. Resolve material limitations before relying on the model.

Unknown policy values produce an unconfirmed gap, rather than implying zero existing insurance. Uploaded evidence hashes and filenames are derived from the stored document when saving; user-supplied hashes for external references are rejected. The PDF contains a per-scenario calculation trail and the greatest economic exposure including excluded scenarios. Draft reports with missing data display an incomplete notice. Monetary outputs are rounded for display only.

Historical PDFs retain their original saved engine output. Opening a historic version recalculates the interactive screen using the current engine and explicitly warns if versions differ; save a new assessment version to adopt the new calculations. The saved historical PDF is the authoritative snapshot.


## Interim Google Sheets storage

Set `WORKBENCH_STORAGE=sheets` to use Sheets instead of MySQL. MySQL remains the
unchanged default; this switch does not migrate any existing database records.
The frontend layout and API contracts are unchanged.

Required Railway production variables:

- `WORKBENCH_STORAGE=sheets`
- `WORKBENCH_SHEETS_ID=17GvxSjTCNGq2wsOd1-pJ7E3InfIkTOPiLchHoCwobog`
- `GOOGLE_SHEETS_CREDENTIALS`: existing server-only service-account JSON. That
  account needs editor access to the workbook. Never expose it to the browser.
- `WORKBENCH_ORIGIN=https://www.minetrans.co.za`
- `WORKBENCH_SESSION_SECRET`, `WORKBENCH_DATA_KEY`, `WORKBENCH_USERS_JSON`: same
  secure session key, AES-256 key, and named bcrypt accounts described above.
  Sheets mode does not require `DATABASE_URL`.

Run `node scripts/setup-workbench-sheets.mjs` in the server environment to create
or verify **BI Web Records**. Setup does not alter the manual assessment tabs,
leads, blog, or any existing records. Never run the MySQL setup script for Sheets.
The BI Web Records tab has been prepared in the MineTrans workbook; setting
Railway variables and provisioning accounts is still required for activation.

### What is saved

The website stores encrypted assessment snapshots (including the exact model
results and report text), actor/time/version metadata, access changes, and uploaded
evidence in BI Web Records. Both the index and payload are encrypted. Files stay
behind the workbench's authenticated download endpoint; they are not public Drive
links. The existing 2 MB per file and 50 files per assessment limits still apply.
Payloads are split into cells of at most 40,000 characters and written in a single
RAW append. No editable user text is interpreted as a spreadsheet formula.

The manual BI Assessments/Costs/Scenarios/Schedule/ICOW/Evidence/Actions tabs are a
separate interim workflow. There is no two-way import, automatic reconciliation,
or automatic document extraction between those tabs and website snapshots.

### Concurrency and recovery

Rows form an append-only application event log. Replay in physical row order
accepts a save only when its expected version matches the latest accepted version.
If two servers append against the same version, only the first matching event is
accepted. Later conflicts stay in the log but do not become saved versions; the
API returns 409. Access revocations and the 50-document limit are checked again
when replaying. Each write is read back before success is returned. Ambiguous
network timeouts are checked by event UUID; the application never blindly retries
an append. If confirmation fails, reopen the assessment before retrying.

This is an interim, low-volume backend, bounded to 5,000 events (including rejected
conflicts) and 200 visible assessments. Read/write quotas can temporarily prevent
saving, especially with many concurrent users or large evidence files. The app
fails closed and does not report unconfirmed writes as successful. Arrange migration
before these limits. Batch requests reduce reads when listing assessments or
verifying several evidence references.

Do not edit, reorder, delete or insert rows in BI Web Records. Warning protection
is an editing reminder, **not** a security boundary. Spreadsheet owners/editors can
damage or roll back the log; encryption detects altered ciphertext but cannot prove
that rows were never deleted or reordered. This is **not** an immutable regulatory
audit archive. Retain restricted workbook version history and backups plus a secure
backup of WORKBENCH_DATA_KEY; losing/replacing the key makes old data unreadable.
Do not share this multipurpose workbook with insurers: give named workbench access
only. Do not switch backends after collecting data without an explicit migration.

### Verification and activation

- `node --test server/workbench/sheets-store.test.mjs`
- `pnpm exec vitest run server/workbench/routes.test.ts server/workbench/sheets-routes.test.ts`
- `pnpm check` and `pnpm build` in a complete checkout.

Tests use an in-memory Sheets API double; they verify concurrent version conflicts,
timeout recovery, access revocation, encrypted payload integrity, document limits,
and the HTTP save/reopen/upload/PDF lifecycle. They do not establish live Railway
credentials or Google permissions. After deployment, use a clearly labeled test
assessment to verify sign-in, save/reopen, evidence download, assigned insurer
contribution/revocation, and PDF export before using real mine data.
