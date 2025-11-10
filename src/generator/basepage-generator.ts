/**
 * BasePage generator
 */

import { readTemplate } from './template-loader.js';
import { writeGeneratedFile } from './file-generator.js';
import { logger } from '../utils/logger.js';
import { join } from 'path';

/**
 * Generates BasePage class
 */
export async function generateBasePage(outputDir: string): Promise<void> {
  try {
    const filePath = join(outputDir, 'pages', 'base-page.ts');
    logger.debug({ filePath }, 'Generating BasePage class');
    const template = await readTemplate('base-page.hbs');
    await writeGeneratedFile(filePath, template, { format: true, fileType: 'typescript' });
    logger.info({ filePath }, 'BasePage class generated');
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate BasePage class');
    throw error;
  }
}

