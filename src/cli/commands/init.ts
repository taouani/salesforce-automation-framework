/**
 * `init` command — writes a starter `sf-scanner.config.json` next to cwd.
 */

import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';

import { logger } from '../../utils/logger.js';
import { CONFIG_FILENAME } from '../../config/schema.js';

export interface InitOptions {
  /** Overwrite an existing config file. */
  force?: boolean;
  /** Directory to write the config into. Defaults to cwd. */
  cwd?: string;
}

const STARTER_CONFIG = {
  metadataPath: './salesforce-metadata',
  parsedResultsDir: './parsed-results',
  generatedDir: './generated',
  projectName: 'salesforce-tests',
  authApproach: 'both' as const,
  includeFixtures: true,
  includeTestData: true,
  concurrency: 10,
};

export async function runInit(options: InitOptions = {}): Promise<string> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const target = resolve(cwd, CONFIG_FILENAME);

  if (existsSync(target) && !options.force) {
    throw new Error(
      `${CONFIG_FILENAME} already exists at ${target}. Pass --force to overwrite.`,
    );
  }

  const body = JSON.stringify(STARTER_CONFIG, null, 2) + '\n';
  await writeFile(target, body, 'utf-8');
  logger.info({ path: target }, 'Wrote starter sf-scanner config');
  return target;
}

export async function initAction(options: InitOptions): Promise<void> {
  try {
    await runInit(options);
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : error }, 'init failed');
    process.exit(1);
  }
}
