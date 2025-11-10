/**
 * Base Page Object class generators
 */

import type {
  BaseObjectPageDefinition,
  BaseLightningPageDefinition,
  BaseComponentPageDefinition,
  BaseFlowScreenDefinition,
} from '../../types/page-object.js';
import { renderTemplate } from '../template-engine.js';
import { writeGeneratedFile } from '../file-generator.js';
import { readTemplate } from '../template-loader.js';
import { logger } from '../../utils/logger.js';
import { join } from 'path';

/**
 * Generates BaseObjectPage class
 */
export async function generateBaseObjectPage(
  outputDir: string,
  definition: BaseObjectPageDefinition
): Promise<string> {
  try {
    const template = await readTemplate('page-object/base-object-page.hbs');
    const content = renderTemplate(template, { definition });
    const filePath = join(outputDir, 'pages', 'base', 'base-object-page.ts');
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath }, 'BaseObjectPage class generated');
    return filePath;
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate BaseObjectPage class');
    throw error;
  }
}

/**
 * Generates BaseLightningPage class
 */
export async function generateBaseLightningPage(
  outputDir: string,
  definition: BaseLightningPageDefinition
): Promise<string> {
  try {
    const template = await readTemplate('page-object/base-lightning-page.hbs');
    const content = renderTemplate(template, { definition });
    const filePath = join(outputDir, 'pages', 'base', 'base-lightning-page.ts');
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath }, 'BaseLightningPage class generated');
    return filePath;
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate BaseLightningPage class');
    throw error;
  }
}

/**
 * Generates BaseComponentPage class
 */
export async function generateBaseComponentPage(
  outputDir: string,
  definition: BaseComponentPageDefinition
): Promise<string> {
  try {
    const template = await readTemplate('page-object/base-component-page.hbs');
    const content = renderTemplate(template, { definition });
    const filePath = join(outputDir, 'pages', 'base', 'base-component-page.ts');
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath }, 'BaseComponentPage class generated');
    return filePath;
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate BaseComponentPage class');
    throw error;
  }
}

/**
 * Generates BaseFlowScreen class
 */
export async function generateBaseFlowScreen(
  outputDir: string,
  definition: BaseFlowScreenDefinition
): Promise<string> {
  try {
    const template = await readTemplate('page-object/base-flow-screen.hbs');
    const content = renderTemplate(template, { definition });
    const filePath = join(outputDir, 'pages', 'base', 'base-flow-screen.ts');
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath }, 'BaseFlowScreen class generated');
    return filePath;
  } catch (error) {
    logger.error({ outputDir, error }, 'Failed to generate BaseFlowScreen class');
    throw error;
  }
}

