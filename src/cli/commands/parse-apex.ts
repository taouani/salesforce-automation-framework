/**
 * `parse-apex` command — parses Apex classes and triggers.
 */

import { mkdir } from 'fs/promises';
import { join } from 'path';

import { validatePath, getPath } from '../../scanner/path-validator.js';
import { logger } from '../../utils/logger.js';
import { parseAllApexFiles } from '../../parser/apex-parser-integration.js';
import {
  saveParsedApexResults,
  saveApexDependencyGraph,
} from '../../parser/apex-results-persistence.js';

export interface ParseApexOptions {
  output?: string;
  dependencies?: string;
  concurrency?: number;
  testDefault?: boolean;
}

const DEFAULTS = {
  output: './parsed-results',
  dependencies: './apex-dependency-graph.json',
  concurrency: 10,
};

export async function runParseApex(
  pathArg: string | undefined,
  options: ParseApexOptions = {},
): Promise<void> {
  const metadataPath = options.testDefault
    ? getPath(undefined, true)
    : getPath(pathArg, false);

  await validatePath(metadataPath);

  logger.info({ path: metadataPath }, 'Starting Apex file parsing');

  const concurrency = options.concurrency ?? DEFAULTS.concurrency;
  const output = options.output ?? DEFAULTS.output;
  const dependencies = options.dependencies ?? DEFAULTS.dependencies;

  const parseResult = await parseAllApexFiles({ metadataPath, concurrency });

  await mkdir(output, { recursive: true });

  const outputPath = join(output, 'parsed-apex-results.json');
  await saveParsedApexResults(parseResult.results.toJSON(), outputPath);

  const dependenciesPath = dependencies.startsWith('./')
    ? join(output, dependencies.replace(/^\.\//, ''))
    : dependencies;
  await saveApexDependencyGraph(parseResult.results.dependencyGraph.toJSON(), dependenciesPath);

  logger.info(
    {
      classes: parseResult.classes.length,
      triggers: parseResult.triggers.length,
      errors: parseResult.errors,
      warnings: parseResult.warnings,
      outputDir: output,
    },
    'Apex parsing completed successfully',
  );
}

export async function parseApexAction(pathArg: string, options: ParseApexOptions): Promise<void> {
  try {
    await runParseApex(pathArg, options);
  } catch (error) {
    logger.error({ error }, 'Apex parsing failed');
    process.exit(1);
  }
}
