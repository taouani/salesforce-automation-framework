# End-to-End Test Walkthrough

This document describes the canonical command sequence for taking the
framework from a clone to a generated, type-checking, Playwright-listable
test project. It's the smoke test we run when verifying a new build.

## Prerequisites

- Node.js v18+
- A Salesforce metadata directory (an SFDX `force-app` tree, or anything
  that looks like one).
- _(Optional, for `--org` enrichment)_ The Salesforce CLI (`sf`) with at
  least one authed org.

## 1. Build the framework

```bash
git clone <this repo>
cd salesforce-automation-framework
npm install
npm run build
```

## 2. Initialize a config

In the directory where you'll keep your generated project — or directly
inside the framework repo for a smoke run:

```bash
node ./dist/cli/index.js init
```

This writes `sf-scanner.config.json`. Edit:

- `metadataPath` — point at your Salesforce metadata directory.
- `generatedDir` — where the Playwright project should be emitted.
- `authApproach` — `helpers` / `configuredConnection` / `both`.

## 3. Run the full pipeline

```bash
# File-only mode
node ./dist/cli/index.js build

# With live-org enrichment (picklist values, accurate field labels,
# nillable -> required for standard fields)
sf org login web --alias my-sandbox --instance-url https://test.salesforce.com
node ./dist/cli/index.js build --org my-sandbox
```

The build runs in this order: `scan → parse-xml → parse-lwc → parse-apex →
parse-flow → parse-aura → (optional --org enrichment) → generate (skeleton)
→ generate-page-objects → generate-tests`.

## 4. Verify the generated project

```bash
cd <generatedDir>
npm install
npx tsc --noEmit                     # generated project should type-check
npx playwright test --list           # Playwright should enumerate tests
```

A clean run looks like:

```
Total: <N> tests in <M> files
```

## 5. Run a subset against a sandbox

```bash
# Set up credentials in .env (one of):
#   SALESFORCE_USERNAME=...
#   SALESFORCE_PASSWORD=...
#   SALESFORCE_SECURITY_TOKEN=...
# OR (for configuredConnection mode):
#   SALESFORCE_ACCESS_TOKEN=...
#   SALESFORCE_INSTANCE_URL=...
# OR (for permission tests, per profile):
#   SF_USER_<PROFILE>=...
#   SF_PASS_<PROFILE>=...
# Plus:
#   SF_ORG_URL=https://<your-instance>.salesforce.com

cp .env.example .env
$EDITOR .env

npx playwright install               # one-time browser download
npx playwright test --grep '@Account'
```

## Hand-edit + regen workflow

Every generated test ships with `// <SF-SCANNER:USER-CODE id="...">` blocks
where you can add custom logic. The framework preserves whatever's between
the markers across regenerations:

```ts
test.describe('Account Tests', () => {
  // <SF-SCANNER:USER-CODE id="describe-setup">
  test.beforeAll(async ({ page }) => {
    await loginAs('System Administrator', page);  // your custom setup
  });
  // </SF-SCANNER:USER-CODE>

  test('should create Account record @crud @Account', async ({ page, testData }) => {
    /* ...generated body... */
    // <SF-SCANNER:USER-CODE id="test-create-account-extra">
    await expect(page.getByText('Custom Cleanup Marker')).toBeVisible();
    // </SF-SCANNER:USER-CODE>
  });
});
```

Run `node ./dist/cli/index.js build` again — the `loginAs(...)` and the
extra `expect(...)` will survive. Pass `--force` to wipe everything and
regenerate clean.

## Live verification record (2026-04-29)

We bootstrapped a Lightning session against the `test-automation` alias
via `sf` CLI + a `secur/frontdoor.jsp?sid=...&retURL=/lightning/o/Account/new`
URL, then drove the page with a Playwright MCP browser. Findings:

