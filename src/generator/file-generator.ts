/**
 * File generation utilities
 */

import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';
import { FileWriteError } from '../utils/generator-errors.js';
import { formatCode } from './code-formatter.js';

/**
 * Ensures directory exists, creating it if necessary
 */
export async function createDirectory(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
    logger.debug({ dirPath }, 'Directory created');
  } catch (error) {
    // Ignore error if directory already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      logger.error({ dirPath, error }, 'Failed to create directory');
      throw error;
    }
  }
}

/**
 * Writes a file with optional code formatting
 */
export async function writeGeneratedFile(
  filePath: string,
  content: string,
  options?: {
    format?: boolean;
    fileType?: 'typescript' | 'json';
  }
): Promise<void> {
  try {
    // Ensure directory exists
    const dir = dirname(filePath);
    await createDirectory(dir);

    // Format code if requested
    let finalContent = content;
    if (options?.format) {
      finalContent = await formatCode(content, options.fileType || 'typescript');
    }

    // Write file
    await writeFile(filePath, finalContent, 'utf-8');
    logger.debug({ filePath, contentLength: finalContent.length }, 'File written successfully');
  } catch (error) {
    logger.error({ filePath, error }, 'Failed to write file');
    throw new FileWriteError(filePath, error instanceof Error ? error : undefined);
  }
}

