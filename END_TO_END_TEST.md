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
