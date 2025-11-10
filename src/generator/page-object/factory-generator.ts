/**
 * Factory and Builder Generator
 * Generates factory classes and builder patterns for page objects
 */

import type { PageObjectDefinition, PageObjectFactoryDefinition } from '../../types/page-object.js';
import { renderTemplate } from '../template-engine.js';
import { writeGeneratedFile } from '../file-generator.js';
import { readTemplate } from '../template-loader.js';
import { logger } from '../../utils/logger.js';
import { join } from 'path';

/**
 * Generates a factory class for page objects
 */
export async function generatePageObjectFactory(
  outputDir: string,
  factoryDef: PageObjectFactoryDefinition,
  pageObjects: PageObjectDefinition[]
): Promise<string> {
  try {
    const template = await readTemplate('page-object/factory.hbs');
    const content = renderTemplate(template, {
      factory: factoryDef,
      pageObjects,
    });
    
    const filePath = join(outputDir, 'factories', `${factoryDef.factoryClassName.toLowerCase()}.ts`);
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath }, 'Page object factory generated');
    
    return filePath;
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate page object factory');
    throw error;
  }
}

