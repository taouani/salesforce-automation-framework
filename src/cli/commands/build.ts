/**
 * `build` command — runs the full pipeline (scan -> parsers -> generators)
 * driven by `sf-scanner.config.json`.
 *
 * Equivalent to running, in order:
 *   scan, parse, parse-lwc, parse-apex, parse-flow, parse-aura,
 *   generate, generate-page-objects, generate-tests
 */

import { join } from 'path';
import { logger } from '../../utils/logger.js';
import { loadConfig, ConfigError, type LoadConfigOptions } from '../../config/loader.js';
import type { SfScannerConfig } from '../../config/schema.js';

import { runScan } from './scan.js';
import { runParseXml } from './parse-xml.js';
import { runParseLwc } from './parse-lwc.js';
import { runParseApex } from './parse-apex.js';
import { runParseFlow } from './parse-flow.js';
import { runParseAura } from './parse-aura.js';
import { runGenerate } from './generate.js';
import { runGeneratePageObjects } from './generate-page-objects.js';
import { runGenerateTests } from './generate-tests.js';

export interface BuildOptions {
  /** Explicit config path. If omitted, loader walks upward from cwd. */
  config?: string;
  /** CLI override for `metadataPath` in config. */
  metadataPath?: string;
  /** Skip the inventory scan step. */
  skipScan?: boolean;
  /** Skip emitting page objects (useful for parser-only runs). */
  skipPageObjects?: boolean;
  /** Skip emitting tests. */
  skipTests?: boolean;
  /** Force overwrite the project skeleton if it already exists. */
  force?: boolean;
}

export async function runBuild(options: BuildOptions = {}): Promise<void> {
  const overrides: Partial<SfScannerConfig> = {};
  if (options.metadataPath) overrides.metadataPath = options.metadataPath;

  const loaderOptions: LoadConfigOptions = {
    configPath: options.config,
    overrides,
  };

  const { config, configPath } = await loadConfig(loaderOptions);

  logger.info(
    {
      configPath,
      metadataPath: config.metadataPath,
      parsedResultsDir: config.parsedResultsDir,
      generatedDir: config.generatedDir,
    },
    'Starting build',
  );

  if (!options.skipScan) {
    logger.info({ step: 'scan' }, 'Step 1/9: scan');
    await runScan(config.metadataPath, {
      registry: join(config.parsedResultsDir, 'registry.json'),
      concurrency: config.concurrency,
      format: ['console'],
    });
  }

  logger.info({ step: 'parse-xml' }, 'Step 2/9: parse XML metadata');
  await runParseXml(config.metadataPath, {
    output: config.parsedResultsDir,
    concurrency: config.concurrency,
  });

  logger.info({ step: 'parse-lwc' }, 'Step 3/9: parse LWC components');
  await runParseLwc(config.metadataPath, {
    output: config.parsedResultsDir,
    concurrency: config.concurrency,
  });

  logger.info({ step: 'parse-apex' }, 'Step 4/9: parse Apex files');
  await runParseApex(config.metadataPath, {
    output: config.parsedResultsDir,
    concurrency: config.concurrency,
  });

  logger.info({ step: 'parse-flow' }, 'Step 5/9: parse Flow definitions');
  await runParseFlow(config.metadataPath, {
    output: config.parsedResultsDir,
    concurrency: config.concurrency,
  });

  logger.info({ step: 'parse-aura' }, 'Step 6/9: parse Aura components');
  await runParseAura(config.metadataPath, {
    output: config.parsedResultsDir,
    concurrency: config.concurrency,
  });

  logger.info({ step: 'generate' }, 'Step 7/9: generate Playwright project skeleton');
  await runGenerate(config.generatedDir, {
    force: options.force ?? false,
    projectName: config.projectName,
  });

  if (!options.skipPageObjects) {
    logger.info({ step: 'generate-page-objects' }, 'Step 8/9: generate page objects');
    await runGeneratePageObjects({
      input: config.parsedResultsDir,
      output: config.generatedDir,
    });
  }

  if (!options.skipTests) {
    logger.info({ step: 'generate-tests' }, 'Step 9/9: generate tests');
    await runGenerateTests(undefined, undefined, {
      input: config.parsedResultsDir,
      output: config.generatedDir,
      authApproach: config.authApproach,
      fixtures: config.includeFixtures,
      testData: config.includeTestData,
    });
  }

  logger.info(
    {
      generatedDir: config.generatedDir,
      parsedResultsDir: config.parsedResultsDir,
    },
    'Build completed',
  );
}

export async function buildAction(options: BuildOptions): Promise<void> {
  try {
    await runBuild(options);
  } catch (error) {
    if (error instanceof ConfigError) {
      logger.error({ error: error.message }, 'Config error');
    } else {
      logger.error({ error }, 'Build failed');
    }
    process.exit(1);
  }
}
