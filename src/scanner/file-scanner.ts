/**
 * File system scanner for Salesforce metadata
 */

import fg from 'fast-glob';
import { FileReadError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ScanWarning } from '../types/metadata.js';

/**
 * Configuration for file scanning
 */
export interface ScanConfig {
  path: string;
  concurrency?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
}

/**
 * Result of scanning files
 */
export interface FileScanResult {
  files: string[];
  warnings: ScanWarning[];
}

/**
 * Scans directory for Salesforce metadata files
 */
export async function scanDirectory(
  config: ScanConfig
): Promise<FileScanResult> {
  const { path, includePatterns, excludePatterns } = config;
  const warnings: ScanWarning[] = [];

  try {
    // Build glob patterns
    const patterns = includePatterns || [
      '**/*.xml',
      '**/*.cls',
      '**/*.trigger',
      '**/*.js',
      '**/*.html',
      '**/*.css',
      '**/*.cmp',
      '**/*.app',
      '**/*.evt',
      '**/*.tokens',
    ];

    const options: fg.Options = {
      cwd: path,
      absolute: true,
      ignore: excludePatterns || ['node_modules/**', '.git/**'],
      onlyFiles: true,
    };

    logger.info({ path, patterns }, 'Starting directory scan');

    const files = await fg(patterns, options);

    logger.info({ fileCount: files.length }, 'Directory scan completed');

    return {
      files,
      warnings,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error({ path, error: errorMessage }, 'Directory scan failed');
    throw new FileReadError(path, error instanceof Error ? error : undefined);
  }
}

/**
 * Processes files in parallel with concurrency limit
 */
export async function processFilesInParallel<T, R>(
  files: T[],
  processor: (file: T) => Promise<R | null>,
  concurrency = 10
): Promise<R[]> {
  const results: R[] = [];
  const errors: Error[] = [];

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchPromises = batch.map(async (file) => {
      try {
        return await processor(file);
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
        logger.warn({ file, error }, 'Failed to process file');
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    for (const result of batchResults) {
      if (result !== null) {
        results.push(result);
      }
    }
  }

  if (errors.length > 0) {
    logger.warn({ errorCount: errors.length }, 'Some files failed to process');
  }

  return results;
}

/**
 * Extracts metadata information from file path
 */
export function extractMetadataFromPath(filePath: string): {
  fileName: string;
  directory: string;
  extension: string;
} {
  const pathParts = filePath.split('/');
  const fileName = pathParts[pathParts.length - 1] || '';
  const directory = pathParts[pathParts.length - 2] || '';
  const extension = fileName.includes('.')
    ? '.' + fileName.split('.').pop()
    : '';

  return {
    fileName,
    directory,
    extension,
  };
}

