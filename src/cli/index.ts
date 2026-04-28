#!/usr/bin/env node

/**
 * CLI entry point. Each subcommand delegates to a module under `commands/`
 * exposing a typed `run<X>` function plus a thin Commander adapter.
 */

import { Command } from 'commander';
import type { ReportFormat } from '../reporter/index.js';

import { scanAction, type ScanOptions } from './commands/scan.js';
import { parseXmlAction, type ParseXmlOptions } from './commands/parse-xml.js';
import { parseLwcAction, type ParseLwcOptions } from './commands/parse-lwc.js';
import { parseApexAction, type ParseApexOptions } from './commands/parse-apex.js';
import { parseFlowAction, type ParseFlowOptions } from './commands/parse-flow.js';
import { parseAuraAction, type ParseAuraOptions } from './commands/parse-aura.js';
import { generateAction, type GenerateOptions } from './commands/generate.js';
import {
  generatePageObjectsAction,
  type GeneratePageObjectsOptions,
} from './commands/generate-page-objects.js';
import { generateTestsAction, type GenerateTestsOptions } from './commands/generate-tests.js';
import { buildAction, type BuildOptions } from './commands/build.js';
import { initAction, type InitOptions } from './commands/init.js';

const program = new Command();

program
  .name('sf-scanner')
  .description('Salesforce metadata scanner and Playwright test generator')
  .version('1.0.0');

/** Helper: parse a `--concurrency` string into a number. */
function intParser(raw: string): number {
  return parseInt(raw, 10);
}

// build (orchestrator)
program
  .command('build')
  .description('Run the full pipeline (scan -> parse -> generate) using sf-scanner.config.json')
  .option('-c, --config <path>', 'Path to sf-scanner.config.json (default: search upward from cwd)')
  .option('--metadata-path <path>', 'Override config.metadataPath')
  .option('--skip-scan', 'Skip the inventory scan step', false)
  .option('--skip-page-objects', 'Skip page object generation', false)
  .option('--skip-tests', 'Skip test generation', false)
  .option('--force', 'Force overwrite the project skeleton if it exists', false)
  .action(async (options: BuildOptions) => buildAction(options));

// init
program
  .command('init')
  .description('Write a starter sf-scanner.config.json in the current directory')
  .option('--force', 'Overwrite an existing config file', false)
  .action(async (options: InitOptions) => initAction(options));

// scan
program
  .command('scan')
  .description('Scan Salesforce metadata repository and generate inventory reports')
  .argument('<path>', 'Path to Salesforce metadata directory')
  .option(
    '-f, --format <formats...>',
    'Output format(s): console, json, markdown',
    ['console'],
  )
  .option('-o, --output <path>', 'Output file path (for JSON/Markdown)')
  .option('-r, --registry <path>', 'Path to save registry JSON file', 'registry.json')
  .option('-c, --concurrency <number>', 'Concurrency limit for file processing', intParser, 10)
  .option('--test-default', 'Use test default path (for development)')
  .action(async (pathArg: string, options: ScanOptions & { format?: ReportFormat[] }) =>
    scanAction(pathArg, options),
  );

// parse XML
program
  .command('parse')
  .description('Parse XML metadata files (objects, profiles, permission sets)')
  .argument('<path>', 'Path to Salesforce metadata directory')
  .option('-o, --output <path>', 'Output directory for parsed results', './parsed-results')
  .option(
    '-r, --relationships <path>',
    'Path to save relationship graph JSON file',
    './relationship-graph.json',
  )
  .option('-c, --concurrency <number>', 'Concurrency limit for XML parsing', intParser, 10)
  .option('--test-default', 'Use test default path (for development)')
  .option('--objects-only', 'Parse only object XML files')
  .option('--profiles-only', 'Parse only profile XML files')
  .option('--permissionsets-only', 'Parse only permission set XML files')
  .action(async (pathArg: string, options: ParseXmlOptions) => parseXmlAction(pathArg, options));

// parse LWC
program
  .command('parse-lwc')
  .description('Parse Lightning Web Component files (.js, .html, .css)')
  .argument(
    '[path]',
    'Path to Salesforce metadata directory (required unless --test-default is used)',
  )
  .option('-o, --output <path>', 'Output directory for parsed results', './parsed-results')
  .option(
    '-d, --dependencies <path>',
    'Path to save dependency graph JSON file',
    './component-dependency-graph.json',
  )
  .option('-c, --concurrency <number>', 'Concurrency limit for parsing', intParser, 10)
  .option('--test-default', 'Use test default path (for development)')
  .action(async (pathArg: string, options: ParseLwcOptions) => parseLwcAction(pathArg, options));

