/**
 * Path validation utilities
 */

import { access } from 'fs/promises';
import { PathValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Test default path for development
 */
export const TEST_DEFAULT_PATH =
  '/Users/taouani/Projects/Salesforce/cxhhc-sf-core/force-app/main/default/';

/**
 * Validates that a path exists and is accessible
 */
export async function validatePath(path: string): Promise<void> {
  if (!path || path.trim().length === 0) {
    throw new PathValidationError('Path cannot be empty');
  }

  try {
    await access(path);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.warn({ path, error: errorMessage }, 'Path validation failed');
    throw new PathValidationError(
      `Path does not exist or is not accessible: ${path}`,
      path
    );
  }
}

/**
 * Gets the path to use, with fallback to test default if in development
 */
export function getPath(inputPath?: string, useTestDefault = false): string {
  if (inputPath) {
    return inputPath;
  }

  if (useTestDefault) {
    return TEST_DEFAULT_PATH;
  }

  throw new PathValidationError('Path is required');
}

