/**
 * `build` command — runs the full pipeline (scan -> parsers -> generators)
 * driven by `sf-scanner.config.json`.
 *
 * Equivalent to running, in order:
 *   scan, parse, parse-lwc, parse-apex, parse-flow, parse-aura,
 *   generate, generate-page-objects, generate-tests
 */

import { join } from 'path';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

import { logger } from '../../utils/logger.js';
import { loadConfig, ConfigError, type LoadConfigOptions } from '../../config/loader.js';
import type { SfScannerConfig, SfScannerConfigInput } from '../../config/schema.js';
import { setDefaultMergeMode } from '../../generator/file-generator.js';
import { fetchOrgCredentials, SfCliError } from '../../enrichment/sf-cli-bridge.js';
import { createDescribeClient } from '../../enrichment/describe-client.js';
import { enrichObjects } from '../../enrichment/object-enricher.js';
import type { ObjectDefinition } from '../../types/xml-parsed.js';

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
  /** Org alias for live describe enrichment (overrides config.org.alias). */
  org?: string;
}

export async function runBuild(options: BuildOptions = {}): Promise<void> {
  const overrides: Partial<SfScannerConfigInput> = {};
  if (options.metadataPath) overrides.metadataPath = options.metadataPath;
  if (options.org) overrides.org = { alias: options.org };

  const loaderOptions: LoadConfigOptions = {
    configPath: options.config,
    overrides,
  };

  const { config, configPath } = await loadConfig(loaderOptions);

  if (options.force) {
    setDefaultMergeMode('overwrite');
  }

  logger.info(
    {
      configPath,
      metadataPath: config.metadataPath,
      parsedResultsDir: config.parsedResultsDir,
      generatedDir: config.generatedDir,
      mergeMode: options.force ? 'overwrite' : 'preserve-user-sections',
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

  if (config.org?.alias) {
    await enrichParsedObjectsFromOrg(config);
  }

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

/**
 * Loads `parsed-xml-results.json`, enriches the `objects[]` via the live
 * describe API, and writes the result back. Failures are logged and the
 * pipeline continues with the unenriched data — describe enrichment is
 * always opportunistic.
 */
async function enrichParsedObjectsFromOrg(config: SfScannerConfig): Promise<void> {
  const alias = config.org?.alias;
  if (!alias) return;

  const xmlPath = join(config.parsedResultsDir, 'parsed-xml-results.json');
  if (!existsSync(xmlPath)) {
    logger.warn(
      { xmlPath },
      'Skipping org enrichment: parsed-xml-results.json not found',
    );
    return;
  }

  let credentials;
  try {
    logger.info({ alias, step: 'enrich' }, 'Resolving org credentials via sf CLI');
    credentials = await fetchOrgCredentials(alias);
  } catch (error) {
    if (error instanceof SfCliError) {
      logger.warn(
        { alias, error: error.message },
        'Skipping org enrichment: could not resolve credentials. Generation will continue with file-only metadata.',
      );
      return;
    }
    throw error;
  }

  let parsed: { objects?: ObjectDefinition[]; [key: string]: unknown };
  try {
    parsed = JSON.parse(await readFile(xmlPath, 'utf-8'));
  } catch (error) {
    logger.warn(
      { xmlPath, error: (error as Error).message },
      'Skipping org enrichment: could not read parsed-xml-results.json',
    );
    return;
  }

  if (!Array.isArray(parsed.objects) || parsed.objects.length === 0) {
    logger.info({ xmlPath }, 'No objects to enrich');
    return;
  }

  const client = createDescribeClient({ credentials });
  const { objects, summary } = await enrichObjects(parsed.objects, client, {
    concurrency: Math.min(config.concurrency, 5),
  });

  parsed.objects = objects;
  await writeFile(xmlPath, JSON.stringify(parsed, null, 2), 'utf-8');

  logger.info(
    {
      alias,
      apiVersion: credentials.apiVersion,
      enriched: summary.enriched,
      missing: summary.missing,
      errored: summary.errored,
      fieldsUpdated: summary.fieldsUpdated,
    },
    'Org enrichment completed',
  );
  if (summary.errored > 0) {
    logger.debug({ errors: summary.errors }, 'Per-object enrichment errors');
  }
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
