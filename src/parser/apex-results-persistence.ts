/**
 * Persistence utilities for Apex parsing results
 */

import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';
import type { ParsedApexResultsJSON } from '../types/apex-results.js';
import type { ApexToObjectDependencyGraphJSON } from '../types/apex-dependency-graph.js';

/**
 * Ensures directory exists
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
}

/**
 * Saves parsed Apex results to JSON file
 */
export async function saveParsedApexResults(
  results: ParsedApexResultsJSON,
  filePath: string
): Promise<void> {
  try {
    await ensureDirectoryExists(filePath);
    const json = JSON.stringify(results, null, 2);
    await writeFile(filePath, json, 'utf-8');
    logger.info({ filePath }, 'Parsed Apex results saved successfully');
  } catch (error) {
    logger.error({ filePath, error }, 'Failed to save parsed Apex results');
    throw error;
  }
}

/**
 * Saves Apex-to-object dependency graph to JSON file
 */
export async function saveApexDependencyGraph(
  graph: ApexToObjectDependencyGraphJSON,
  filePath: string
): Promise<void> {
  try {
    await ensureDirectoryExists(filePath);
    const json = JSON.stringify(graph, null, 2);
    await writeFile(filePath, json, 'utf-8');
    logger.info({ filePath }, 'Apex dependency graph saved successfully');
  } catch (error) {
    logger.error({ filePath, error }, 'Failed to save Apex dependency graph');
    throw error;
  }
}

