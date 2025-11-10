/**
 * Persistence utilities for LWC parsing results
 */

import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';
import type { ParsedLWCResultsJSON } from '../types/lwc-results.js';

/**
 * Ensures directory exists
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
}

/**
 * Saves parsed LWC results to JSON file
 */
export async function saveParsedLWCResults(
  results: ParsedLWCResultsJSON,
  filePath: string
): Promise<void> {
  try {
    await ensureDirectoryExists(filePath);
    const json = JSON.stringify(results, null, 2);
    await writeFile(filePath, json, 'utf-8');
    logger.info({ filePath }, 'Parsed LWC results saved successfully');
  } catch (error) {
    logger.error({ filePath, error }, 'Failed to save parsed LWC results');
    throw error;
  }
}

