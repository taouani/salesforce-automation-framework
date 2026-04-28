/**
 * `parse-flow` command — parses Salesforce Flow definitions.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

import { validatePath, getPath } from '../../scanner/path-validator.js';
import { logger } from '../../utils/logger.js';
import { parseAllFlowFiles } from '../../parser/flow-parser-integration.js';
import { saveParsedFlowResults } from '../../parser/flow-results-persistence.js';

export interface ParseFlowOptions {
  output?: string;
  dependencies?: string;
  toObject?: string;
  concurrency?: number;
  testDefault?: boolean;
}

const DEFAULTS = {
  output: './parsed-results',
  dependencies: './flow-dependency-graph.json',
  toObject: './flow-to-object-dependency-graph.json',
  concurrency: 10,
};

export async function runParseFlow(
  pathArg: string | undefined,
  options: ParseFlowOptions = {},
): Promise<void> {
  const metadataPath = options.testDefault
    ? getPath(undefined, true)
    : getPath(pathArg, false);

  await validatePath(metadataPath);

  logger.info({ path: metadataPath }, 'Starting Flow file parsing');

  const concurrency = options.concurrency ?? DEFAULTS.concurrency;
  const output = options.output ?? DEFAULTS.output;
  const dependencies = options.dependencies ?? DEFAULTS.dependencies;
  const toObject = options.toObject ?? DEFAULTS.toObject;

  const parseResult = await parseAllFlowFiles({ metadataPath, concurrency });

  await mkdir(output, { recursive: true });

  const outputPath = join(output, 'parsed-flow-results.json');
  await saveParsedFlowResults({ output: outputPath, results: parseResult.results });

  const dependenciesPath = dependencies.startsWith('./')
    ? join(output, dependencies.replace(/^\.\//, ''))
    : dependencies;
  await writeFile(
    dependenciesPath,
    JSON.stringify(parseResult.results.dependencyGraph.toJSON(), null, 2),
    'utf-8',
  );

  const toObjectPath = toObject.startsWith('./')
    ? join(output, toObject.replace(/^\.\//, ''))
    : toObject;
  await writeFile(
    toObjectPath,
    JSON.stringify(parseResult.results.flowToObjectGraph.toJSON(), null, 2),
    'utf-8',
  );

  logger.info(
    {
      flows: parseResult.flows.length,
      errors: parseResult.errors,
      warnings: parseResult.warnings,
      outputDir: output,
    },
    'Flow parsing completed successfully',
  );
}

export async function parseFlowAction(pathArg: string, options: ParseFlowOptions): Promise<void> {
  try {
    await runParseFlow(pathArg, options);
  } catch (error) {
    logger.error({ error }, 'Flow parsing failed');
    process.exit(1);
  }
}
