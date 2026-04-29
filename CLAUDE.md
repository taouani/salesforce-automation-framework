# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Node.js/TypeScript CLI (`sf-scanner`) that ingests a Salesforce metadata repository, parses each metadata format into structured JSON, and generates a standalone Playwright + TypeScript test project (Page Object Model, fixtures, REST-API-backed test data). It does **not** execute Salesforce or Playwright itself — it produces a sibling project that does.

The repo at `C:\Projects` (parent dir) is a separate Salesforce DX monorepo; its `CLAUDE.md` does not apply here.

## Commands

```bash
npm install
npm run build         # tsc → dist/
npm run dev -- <cmd>  # tsx; the `--` is required so flags reach the CLI, not npm
npm test              # vitest, runs tests/**/*.test.ts
npm run test:watch
npm run test:coverage
npm run lint          # eslint src --ext .ts
npm run format        # prettier --write src/**/*.ts
npm run type-check    # tsc --noEmit (strict, with noUnusedLocals/Parameters)
```

Run a single test file: `npx vitest run tests/parser/apex-class-parser.test.ts` (add `--watch` to iterate, or `-t "test name"` to filter by name).

The compiled CLI lives at `dist/cli/index.js` and is exposed as the `sf-scanner` bin.

## CLI pipeline

`sf-scanner build` is the orchestrator — it runs the full scan + parse + generate pipeline driven by `sf-scanner.config.json`. Each step is also exposed as a standalone subcommand for debugging:

| Step | Command | Reads | Writes |
|---|---|---|---|
| 0a | `init` | (none) | `sf-scanner.config.json` starter |
| 0b | `build [--org <alias>] [--force] [--skip-*]` | config + metadata | full pipeline output |
| 1 | `scan <path>` | metadata repo | `registry.json` + reports |
| 2a | `parse <path>` | objects, profiles, permission sets XML | `parsed-xml-results.json` |
| 2b | `parse-lwc <path>` | LWC bundles | `parsed-lwc-results.json` |
| 2c | `parse-apex <path>` | `.cls`/`.trigger` | `parsed-apex-results.json` + dependency graph |
| 2d | `parse-flow <path>` | `*.flow-meta.xml` | `parsed-flow-results.json` |
| 2e | `parse-aura <path>` | Aura bundles | `aura-results.json` |
| 3a | `generate <out>` | (none) | bare Playwright project skeleton |
| 3b | `generate-page-objects -i <parsed> -o <out>` | parse JSON | POM classes |
| 3c | `generate-tests <parsed> <out>` | parse JSON | test specs + factories + fixtures |

