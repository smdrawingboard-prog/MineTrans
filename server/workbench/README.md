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
