/**
 * Persistence utilities for parsed Flow results
 */

import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';
import type { ParsedFlowResults } from '../types/flow-results.js';
import type {
  FlowDependencyGraphJSON,
  FlowToObjectDependencyGraphJSON,
} from '../types/flow-dependency-graph.js';

/**
 * Options for saving parsed Flow results
 */
export interface SaveFlowResultsOptions {
  output: string;
  results: ParsedFlowResults;
}

/**
 * Ensures directory exists
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Ignore if directory already exists
    if (error instanceof Error && (error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Saves parsed Flow results to JSON file
 */
export async function saveParsedFlowResults(options: SaveFlowResultsOptions): Promise<void> {
  const { output, results } = options;
  
  try {
    await ensureDirectoryExists(dirname(output));
    
    const json = JSON.stringify(results.toJSON(), null, 2);
    await writeFile(output, json, 'utf-8');
    
    logger.info({ output, flowCount: results.getAllFlows().length }, 'Saved parsed Flow results');
  } catch (error) {
    logger.error({ output, error }, 'Failed to save parsed Flow results');
    throw error;
  }
}

/**
 * Saves Flow dependency graph to JSON file
 */
export async function saveFlowDependencyGraph(
  output: string,
  graph: FlowDependencyGraphJSON
): Promise<void> {
  try {
    await ensureDirectoryExists(dirname(output));
    
    const json = JSON.stringify(graph, null, 2);
    await writeFile(output, json, 'utf-8');
    
    logger.info({ output }, 'Saved Flow dependency graph');
  } catch (error) {
    logger.error({ output, error }, 'Failed to save Flow dependency graph');
    throw error;
  }
}

/**
 * Saves Flow-to-object dependency graph to JSON file
 */
export async function saveFlowToObjectDependencyGraph(
  output: string,
  graph: FlowToObjectDependencyGraphJSON
): Promise<void> {
  try {
    await ensureDirectoryExists(dirname(output));
    
    const json = JSON.stringify(graph, null, 2);
    await writeFile(output, json, 'utf-8');
    
    logger.info({ output }, 'Saved Flow-to-object dependency graph');
  } catch (error) {
    logger.error({ output, error }, 'Failed to save Flow-to-object dependency graph');
    throw error;
  }
}

