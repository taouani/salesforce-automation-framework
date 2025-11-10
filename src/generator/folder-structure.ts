/**
 * Folder structure generator for test projects
 */

import { createDirectory } from './file-generator.js';
import { logger } from '../utils/logger.js';
import { existsSync } from 'fs';
import { rm } from 'fs/promises';
import { dirname, join } from 'path';

/**
 * Required folders for test project structure
 */
const REQUIRED_FOLDERS = ['pages', 'tests', 'config', 'utils', 'models', 'fixtures'] as const;

/**
 * Configuration for folder structure generation
 */
export interface FolderStructureConfig {
  force?: boolean;
}

/**
 * Generates folder structure for test project
 */
export async function generateFolderStructure(
  outputPath: string,
  config: FolderStructureConfig = {}
): Promise<void> {
  const { force = false } = config;

  try {
    logger.info({ outputPath, force }, 'Generating folder structure');

    // Handle force flag - remove existing directory if it exists
    if (force && existsSync(outputPath)) {
      logger.info({ outputPath }, 'Force flag set, removing existing directory');
      await rm(outputPath, { recursive: true, force: true });
    }

    // Create parent directory if needed
    const parentDir = dirname(outputPath);
    if (parentDir !== outputPath && !existsSync(parentDir)) {
      await createDirectory(parentDir);
    }

    // Create output directory if it doesn't exist
    await createDirectory(outputPath);

    // Create all required folders
    for (const folder of REQUIRED_FOLDERS) {
      const folderPath = join(outputPath, folder);
      await createDirectory(folderPath);
      logger.debug({ folderPath }, 'Created folder');
    }

    logger.info({ outputPath, foldersCreated: REQUIRED_FOLDERS.length }, 'Folder structure generated successfully');
  } catch (error) {
    logger.error({ outputPath, error }, 'Failed to generate folder structure');
    throw error;
  }
}