`generate-page-objects` and `generate-tests` silently skip whichever artifact is missing (e.g. no flow tests if `parsed-flow-results.json` isn't present), so run the parsers for every metadata type you want covered before generating.

### `--org <alias>` enrichment (optional)

Between parsers and generators, `build` can shell out to `sf org display --target-org <alias> --json` (via `src/enrichment/sf-cli-bridge.ts`), borrow the access token, and call describe on every parsed object. The describe truth (label, `nillable -> required`, picklist `validValues`) is merged into `parsed-xml-results.json` before generators run. Missing `sf` / unknown alias / expired auth degrades gracefully — the build logs a warning and continues with file-only metadata.

On Windows the bridge points at `sf.cmd` and uses `shell: true` for execFile (CVE-2024-27980 forced this; alias is validated against `^[A-Za-z0-9_-]+$` before being passed to the shell).

### Merge-safe regeneration (USER-CODE markers)

`writeGeneratedFile` (in `src/generator/file-generator.ts`) preserves the inner content of any `// <SF-SCANNER:USER-CODE id="...">` block found on disk before writing. The marker syntax + parsing rules live in `src/generator/merge/section-markers.ts`. Code outside markers is overwritten on every regen; code between them survives. `sf-scanner build --force` (or `setDefaultMergeMode('overwrite')`) bypasses the preservation.

Templates and test-spec generators sprinkle USER-CODE blocks at known seams: file-level `imports`, `describe-setup`, `custom-tests`; per-test `<test-name>-extra`; per-rule `trip-<rule>` for validation-rule data; per-screen `flow-<name>-screen-<n>-extra`; per-flow `flow-<name>-launch` for entry-URL overrides.

## Module layout

- `src/scanner/` — async directory walk + path validation. Concurrency-bounded `processFilesInParallel`.
- `src/classifier/` — pure functions that derive `{ type, purposes }` from a file path. `createMetadataItem(filePath)` is the single entry point used by `scan`.
- `src/registry/` — `MetadataRegistry` aggregates `MetadataItem`s; `persistence.ts` writes `registry.json`.
- `src/parser/` — one subsystem per metadata format. Pattern repeats: a `*-parser.ts` (or several siblings) does the parse, `*-parser-integration.ts` orchestrates the repo walk and yields a results object, `*-results.ts` defines the in-memory shape, `*-results-persistence.ts` serializes it. Cross-references (`cross-reference.ts`, `*-dependency-graph.ts`) are computed across parsed results, not during parse. Note: dependency-graph JSON is currently emitted but not consumed by the generators — only `relationship-graph.json` is.
- `src/enrichment/` — optional live-org describe enrichment. `sf-cli-bridge.ts` resolves credentials via the local `sf` CLI; `describe-client.ts` is a minimal `fetch`-based describe API client; `object-enricher.ts` merges the truth into parsed objects.
- `src/config/` — Zod schema + upward-search loader for `sf-scanner.config.json`. The loader resolves relative paths against the directory the config was found in.
- `src/cli/commands/` — one module per subcommand exposing a typed `run<X>()` function plus a thin Commander adapter (`xAction`). The orchestrator `build.ts` calls the `run*` functions in order. `index.ts` is just wiring.
- `src/reporter/` — console/JSON/Markdown reporters consumed only by `scan`.
- `src/generator/` — code generation, two tiers:
  - Root files (`folder-structure.ts`, `config-generators.ts`, `utility-generators.ts`, `basepage-generator.ts`) build the Playwright project skeleton for `generate`.
  - Each subdir owns one piece of `generate-tests` / `generate-page-objects`:
    - `page-object/generation-engine.ts` — entry point for `generate-page-objects`. Subgenerators per source kind (object, lightning page, LWC, Aura, flow screen) plus shared `methods-generator`, `factory-generator`, `types-generator`, `documentation-generator`.
    - `test-generation/test-generation-engine.ts` — entry point for `generate-tests`. Fans out to test-spec generators and pulls in test data + fixtures.
    - `test-specs/` — one generator per test category (CRUD, validation rule, record type, field validation, relationship, component, flow, permission).
    - `test-data/` — Salesforce REST API client + factory generators + auth (`--auth-approach helpers|configuredConnection|both`).
    - `test-fixtures/` — Playwright fixtures (skip with `--no-fixtures`).
    - `templates/` — Handlebars templates loaded via `template-loader.ts`/`template-engine.ts`. Override at runtime with `--template-dir`.
- `src/types/` — shared TS interfaces. `metadata.ts` / `registry.ts` are foundational; `*-parsed.ts` and `*-results.ts` mirror parser outputs; `page-object.ts` / `test-generation.ts` describe generator inputs.
- `src/utils/` — `logger.ts` (pino, structured) and one `*-errors.ts` per subsystem defining typed error classes used in `instanceof` checks at the CLI boundary.

## Conventions

- **ESM-only.** `package.json` is `"type": "module"`. All relative imports must use the explicit `.js` extension (e.g. `import { foo } from './foo.js'`) even from `.ts` source — TypeScript resolves them and emits ES modules.
- **Logging.** Always use `logger.{info,warn,error}({ structuredFields }, 'message')` from `src/utils/logger.ts`. Don't `console.log`.
- **Errors.** Throw typed errors from `src/utils/*-errors.ts`. CLI handlers `instanceof`-check known errors and exit non-zero; unknown errors fall through to a generic `'Unexpected error'` log.
- **Strictness.** `tsconfig.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`. Prefix intentionally-unused parameters with `_` (matches the eslint `argsIgnorePattern`).
- **Style.** Prettier — 2-space, single quotes, semicolons, trailing commas (es5), 100-col print width. ESLint flags `@typescript-eslint/no-explicit-any` as a warning.
- **Tests.** Vitest with `globals: true` (no need to import `describe`/`it`/`expect`). Tests live in `tests/` mirroring `src/`. The framework's own tests run in pure Node — no Salesforce org or browser is required.

## Generated / ignored artifacts

`registry.json`, `parsed-results/`, `generated/`, `generated-page-objects/`, `generated-tests/`, `my-test-project/`, `test-temp-*/`, `test-results/`, `playwright-report/` are gitignored outputs. Don't commit them; if one appears unexpectedly in `git status`, treat it as a stale artifact rather than source.

## Sandbox-broken environment notes

- **Vitest doesn't start in this corp environment** — esbuild fails on `Cannot read directory "../.."` because the sandbox can't read `C:\`. Use the small smoke harnesses in `dist/`-based `node *.mjs` scripts during development (see prior commits' descriptions for the pattern) until the env is fixed.
- **Chromium download blocked** — corporate network blocks Playwright's browser fetcher. The generated project compiles and Playwright will list tests, but actually running them locally requires a pre-installed browser.

## Future work (not in current scope)

Tracked in `agent-os/product/roadmap.md`; documented as future work in the README:

- faker-js integration for test data (the dep is declared but no factories use it).
- Validation-rule-aware test data synthesis.
- Parser coverage for FlexiPages, Custom Labels, Custom Metadata Types, Sharing Rules, Approval Processes, Quick Actions, Permission Set Groups, Custom Permissions.
- Page-layout-aware test filtering. Picklist tests assume the field is rendered on the create form; describe enrichment doesn't know about layout assignments, so tests for fields off the default layout fail (verified live with `AccountSource` against `test-automation`). Future fix: parse FlexiPages + standard page layouts, intersect with describe field set.
- Wiring the already-computed `apex-dependency-graph.json` / `aura-to-object` / `flow-to-object` graphs into the generators.
- Automated CI integration test against a sandbox.

## Agent OS

The repo is Agent-OS-managed (`agent-os/config.yml`, profile `default`). Spec folders under `agent-os/specs/<YYYY-MM-DD>-<slug>/` define each phase of work, and `agent-os/product/roadmap.md` is the source of truth for completed vs pending phases. Standards under `agent-os/standards/{global,backend,frontend,testing}/` are reference material — `global/coding-style.md`, `global/conventions.md`, and `global/error-handling.md` are the most relevant here.
