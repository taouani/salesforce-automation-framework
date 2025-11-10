/**
 * Persistence utilities for parsed Aura results
 */

import { writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { stat } from 'fs/promises';
import { logger } from '../utils/logger.js';
import type { ParsedAuraResults } from '../types/aura-results.js';

/**
 * Saves parsed Aura results to JSON files
 */
export async function saveParsedAuraResults(
  results: ParsedAuraResults,
  outputPath: string
): Promise<void> {
  try {
    logger.debug({ outputPath }, 'Saving parsed Aura results to JSON files');

    // Determine if outputPath is a directory or file
    // Check if it has a .json extension - if so, treat as file, otherwise as directory
    let isDirectory: boolean;
    if (outputPath.endsWith('/')) {
      isDirectory = true;
    } else if (extname(outputPath) === '.json') {
      isDirectory = false;
    } else {
      // Check if the path exists and is a directory
      try {
        const stats = await stat(outputPath);
        isDirectory = stats.isDirectory();
      } catch {
        // Path doesn't exist, assume it's a directory if it doesn't have an extension
        isDirectory = true;
      }
    }
    
    // Save main results
    const resultsFile = isDirectory ? join(outputPath, 'aura-results.json') : outputPath;
    const resultsJSON = (results as any).toJSON();
    await writeFile(resultsFile, JSON.stringify(resultsJSON, null, 2), 'utf-8');
    logger.info({ resultsFile }, 'Saved Aura results to JSON');
  } catch (error) {
    logger.error({ outputPath, error }, 'Failed to save parsed Aura results');
    throw error;
  }
}

