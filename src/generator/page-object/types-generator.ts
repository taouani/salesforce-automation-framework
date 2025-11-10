/**
 * Type Definitions and Interfaces Generator
 * Generates TypeScript type definitions for page objects
 */

import type { PageObjectDefinition } from '../../types/page-object.js';
import { renderTemplate } from '../template-engine.js';
import { writeGeneratedFile } from '../file-generator.js';
import { readTemplate } from '../template-loader.js';
import { logger } from '../../utils/logger.js';
import { join } from 'path';

/**
 * Generates TypeScript type definitions file for page objects
 */
export async function generatePageObjectTypes(
  outputDir: string,
  pageObjects: PageObjectDefinition[]
): Promise<string> {
  try {
    const template = await readTemplate('page-object/types.hbs');
    const content = renderTemplate(template, { pageObjects });
    
    const filePath = join(outputDir, 'types', 'page-objects.ts');
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath, count: pageObjects.length }, 'Page object types generated');
    
    return filePath;
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate page object types');
    throw error;
  }
}

