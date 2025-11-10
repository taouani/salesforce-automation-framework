/**
 * Integration module for parsing all LWC components in a directory
 */

import { scanDirectory } from '../scanner/file-scanner.js';
import { processFilesInParallel } from '../scanner/file-scanner.js';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';
import { parseComponentBundle } from './component-bundle-parser.js';
import { ComponentDependencyGraphImpl } from './component-dependency-graph.js';
import { ParsedLWCResultsImpl } from './lwc-results.js';
import type { LWCComponentDefinition } from '../types/lwc-parsed.js';

/**
 * Options for parsing LWC components
 */
export interface ParseLWCOptions {
  metadataPath: string;
  concurrency?: number;
}

/**
 * Result of parsing LWC components
 */
export interface ParseLWCResult {
  components: LWCComponentDefinition[];
  errors: number;
  warnings: number;
  results: ParsedLWCResultsImpl; // Include the results object for saving
}


/**
 * Parses all LWC components in a directory
 */
export async function parseAllLWCComponents(options: ParseLWCOptions): Promise<ParseLWCResult> {
  const { metadataPath, concurrency = 10 } = options;
  
  logger.info({ metadataPath }, 'Starting LWC component parsing');

  // Discover LWC component directories
  const scanResult = await scanDirectory({
    path: metadataPath,
    includePatterns: ['**/lwc/**/*.js'],
  });

  // Group files by component directory, excluding test files
  const componentDirs = new Set<string>();
  for (const file of scanResult.files) {
    // Skip test files and files in __tests__ directories
    if (file.includes('__tests__') || file.includes('.test.js') || file.includes('.spec.js')) {
      continue;
    }
    if (file.endsWith('.js')) {
      const componentDir = dirname(file);
      // Only include directories that are actual component directories (not parent directories)
      // Component directories should be directly under lwc/
      if (componentDir.includes('/lwc/')) {
        componentDirs.add(componentDir);
      }
    }
  }
  
  logger.debug({ componentCount: componentDirs.size }, 'Found component directories');

  const dependencyGraph = new ComponentDependencyGraphImpl();
  const results = new ParsedLWCResultsImpl(dependencyGraph);

  let parsedCount = 0;
  let errorCount = 0;
  let warningCount = 0;

  // Parse components in parallel
  await processFilesInParallel(
    Array.from(componentDirs),
    async (componentDir) => {
      try {
        const component = await parseComponentBundle(componentDir);
        results.addComponent(component);
        parsedCount++;
        return component;
      } catch (error) {
        warningCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        logger.warn({ componentDir, error: errorMessage, stack: errorStack }, 'Failed to parse component bundle');
        return null;
      }
    },
    concurrency
  );

  logger.info(
    {
      parsed: parsedCount,
      errors: errorCount,
      warnings: warningCount,
    },
    'LWC component parsing completed'
  );

  return {
    components: results.getAllComponents(),
    errors: errorCount,
    warnings: warningCount,
    results, // Return the results object so it can be used for saving
  };
}

