/**
 * JSON persistence for metadata registry
 */

import { writeFile } from 'fs/promises';
import { FileReadError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { RegistryJSON } from '../types/registry.js';

/**
 * Saves registry to JSON file
 */
export async function saveRegistryToFile(
  registry: RegistryJSON,
  outputPath: string
): Promise<void> {
  try {
    const jsonContent = JSON.stringify(registry, null, 2);
    await writeFile(outputPath, jsonContent, 'utf-8');
    logger.info({ outputPath }, 'Registry saved to file');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error({ outputPath, error: errorMessage }, 'Failed to save registry');
    throw new FileReadError(
      outputPath,
      error instanceof Error ? error : undefined
    );
  }
}

