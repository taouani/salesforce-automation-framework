/**
 * Main generator module - orchestrates all generation tasks
 */

import { generateFolderStructure } from './folder-structure.js';
import {
  generatePlaywrightConfig,
  generateTypeScriptConfig,
  generatePackageJson,
  generateEnvExample,
  generateGitignore,
  generateReadme,
} from './config-generators.js';
import { generateAllUtilities } from './utility-generators.js';
import { generateBasePage } from './basepage-generator.js';
import { logger } from '../utils/logger.js';
import { join } from 'path';

/**
 * Configuration for test structure generation
 */
export interface GenerateConfig {
  outputPath: string;
  force?: boolean;
  projectName?: string;
}

/**
 * Generates complete test structure
 */
export async function generateTestStructure(config: GenerateConfig): Promise<void> {
  const { outputPath, force = false, projectName = 'salesforce-tests' } = config;

  try {
    logger.info({ outputPath, force, projectName }, 'Starting test structure generation');

    // Generate folder structure
    await generateFolderStructure(outputPath, { force });

    // Generate configuration files
    await generatePlaywrightConfig(join(outputPath, 'playwright.config.ts'));
    await generateTypeScriptConfig(join(outputPath, 'tsconfig.json'));
    await generatePackageJson(join(outputPath, 'package.json'), projectName);
    await generateEnvExample(join(outputPath, '.env.example'));
    await generateGitignore(join(outputPath, '.gitignore'));
    await generateReadme(join(outputPath, 'README.md'), projectName);

    // Generate utility files
    await generateAllUtilities(outputPath);

    // Generate BasePage
    await generateBasePage(outputPath);

    logger.info({ outputPath }, 'Test structure generation completed successfully');
  } catch (error) {
    logger.error({ outputPath, error }, 'Test structure generation failed');
    throw error;
  }
}

