/**
 * Unit Test Generator for Page Objects
 * Generates unit tests for page object classes
 */

import type { PageObjectDefinition } from '../../types/page-object.js';
import { renderTemplate } from '../template-engine.js';
import { writeGeneratedFile } from '../file-generator.js';
import { readTemplate } from '../template-loader.js';
import { logger } from '../../utils/logger.js';
import { join } from 'path';

/**
 * Generates unit tests for a page object
 */
export async function generatePageObjectTests(
  outputDir: string,
  pageObject: PageObjectDefinition
): Promise<string> {
  try {
    const template = await readTemplate('page-object/test.hbs');
    const content = renderTemplate(template, { pageObject });
    
    const className = pageObject.name;
    const fileName = `${className.charAt(0).toLowerCase() + className.slice(1)}.test.ts`;
    const filePath = join(outputDir, 'tests', 'page-objects', fileName);
    
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath, pageObjectName: pageObject.name }, 'Page object tests generated');
    
    return filePath;
  } catch (error) {
    logger.error({ outputDir, pageObjectName: pageObject.name, error }, 'Failed to generate page object tests');
    throw error;
  }
}

