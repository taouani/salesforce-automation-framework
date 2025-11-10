/**
 * Lightning Page Object Generator
 * Generates page object classes for Lightning pages (Record, Home, App)
 */

import type { LightningPageDefinition, ComponentLocatorDefinition } from '../../types/page-object.js';
import { generateLightningComponentLocator } from '../locator-generator.js';
import { renderTemplate } from '../template-engine.js';
import { writeGeneratedFile } from '../file-generator.js';
import { readTemplate } from '../template-loader.js';
import { logger } from '../../utils/logger.js';
import { join } from 'path';

/**
 * Generates a page object class for a Lightning page
 */
export async function generateLightningPageObject(
  outputDir: string,
  definition: LightningPageDefinition
): Promise<string> {
  try {
    const template = await readTemplate('page-object/lightning-page.hbs');
    const content = renderTemplate(template, { definition });
    
    const className = definition.name;
    const fileName = `${className.charAt(0).toLowerCase() + className.slice(1).replace('Page', '-page')}.ts`;
    const filePath = join(outputDir, 'pages', 'lightning', fileName);
    
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath, pageName: definition.pageName }, 'Lightning page object generated');
    
    return filePath;
  } catch (error) {
    logger.error({ outputDir, pageName: definition.pageName, error }, 'Failed to generate Lightning page object');
    throw error;
  }
}

/**
 * Generates component locators for Lightning page components
 */
export function generateComponentLocatorsForPage(
  components: Array<{ name: string; type: 'LWC' | 'Aura' | 'Standard' }>
): ComponentLocatorDefinition[] {
  return components.map((component) => 
    generateLightningComponentLocator(component.name, component.type)
  );
}

