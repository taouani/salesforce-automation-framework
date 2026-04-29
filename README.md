# Salesforce Test Automation Framework

A Node.js + TypeScript CLI (`sf-scanner`) that ingests a Salesforce metadata
repository and emits a standalone Playwright + TypeScript test project — page
objects, test specs, REST-API-backed test-data factories, fixtures, and
runtime helpers — all driven by a single `sf-scanner.config.json`.

The framework runs as a code generator: it does not execute Salesforce or
Playwright itself; it produces a sibling project that you `npm install` and
run yourself.

## What it generates

For every parsed object, component, flow, and profile, the generator emits
runnable Playwright tests:

- **CRUD** — create / read / update / delete via the Lightning UI, with
  REST-API-backed test data setup and teardown.
- **Field validation** — required-field, format (Email/Phone/URL), length,
  and picklist-restriction tests with real assertions on Salesforce's
  inline error patterns.
- **Validation rules** — UI-only negative tests that assert the rule's
  parsed `errorMessage`. The rule-tripping field-fills go in a
  `// <SF-SCANNER:USER-CODE>` block that survives regeneration.
- **Record types** — visibility and field-availability checks per record
  type.
- **Relationships** — master-detail / lookup navigation tests.
- **Component tests** — per-LWC and per-Aura component scaffolding.
- **Flow tests** — screen navigation that fills declared fields by label,
  with per-screen and flow-launch USER-CODE blocks.
- **Permission tests** — one spec per profile in
  `tests/Permissions/<profile>/`. Each test calls `loginAs(profile, page)`
  and asserts object visibility / field-level security against the
  profile's declared `objectPermissions`.

Tests are tagged (`@crud`, `@field-validation`, `@flow:<name>`,
`@profile:<name>`, `@<ObjectName>`) so you can filter via
`npx playwright test --grep`.

## Prerequisites

