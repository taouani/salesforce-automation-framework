/**
 * Documentation Generator for Page Objects
 * Generates documentation for page object classes
 */

import type { PageObjectDefinition } from '../../types/page-object.js';
import { renderTemplate } from '../template-engine.js';
import { writeGeneratedFile } from '../file-generator.js';
import { readTemplate } from '../template-loader.js';
import { logger } from '../../utils/logger.js';
import { join } from 'path';

/**
 * Generates documentation for a page object
 */
export async function generatePageObjectDocumentation(
  outputDir: string,
  pageObject: PageObjectDefinition
): Promise<string> {
  try {
    const template = await readTemplate('page-object/documentation.hbs');
    const content = renderTemplate(template, { pageObject });
    
    const className = pageObject.name;
    const fileName = `${className.charAt(0).toLowerCase() + className.slice(1)}.md`;
    const filePath = join(outputDir, 'docs', 'page-objects', fileName);
    
    await writeGeneratedFile(filePath, content, { format: false });
    logger.debug({ filePath, pageObjectName: pageObject.name }, 'Page object documentation generated');
    
    return filePath;
  } catch (error) {
    logger.error({ outputDir, pageObjectName: pageObject.name, error }, 'Failed to generate page object documentation');
    throw error;
  }
}

/**
 * Generates main documentation index
 */
export async function generateDocumentationIndex(
  outputDir: string,
  pageObjects: PageObjectDefinition[]
): Promise<string> {
  try {
    const template = await readTemplate('page-object/docs-index.hbs');
    const content = renderTemplate(template, { pageObjects });
    
    const filePath = join(outputDir, 'docs', 'README.md');
    await writeGeneratedFile(filePath, content, { format: false });
    logger.debug({ filePath, count: pageObjects.length }, 'Documentation index generated');
    
    return filePath;
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate documentation index');
    throw error;
  }
}