| Phase | Promise | Live evidence |
| --- | --- | --- |
| C | Required-field regex `/Complete this field\|This field is required\|You must enter a value/i` matches | Form rendered `"Complete this field."` verbatim under `*Client Name` |
| C | `fieldErrorMessage()` selector (`.slds-form-element__has-error`, `[role="alert"]`) | Red error icon + matching slds class on the field |
| D | Describe enrichment: org renamed Account → Client | Modal title was `New Client: Business Account` |
| D | `nillable=false && createable=true → required=true` | `*Account Currency` rendered with the asterisk despite XML not flagging it as required |
| C | Picklist test pattern: open the combobox, assert option labels via `page.getByRole('option', { name: /^X$/ })` | Industry combobox opened to a `[role="option"]` listbox of real values (Agriculture, Apparel, Banking, …) |

### Person Account variant (re-verified the same day)

Repeated the run against the same sandbox with the Person Account record
type preselected via
`?recordTypeId=<id>&useRecordTypeCheck=1` (record-type IDs are queried
through the same `sf` session via REST: `SELECT Id, Name, IsPersonType
FROM RecordType WHERE SObjectType='Account'`). Findings:

- The modal title flipped to `"New Client: Person Account"` — the
  framework's URL pattern works for record-type-driven layouts.
- The form is a totally different page-layout assignment: `*Client Name`
  is now a composite field split into Salutation / First Name /
  `*Last Name`, and the layout exposes Person-Account-specific fields
  (Diorometer, Segment, Waist Measurement Gender/Unit, Expected Category
  1/2/3, Main Boutique, Preferred Store 2/3, …).
- **Required-field assertion still matches:** `*Last Name` rendered the
  same `"Complete this field."` text under the field after Save was
  clicked. The Phase C regex still hits.
- **Page-level toast:** Salesforce additionally rendered a
  `"We hit a snag." / "Review the following fields"` summary listing
  `Client Name` and `Travel Documents`. The latter wasn't even on the
  visible form — a second case of the describe-vs-layout gap (Travel
  Documents must be on a different section/layout that wasn't rendered
  here). Phase C tests don't depend on this toast text; they assert the
  inline error directly under the field, which is locale-stable.
- **Default picklist values were observable:** the Segment combobox
  rendered `"Prospect"` instead of `"--None--"`. Phase D's
  `defaultValue: true` flag in the enriched picklist payload would let
  generators recognize that pre-fill state in future iterations.

### Known limitation: describe vs. page layout

Surfaced by both record-type runs:

- `AccountSource` is in the describe payload (14 active values) but
  isn't on this org's create-page layout for either Business Account or
  Person Account. Picklist tests for fields off the create form will
  fail.
- Conversely, `Travel Documents` is required on Person Account per the
  page-level toast, but doesn't appear in the rendered form layout for a
  fresh-create flow. Required-field tests for fields off the visible
  layout would never see the inline error and would time out.

Mitigations available today:

- Adjust the org's page layout to expose the field, or
- Edit the test inside its `// <SF-SCANNER:USER-CODE>` block to navigate
  to a layout that does expose the field before asserting.

Future work: parse FlexiPages / standard page layouts and intersect with
the describe field set so the framework only emits picklist /
required-field tests for fields actually rendered on the create form
(or routes them through an explicit "different layout" preamble).

## Troubleshooting

**`'sf' CLI not found on PATH`** — `--org` enrichment needs the Salesforce
CLI. Either install it or drop `--org` from the build call to fall back to
file-only mode.

**`Could not parse sf org display output as JSON`** — usually means the org
auth has expired. Re-run `sf org login web --alias <alias> --instance-url
<url>`.

**Generated project fails to compile in your real org** — the parsed
metadata's `fullName` may include `.object-meta.xml` or other XML-file
suffixes for some objects (a known parser quirk). The `--org` enrichment
filters those automatically; for file-only runs, you may need to clean
those entries out by hand.

**Vitest doesn't start in a corporate sandbox** — esbuild's `Cannot read
directory "../.."` error means the sandbox can't read the parent of the
project. Run TypeScript compile (`npm run type-check`) for verification
instead until you can lift the sandbox.

**Playwright browser download blocked** — corporate networks often block
the Chrome-for-Testing download. Pre-install Chromium via your IT-approved
channel and point `PLAYWRIGHT_BROWSERS_PATH` at it.
