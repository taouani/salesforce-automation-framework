/**
 * Persistence utilities for parsed Aura results
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';
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
    const isDirectory = outputPath.endsWith('/') || !outputPath.includes('.');
    
    // Save main results
    const resultsFile = isDirectory ? join(outputPath, 'aura-results.json') : outputPath;
    const resultsJSON = (results as any).toJSON();
    await writeFile(resultsFile, JSON.stringify(resultsJSON, null, 2), 'utf-8');
    logger.info({ resultsFile }, 'Saved Aura results to JSON');

    // Save dependency graphs separately (only if outputPath is a directory)
    if (isDirectory) {
      const auraGraphFile = join(outputPath, 'aura-dependency-graph.json');
      await writeFile(
        auraGraphFile,
        JSON.stringify(results.auraDependencyGraph.toJSON(), null, 2),
        'utf-8'
      );
      logger.info({ auraGraphFile }, 'Saved Aura-to-Aura dependency graph');

      const auraToObjectGraphFile = join(outputPath, 'aura-to-object-dependency-graph.json');
      await writeFile(
        auraToObjectGraphFile,
        JSON.stringify(results.auraToObjectDependencyGraph.toJSON(), null, 2),
        'utf-8'
      );
      logger.info({ auraToObjectGraphFile }, 'Saved Aura-to-Object dependency graph');

      const auraToApexGraphFile = join(outputPath, 'aura-to-apex-dependency-graph.json');
      await writeFile(
        auraToApexGraphFile,
        JSON.stringify(results.auraToApexDependencyGraph.toJSON(), null, 2),
        'utf-8'
      );
      logger.info({ auraToApexGraphFile }, 'Saved Aura-to-Apex dependency graph');
    }
  } catch (error) {
    logger.error({ outputPath, error }, 'Failed to save parsed Aura results');
    throw error;
  }
}

