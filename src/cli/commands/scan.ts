/**
 * `scan` command — walks a Salesforce metadata directory, classifies each
 * file, and emits inventory reports plus a registry JSON.
 */

import { scanDirectory, processFilesInParallel } from '../../scanner/file-scanner.js';
import { validatePath, getPath } from '../../scanner/path-validator.js';
import { createMetadataItem } from '../../classifier/index.js';
import { MetadataRegistry } from '../../registry/metadata-registry.js';
import { saveRegistryToFile } from '../../registry/persistence.js';
import { generateReports, type ReportFormat } from '../../reporter/index.js';
import { logger } from '../../utils/logger.js';
import { FileReadError } from '../../utils/errors.js';

export interface ScanOptions {
  format?: ReportFormat[];
  output?: string;
  registry?: string;
  concurrency?: number;
  testDefault?: boolean;
}

const DEFAULT_OPTIONS: Required<Omit<ScanOptions, 'output' | 'testDefault'>> = {
  format: ['console'],
  registry: 'registry.json',
  concurrency: 10,
};

export async function runScan(pathArg: string | undefined, options: ScanOptions = {}): Promise<void> {
  const metadataPath = options.testDefault
    ? getPath(undefined, true)
    : getPath(pathArg, false);

  await validatePath(metadataPath);

  logger.info({ path: metadataPath }, 'Starting metadata scan');

  const concurrency = options.concurrency ?? DEFAULT_OPTIONS.concurrency;
  const formats = options.format ?? DEFAULT_OPTIONS.format;
  const registryPath = options.registry ?? DEFAULT_OPTIONS.registry;

  const scanResult = await scanDirectory({ path: metadataPath, concurrency });

  const registry = new MetadataRegistry();
  const metadataItems = await processFilesInParallel(
    scanResult.files,
    async (filePath) => {
      try {
        return createMetadataItem(filePath);
      } catch (error) {
        registry.incrementWarnings();
        logger.warn({ filePath, error }, 'Failed to classify metadata item');
        return null;
      }
    },
    concurrency,
  );

  for (const item of metadataItems) {
    if (item) registry.addItem(item);
  }

  await saveRegistryToFile(registry.toJSON(), registryPath);

  await generateReports(registry, formats, options.output);

  logger.info(
    {
      totalItems: registry.getStatistics().totalItems,
      registryPath,
    },
    'Scan completed successfully',
  );
}

/** Wraps `runScan` for use as a Commander action. */
export async function scanAction(pathArg: string, options: ScanOptions): Promise<void> {
  try {
    await runScan(pathArg, options);
  } catch (error) {
    if (error instanceof FileReadError) {
      logger.error({ error: error.message }, 'Scan failed');
    } else {
      logger.error({ error }, 'Unexpected error');
    }
    process.exit(1);
  }
}