// parse Apex
program
  .command('parse-apex')
  .description('Parse Apex class and trigger files (.cls, .trigger)')
  .argument(
    '[path]',
    'Path to Salesforce metadata directory (required unless --test-default is used)',
  )
  .option('-o, --output <path>', 'Output directory for parsed results', './parsed-results')
  .option(
    '-d, --dependencies <path>',
    'Path to save dependency graph JSON file',
    './apex-dependency-graph.json',
  )
  .option('-c, --concurrency <number>', 'Concurrency limit for parsing', intParser, 10)
  .option('--test-default', 'Use test default path (for development)')
  .action(async (pathArg: string, options: ParseApexOptions) => parseApexAction(pathArg, options));

// parse Flow
program
  .command('parse-flow')
  .description('Parse Salesforce Flow definition files (.flow-meta.xml)')
  .argument(
    '[path]',
    'Path to Salesforce metadata directory (required unless --test-default is used)',
  )
  .option('-o, --output <path>', 'Output directory for parsed results', './parsed-results')
  .option(
    '-d, --dependencies <path>',
    'Path to save dependency graph JSON file',
    './flow-dependency-graph.json',
  )
  .option(
    '-t, --to-object <path>',
    'Path to save Flow-to-object dependency graph JSON file',
    './flow-to-object-dependency-graph.json',
  )
  .option('-c, --concurrency <number>', 'Concurrency limit for parsing', intParser, 10)
  .option('--test-default', 'Use test default path (for development)')
  .action(async (pathArg: string, options: ParseFlowOptions) => parseFlowAction(pathArg, options));

// parse Aura
program
  .command('parse-aura')
  .description('Parse Salesforce Aura component files (.cmp, .js, .css)')
  .argument(
    '[path]',
    'Path to Salesforce metadata directory (required unless --test-default is used)',
  )
  .option('-o, --output <path>', 'Output directory for parsed results', './parsed-results')
  .option(
    '-d, --dependencies <path>',
    'Path to save Aura-to-Aura dependency graph JSON file',
    './aura-dependency-graph.json',
  )
  .option(
    '-t, --to-object <path>',
    'Path to save Aura-to-object dependency graph JSON file',
    './aura-to-object-dependency-graph.json',
  )
  .option(
    '-a, --to-apex <path>',
    'Path to save Aura-to-Apex dependency graph JSON file',
    './aura-to-apex-dependency-graph.json',
  )
  .option('-c, --concurrency <number>', 'Concurrency limit for parsing', intParser, 10)
  .option('--test-default', 'Use test default path (for development)')
  .action(async (pathArg: string, options: ParseAuraOptions) => parseAuraAction(pathArg, options));

// generate (skeleton)
program
  .command('generate')
  .description('Generate Playwright test project structure')
  .argument('<output-path>', 'Output path for generated test structure')
  .option('--force', 'Overwrite existing files and directories', false)
  .option('--project-name <name>', 'Project name for package.json', 'salesforce-tests')
  .action(async (outputPathArg: string, options: GenerateOptions) =>
    generateAction(outputPathArg, options),
  );

// generate-page-objects
program
  .command('generate-page-objects')
  .description('Generate Page Object Model classes from parsed Salesforce metadata')
  .option(
    '-i, --input <path>',
    'Path to parsed metadata results directory (default: ./parsed-results)',
    './parsed-results',
  )
  .option(
    '-o, --output <path>',
    'Output directory for generated page objects (page objects will be created in a "pages" subdirectory)',
    './generated-page-objects',
  )
  .option('--template-dir <path>', 'Custom template directory (optional)')
  .action(async (options: GeneratePageObjectsOptions) => generatePageObjectsAction(options));

// generate-tests
program
  .command('generate-tests')
  .description('Generate Playwright test specifications from parsed Salesforce metadata')
  .argument('[input]', 'Path to parsed metadata results directory (default: ./parsed-results)')
  .argument('[output]', 'Output directory for generated tests (default: ./generated-tests)')
  .option(
    '-i, --input <path>',
    'Path to parsed metadata results directory (default: ./parsed-results)',
  )
  .option('-o, --output <path>', 'Output directory for generated tests (default: ./generated-tests)')
  .option(
    '--auth-approach <approach>',
    'Authentication approach: helpers, configuredConnection, or both',
    'both',
  )
  .option('--no-fixtures', 'Skip generating test fixtures')
  .option('--no-test-data', 'Skip generating test data factories')
  .action(async (inputArg: string, outputArg: string, options: GenerateTestsOptions) =>
    generateTestsAction(inputArg, outputArg, options),
  );

program.parse(process.argv);
