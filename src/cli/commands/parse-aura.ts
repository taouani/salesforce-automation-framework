/**
 * `parse-aura` command — parses Aura component bundles + applications.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

import { validatePath, getPath } from '../../scanner/path-validator.js';
import { logger } from '../../utils/logger.js';
import { parseAllAuraComponents } from '../../parser/aura-parser-integration.js';
import { saveParsedAuraResults } from '../../parser/aura-results-persistence.js';

export interface ParseAuraOptions {
  output?: string;
  dependencies?: string;
  toObject?: string;
  toApex?: string;
  concurrency?: number;
  testDefault?: boolean;
}

const DEFAULTS = {
  output: './parsed-results',
  dependencies: './aura-dependency-graph.json',
  toObject: './aura-to-object-dependency-graph.json',
  toApex: './aura-to-apex-dependency-graph.json',
  concurrency: 10,
};

export async function runParseAura(
  pathArg: string | undefined,
  options: ParseAuraOptions = {},
): Promise<void> {
  const metadataPath = options.testDefault
    ? getPath(undefined, true)
    : getPath(pathArg, false);

  await validatePath(metadataPath);

  logger.info({ path: metadataPath }, 'Starting Aura component parsing');

  const concurrency = options.concurrency ?? DEFAULTS.concurrency;
  const output = options.output ?? DEFAULTS.output;
  const dependencies = options.dependencies ?? DEFAULTS.dependencies;
  const toObject = options.toObject ?? DEFAULTS.toObject;
  const toApex = options.toApex ?? DEFAULTS.toApex;

  const results = await parseAllAuraComponents(metadataPath, concurrency);

  await mkdir(output, { recursive: true });

  await saveParsedAuraResults(results, output);

  const dependenciesPath = dependencies.startsWith('./')
    ? join(output, dependencies.replace(/^\.\//, ''))
    : dependencies;
  await writeFile(
    dependenciesPath,
    JSON.stringify(results.auraDependencyGraph.toJSON(), null, 2),
    'utf-8',
  );

  const toObjectPath = toObject.startsWith('./')
    ? join(output, toObject.replace(/^\.\//, ''))
    : toObject;
  await writeFile(
    toObjectPath,
    JSON.stringify(results.auraToObjectDependencyGraph.toJSON(), null, 2),
    'utf-8',
  );

  const toApexPath = toApex.startsWith('./')
    ? join(output, toApex.replace(/^\.\//, ''))
    : toApex;
  await writeFile(
    toApexPath,
    JSON.stringify(results.auraToApexDependencyGraph.toJSON(), null, 2),
    'utf-8',
  );

  logger.info(
    {
      components: results.components.size,
      applications: results.applications.size,
      outputDir: output,
    },
    'Aura component parsing completed successfully',
  );
}

export async function parseAuraAction(pathArg: string, options: ParseAuraOptions): Promise<void> {
  try {
    await runParseAura(pathArg, options);
  } catch (error) {
    logger.error({ error }, 'Aura component parsing failed');
    process.exit(1);
  }
}
