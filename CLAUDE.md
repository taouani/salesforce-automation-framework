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

One Commander program in `src/cli/index.ts`. Subcommands form a pipeline — later steps read JSON written by earlier ones into the output directory (default `./parsed-results`):

| Step | Command | Reads | Writes |
|---|---|---|---|
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

## Module layout

- `src/scanner/` — async directory walk + path validation. Concurrency-bounded `processFilesInParallel`.
- `src/classifier/` — pure functions that derive `{ type, purposes }` from a file path. `createMetadataItem(filePath)` is the single entry point used by `scan`.
- `src/registry/` — `MetadataRegistry` aggregates `MetadataItem`s; `persistence.ts` writes `registry.json`.
- `src/parser/` — one subsystem per metadata format. Pattern repeats: a `*-parser.ts` (or several siblings) does the parse, `*-parser-integration.ts` orchestrates the repo walk and yields a results object, `*-results.ts` defines the in-memory shape, `*-results-persistence.ts` serializes it. Cross-references (`cross-reference.ts`, `*-dependency-graph.ts`) are computed across parsed results, not during parse.
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

`registry.json`, `parsed-results/`, `generated-page-objects/`, `generated-tests/`, `my-test-project/`, `test-temp-*/`, `test-results/`, `playwright-report/` are gitignored outputs. Don't commit them; if one appears unexpectedly in `git status`, treat it as a stale artifact rather than source.

## Agent OS

The repo is Agent-OS-managed (`agent-os/config.yml`, profile `default`). Spec folders under `agent-os/specs/<YYYY-MM-DD>-<slug>/` define each phase of work, and `agent-os/product/roadmap.md` is the source of truth for completed vs pending phases. Standards under `agent-os/standards/{global,backend,frontend,testing}/` are reference material — `global/coding-style.md`, `global/conventions.md`, and `global/error-handling.md` are the most relevant here.
