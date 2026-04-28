/**
 * `parse-lwc` command — parses Lightning Web Component bundles.
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';

import { validatePath, getPath } from '../../scanner/path-validator.js';
import { logger } from '../../utils/logger.js';
import { parseAllLWCComponents } from '../../parser/lwc-parser-integration.js';
import { saveParsedLWCResults } from '../../parser/lwc-results-persistence.js';

export interface ParseLwcOptions {
  output?: string;
  dependencies?: string;
  concurrency?: number;
  testDefault?: boolean;
}

const DEFAULTS = {
  output: './parsed-results',
  dependencies: './component-dependency-graph.json',
  concurrency: 10,
};

export async function runParseLwc(
  pathArg: string | undefined,
  options: ParseLwcOptions = {},
): Promise<void> {
  const metadataPath = options.testDefault
    ? getPath(undefined, true)
    : getPath(pathArg, false);

  await validatePath(metadataPath);

  logger.info({ path: metadataPath }, 'Starting LWC component parsing');

  const concurrency = options.concurrency ?? DEFAULTS.concurrency;
  const output = options.output ?? DEFAULTS.output;
  const dependencies = options.dependencies ?? DEFAULTS.dependencies;

  const parseResult = await parseAllLWCComponents({ metadataPath, concurrency });

  const outputPath = join(output, 'parsed-lwc-results.json');
  await saveParsedLWCResults(parseResult.results.toJSON(), outputPath);

  const dependenciesPath = dependencies.startsWith('./')
    ? join(output, dependencies.replace(/^\.\//, ''))
    : dependencies;
  await writeFile(
    dependenciesPath,
    JSON.stringify(parseResult.results.dependencyGraph.toJSON(), null, 2),
    'utf-8',
  );

  logger.info(
    {
      components: parseResult.components.length,
      errors: parseResult.errors,
      warnings: parseResult.warnings,
      outputDir: output,
    },
    'LWC parsing completed successfully',
  );
}

export async function parseLwcAction(pathArg: string, options: ParseLwcOptions): Promise<void> {
  try {
    await runParseLwc(pathArg, options);
  } catch (error) {
    logger.error({ error }, 'LWC parsing failed');
    process.exit(1);
  }
}
