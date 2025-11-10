/**
 * Configuration file generators
 */

import { renderTemplate } from './template-engine.js';
import { writeGeneratedFile } from './file-generator.js';
import { logger } from '../utils/logger.js';
import { readTemplate } from './template-loader.js';

/**
 * Generates Playwright configuration file
 */
export async function generatePlaywrightConfig(outputPath: string): Promise<void> {
  try {
    logger.debug({ outputPath }, 'Generating Playwright config');
    const template = await readTemplate('playwright-config.hbs');
    const content = renderTemplate(template, {});
    await writeGeneratedFile(outputPath, content, { format: true, fileType: 'typescript' });
    logger.info({ outputPath }, 'Playwright config generated');
  } catch (error) {
    logger.error({ outputPath, error }, 'Failed to generate Playwright config');
    throw error;
  }
}

/**
 * Generates TypeScript configuration file
 */
export async function generateTypeScriptConfig(outputPath: string): Promise<void> {
  try {
    logger.debug({ outputPath }, 'Generating TypeScript config');
    const template = await readTemplate('tsconfig.hbs');
    const content = renderTemplate(template, {});
    await writeGeneratedFile(outputPath, content, { format: true, fileType: 'json' });
    logger.info({ outputPath }, 'TypeScript config generated');
  } catch (error) {
    logger.error({ outputPath, error }, 'Failed to generate TypeScript config');
    throw error;
  }
}

/**
 * Generates package.json file
 */
export async function generatePackageJson(outputPath: string, projectName: string = 'salesforce-tests'): Promise<void> {
  try {
    logger.debug({ outputPath, projectName }, 'Generating package.json');
    const template = await readTemplate('package-json.hbs');
    const content = renderTemplate(template, { projectName });
    await writeGeneratedFile(outputPath, content, { format: true, fileType: 'json' });
    logger.info({ outputPath }, 'package.json generated');
  } catch (error) {
    logger.error({ outputPath, error }, 'Failed to generate package.json');
    throw error;
  }
}

/**
 * Generates .env.example file
 */
export async function generateEnvExample(outputPath: string): Promise<void> {
  try {
    logger.debug({ outputPath }, 'Generating .env.example');
    const template = await readTemplate('env-example.hbs');
    const content = renderTemplate(template, {});
    await writeGeneratedFile(outputPath, content, { format: false });
    logger.info({ outputPath }, '.env.example generated');
  } catch (error) {
    logger.error({ outputPath, error }, 'Failed to generate .env.example');
    throw error;
  }
}

/**
 * Generates .gitignore file
 */
export async function generateGitignore(outputPath: string): Promise<void> {
  try {
    logger.debug({ outputPath }, 'Generating .gitignore');
    const template = await readTemplate('gitignore.hbs');
    const content = renderTemplate(template, {});
    await writeGeneratedFile(outputPath, content, { format: false });
    logger.info({ outputPath }, '.gitignore generated');
  } catch (error) {
    logger.error({ outputPath, error }, 'Failed to generate .gitignore');
    throw error;
  }
}

/**
 * Generates README.md file
 */
export async function generateReadme(outputPath: string, projectName: string = 'salesforce-tests'): Promise<void> {
  try {
    logger.debug({ outputPath, projectName }, 'Generating README.md');
    const template = await readTemplate('readme.hbs');
    const content = renderTemplate(template, { projectName });
    await writeGeneratedFile(outputPath, content, { format: false });
    logger.info({ outputPath }, 'README.md generated');
  } catch (error) {
    logger.error({ outputPath, error }, 'Failed to generate README.md');
    throw error;
  }
}

