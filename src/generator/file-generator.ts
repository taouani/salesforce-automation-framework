/**
 * File generation utilities.
 *
 * Generated files are written through `writeGeneratedFile`. By default it
 * preserves the inner content of any `// <SF-SCANNER:USER-CODE id="...">`
 * blocks that exist in the file on disk, re-injecting them into the freshly
 * rendered output before formatting and writing. Pass `mergeMode: 'overwrite'`
 * to opt out (e.g. when the caller passes `--force`).
 */

import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';
import { FileWriteError } from '../utils/generator-errors.js';
import { formatCode } from './code-formatter.js';
import {
  extractUserSections,
  injectUserSections,
  MarkerError,
} from './merge/section-markers.js';

export type MergeMode = 'preserve-user-sections' | 'overwrite';

export interface WriteGeneratedFileOptions {
  format?: boolean;
  fileType?: 'typescript' | 'json';
  mergeMode?: MergeMode;
}

let defaultMergeMode: MergeMode = 'preserve-user-sections';

/**
 * Sets the merge mode used when a `writeGeneratedFile` call doesn't specify
 * one. The orchestrator flips this once when `--force` is passed; library
 * callers should normally leave it alone.
 */
export function setDefaultMergeMode(mode: MergeMode): void {
  defaultMergeMode = mode;
}

export function getDefaultMergeMode(): MergeMode {
  return defaultMergeMode;
}

export async function createDirectory(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
    logger.debug({ dirPath }, 'Directory created');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      logger.error({ dirPath, error }, 'Failed to create directory');
      throw error;
    }
  }
}

export async function writeGeneratedFile(
  filePath: string,
  content: string,
  options?: WriteGeneratedFileOptions,
): Promise<void> {
  const mergeMode: MergeMode = options?.mergeMode ?? defaultMergeMode;

  try {
    await createDirectory(dirname(filePath));

    let finalContent = content;
    if (options?.format) {
      finalContent = await formatCode(content, options.fileType ?? 'typescript');
    }

    if (mergeMode === 'preserve-user-sections') {
      finalContent = await preserveUserSections(filePath, finalContent);
    }

    await writeFile(filePath, finalContent, 'utf-8');
    logger.debug(
      { filePath, contentLength: finalContent.length, mergeMode },
      'File written successfully',
    );
  } catch (error) {
    logger.error({ filePath, error }, 'Failed to write file');
    throw new FileWriteError(filePath, error instanceof Error ? error : undefined);
  }
}

async function preserveUserSections(filePath: string, generated: string): Promise<string> {
  if (!existsSync(filePath)) return generated;

  let existing: string;
  try {
    existing = await readFile(filePath, 'utf-8');
  } catch (error) {
    logger.warn({ filePath, error }, 'Could not read existing file; falling back to overwrite');
    return generated;
  }

  let userSections: Map<string, string>;
  try {
    userSections = extractUserSections(existing);
  } catch (error) {
    if (error instanceof MarkerError) {
      logger.warn(
        { filePath, error: error.message },
        'Existing file has malformed user-code markers; overwriting',
      );
      return generated;
    }
    throw error;
  }

  if (userSections.size === 0) return generated;

  return injectUserSections(generated, userSections);
}