- Node.js v18+
- For optional live-org enrichment (`--org`): the
  [Salesforce CLI (`sf`)](https://developer.salesforce.com/tools/salesforcecli)
  with at least one authed org.

## Quick start

```bash
# In the framework repo
npm install
npm run build

# In the directory where your Salesforce metadata lives
npx sf-scanner init        # writes a starter sf-scanner.config.json
# edit metadataPath / generatedDir / authApproach if needed
npx sf-scanner build       # full pipeline: scan -> parse -> generate
```

## Configuration

`sf-scanner build` is driven by a `sf-scanner.config.json` — `init` writes a
starter file, the loader walks upward from cwd to find one, and CLI flags
override config values. See `sf-scanner.config.example.json`. Recognized
keys:

| key                | default                | meaning                                                   |
| ------------------ | ---------------------- | --------------------------------------------------------- |
| `metadataPath`     | required               | Path to the Salesforce metadata directory.                |
| `parsedResultsDir` | `./parsed-results`     | Where parsed JSON artifacts are written.                  |
| `generatedDir`     | `./generated`          | Where the Playwright project is emitted.                  |
| `projectName`      | `salesforce-tests`     | Name placed in the generated project's `package.json`.    |
| `authApproach`     | `both`                 | `helpers` (username/password) / `configuredConnection` (env-supplied access token) / `both`. |
| `includeFixtures`  | `true`                 | Whether `generate-tests` emits Playwright fixtures.       |
| `includeTestData`  | `true`                 | Whether `generate-tests` emits test-data factories.       |
| `concurrency`      | `10`                   | Concurrency cap shared by all parsers.                    |
| `org.alias`        | _(unset)_              | When set (or via `--org`), enrich metadata via live describe. |

## CLI

```
sf-scanner build [options]                    # full pipeline (recommended)
sf-scanner init [--force]                     # write a starter config
sf-scanner scan <path>                        # inventory + reports only
sf-scanner parse <path>                       # XML metadata only
sf-scanner parse-lwc | parse-apex | parse-flow | parse-aura
sf-scanner generate <out>                     # emit Playwright skeleton
sf-scanner generate-page-objects -i <parsed> -o <out>
sf-scanner generate-tests <parsed> <out>
```

Each `parse-*` and `generate-*` subcommand is also exposed individually for
debugging; `build` chains them in the right order.

### Live-org enrichment (`--org`)

```bash
sf org login web --alias my-sandbox --instance-url https://test.salesforce.com
sf-scanner build --org my-sandbox
```

When `--org` is set, the framework shells out to `sf org display` to borrow
the access token, then calls describe on every parsed object and merges
into `parsed-xml-results.json`:

- Per-field labels (translated, current).
- `nillable=false && createable=true → required=true`. Catches standard
  fields like `Account.Name` whose required flag isn't expressed in XML.
- Picklist `validValues`. The picklist test then emits real
  `expect(page.getByRole('option', { name: /^Web$/ })).toBeVisible()`
  assertions for the live values.

If `sf` isn't on PATH or the alias can't be resolved, the build logs a
warning and continues with file-only metadata — `--org` is opportunistic.

## Hand-editing generated tests: USER-CODE blocks

Generated files mark hand-editable regions with paired markers:

```ts
// <SF-SCANNER:USER-CODE id="setup">
// </SF-SCANNER:USER-CODE>
```

On every regeneration the framework reads the existing file, extracts the
inner content of every marked region, and re-injects it into the freshly
rendered output. **Code outside markers is overwritten; code between them
is preserved.**

Each test file ships with three file-level blocks (`imports`,
`describe-setup`, `custom-tests`) plus a per-test `<test-name>-extra`
block. Validation-rule and flow generators add additional inline blocks
(e.g. `trip-<rule>` for rule-tripping field-fills,
`flow-<name>-screen-<n>-extra` for per-screen customizations).

Pass `sf-scanner build --force` to opt out of preservation and overwrite
everything.

## Running the generated project

```bash
cd ./generated  # or wherever your generatedDir points
npm install
npx playwright install      # downloads browsers (first run only)

# Configure Salesforce credentials (one of):
#   .env with SALESFORCE_USERNAME / SALESFORCE_PASSWORD / SALESFORCE_SECURITY_TOKEN
#   .env with SALESFORCE_ACCESS_TOKEN / SALESFORCE_INSTANCE_URL (configuredConnection)
#   For permission tests: SF_USER_<PROFILE> / SF_PASS_<PROFILE> per profile
cp .env.example .env

npx playwright test --grep '@Account'        # run a subset
npx playwright test --grep '@field-validation'
```

See `docs/test-execution-guide.md` (also generated) for project-side details.

## Architecture (framework side)

- `src/scanner/` — async directory walk + path validation.
- `src/classifier/` — derives `{ type, purposes }` from a file path.
- `src/registry/` — aggregates `MetadataItem`s; persists `registry.json`.
- `src/parser/` — one subsystem per metadata format. Pattern: `*-parser.ts`
  (the parse), `*-parser-integration.ts` (orchestrate the repo walk),
  `*-results.ts` (in-memory shape), `*-results-persistence.ts` (serialize).
- `src/enrichment/` — optional live-org describe enrichment.
- `src/reporter/` — reporters consumed only by `scan`.
- `src/generator/` — code generation. `merge/section-markers.ts` powers
  USER-CODE preservation; `page-object/` builds POM classes; `test-specs/`
  has one generator per test category; `test-data/` builds REST-API client
  + factories; `test-fixtures/` builds Playwright fixtures; `templates/`
  holds Handlebars templates.
- `src/cli/commands/` — one module per subcommand exposing a typed
  `run<X>()` function plus a Commander adapter.

## Future work (not in current scope)

These were explicitly deferred from the current build:

- **faker-js integration.** The generated `package.json` declares
  `@faker-js/faker` but the factories produce plain hardcoded data.
- **Validation-rule-aware test data.** The framework parses
  `errorConditionFormula` but does not synthesize rule-tripping data — that
  goes in the per-rule USER-CODE block.
- **Coverage gaps in the parser layer.** No FlexiPages, Custom Labels,
  Custom Metadata Types, Sharing Rules, Approval Processes, Quick Actions,
  Permission Set Groups, or Custom Permissions yet.
- **Computed dependency graphs aren't read by generators.**
  `apex-dependency-graph.json`, `aura-to-object`, and `flow-to-object` are
  emitted but only `relationship-graph.json` is consumed downstream.
- **Live-org integration test in CI.** The `--org` enrichment path is
  smoke-verified manually; no automated end-to-end against a sandbox.

## License

MIT
