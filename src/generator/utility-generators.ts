/**
 * Utility function file generators
 */

import { readTemplate } from './template-loader.js';
import { writeGeneratedFile } from './file-generator.js';
import { logger } from '../utils/logger.js';
import { join } from 'path';

/**
 * Generates login helper utilities
 */
export async function generateLoginHelpers(outputDir: string): Promise<void> {
  try {
    const filePath = join(outputDir, 'utils', 'login-helpers.ts');
    logger.debug({ filePath }, 'Generating login helpers');
    const template = await readTemplate('login-helpers.hbs');
    await writeGeneratedFile(filePath, template, { format: true, fileType: 'typescript' });
    logger.info({ filePath }, 'Login helpers generated');
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate login helpers');
    throw error;
  }
}

/**
 * Generates wait utilities
 */
export async function generateWaitUtilities(outputDir: string): Promise<void> {
  try {
    const filePath = join(outputDir, 'utils', 'wait-utilities.ts');
    logger.debug({ filePath }, 'Generating wait utilities');
    const template = await readTemplate('wait-utilities.hbs');
    await writeGeneratedFile(filePath, template, { format: true, fileType: 'typescript' });
    logger.info({ filePath }, 'Wait utilities generated');
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate wait utilities');
    throw error;
  }
}

/**
 * Generates test data helpers
 */
export async function generateTestDataHelpers(outputDir: string): Promise<void> {
  try {
    const filePath = join(outputDir, 'utils', 'test-data-helpers.ts');
    logger.debug({ filePath }, 'Generating test data helpers');
    const template = await readTemplate('test-data-helpers.hbs');
    await writeGeneratedFile(filePath, template, { format: true, fileType: 'typescript' });
    logger.info({ filePath }, 'Test data helpers generated');
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate test data helpers');
    throw error;
  }
}

/**
 * Generates screenshot/recording utilities
 */
export async function generateScreenshotUtilities(outputDir: string): Promise<void> {
  try {
    const filePath = join(outputDir, 'utils', 'screenshot-utilities.ts');
    logger.debug({ filePath }, 'Generating screenshot utilities');
    const template = await readTemplate('screenshot-utilities.hbs');
    await writeGeneratedFile(filePath, template, { format: true, fileType: 'typescript' });
    logger.info({ filePath }, 'Screenshot utilities generated');
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate screenshot utilities');
    throw error;
  }
}

/**
 * Generates additional utilities
 */
export async function generateAdditionalUtilities(outputDir: string): Promise<void> {
  try {
    const filePath = join(outputDir, 'utils', 'additional-utilities.ts');
    logger.debug({ filePath }, 'Generating additional utilities');
    const template = await readTemplate('additional-utilities.hbs');
    await writeGeneratedFile(filePath, template, { format: true, fileType: 'typescript' });
    logger.info({ filePath }, 'Additional utilities generated');
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate additional utilities');
    throw error;
  }
}

/**
 * Generates all utility files
 */
export async function generateAllUtilities(outputDir: string): Promise<void> {
  await generateLoginHelpers(outputDir);
  await generateWaitUtilities(outputDir);
  await generateTestDataHelpers(outputDir);
  await generateScreenshotUtilities(outputDir);
  await generateAdditionalUtilities(outputDir);
}

