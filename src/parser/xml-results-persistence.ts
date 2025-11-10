/**
 * Persistence utilities for XML parsing results
 */

import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';
import type { ParsedXMLResults } from '../types/xml-results.js';
import type { RelationshipGraphJSON } from '../types/relationship-graph.js';

/**
 * Ensures directory exists, creating it if necessary
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    // Ignore error if directory already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Saves parsed XML results to a JSON file
 */
export async function saveParsedXMLResults(
  results: ParsedXMLResults,
  filePath: string
): Promise<void> {
  try {
    await ensureDirectoryExists(filePath);
    const json = results.toJSON();
    const jsonString = JSON.stringify(json, null, 2);
    await writeFile(filePath, jsonString, 'utf-8');
    logger.info({ filePath }, 'Parsed XML results saved');
  } catch (error) {
    logger.error({ filePath, error }, 'Failed to save parsed XML results');
    throw error;
  }
}

/**
 * Saves relationship graph to a JSON file
 */
export async function saveRelationshipGraph(
  graphJSON: RelationshipGraphJSON,
  filePath: string
): Promise<void> {
  try {
    await ensureDirectoryExists(filePath);
    const jsonString = JSON.stringify(graphJSON, null, 2);
    await writeFile(filePath, jsonString, 'utf-8');
    logger.info({ filePath }, 'Relationship graph saved');
  } catch (error) {
    logger.error({ filePath, error }, 'Failed to save relationship graph');
    throw error;
  }
}

