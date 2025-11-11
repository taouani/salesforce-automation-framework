/**
 * Code Generation Engine for Page Object Model
 * Orchestrates the generation of all page object types
 */

import type { GenerationConfig, GenerationResult, GeneratedFileDefinition, GenerationError } from '../../types/page-object.js';
import type { ObjectDefinition } from '../../types/xml-parsed.js';
import type { LWCComponentDefinition } from '../../types/lwc-parsed.js';
import type { AuraComponentDefinition } from '../../types/aura-parsed.js';
import type { FlowDefinition } from '../../types/flow-parsed.js';
import { generateBaseObjectPage, generateBaseLightningPage, generateBaseComponentPage, generateBaseFlowScreen } from './base-page-generator.js';
import { generateObjectPageObjects } from './object-page-generator.js';
import { generateLWCComponentPageObject } from './lwc-component-generator.js';
import { generateAuraComponentPageObject } from './aura-component-generator.js';
import { generateFlowScreenPageObject } from './flow-screen-generator.js';
import { logger } from '../../utils/logger.js';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import type { BaseObjectPageDefinition, BaseLightningPageDefinition, BaseComponentPageDefinition, BaseFlowScreenDefinition } from '../../types/page-object.js';

/**
 * Generates all page objects based on parsed metadata
 */
export async function generatePageObjects(
  config: GenerationConfig,
  metadata: {
    objects?: ObjectDefinition[];
    lwcComponents?: LWCComponentDefinition[];
    auraComponents?: AuraComponentDefinition[];
    flows?: FlowDefinition[];
  }
): Promise<GenerationResult> {
  const generatedFiles: GeneratedFileDefinition[] = [];
  const errors: GenerationError[] = [];
  const warnings: string[] = [];

  try {
    // Ensure output directory exists
    await mkdir(config.outputDirectory, { recursive: true });
    
    // Determine base pages directory - if outputDirectory already ends with 'pages', use it directly
    const pagesBaseDir = config.outputDirectory.endsWith('pages') || config.outputDirectory.endsWith('pages/')
      ? config.outputDirectory
      : join(config.outputDirectory, 'pages');
    
    await mkdir(pagesBaseDir, { recursive: true });
    await mkdir(join(pagesBaseDir, 'base'), { recursive: true });
    await mkdir(join(pagesBaseDir, 'objects'), { recursive: true });
    await mkdir(join(pagesBaseDir, 'lightning'), { recursive: true });
    await mkdir(join(pagesBaseDir, 'components', 'lwc'), { recursive: true });
    await mkdir(join(pagesBaseDir, 'components', 'aura'), { recursive: true });
    await mkdir(join(pagesBaseDir, 'flows'), { recursive: true });
    
    // Generate base page object classes
    logger.info('Generating base page object classes...');
    try {
      const baseObjectPageDef: BaseObjectPageDefinition = {
        name: 'BaseObjectPage',
        type: 'Object',
        locators: [],
        methods: [],
      };
      const baseObjectPagePath = await generateBaseObjectPage(pagesBaseDir, baseObjectPageDef);
      generatedFiles.push({
        path: baseObjectPagePath,
        content: '', // Content is in the file
        type: 'pageObject',
      });

      const baseLightningPageDef: BaseLightningPageDefinition = {
        name: 'BaseLightningPage',
        type: 'Lightning',
        locators: [],
        methods: [],
      };
      const baseLightningPagePath = await generateBaseLightningPage(pagesBaseDir, baseLightningPageDef);
      generatedFiles.push({
        path: baseLightningPagePath,
        content: '',
        type: 'pageObject',
      });

      const baseComponentPageDef: BaseComponentPageDefinition = {
        name: 'BaseComponentPage',
        type: 'LWC',
        locators: [],
        methods: [],
      };
      const baseComponentPagePath = await generateBaseComponentPage(pagesBaseDir, baseComponentPageDef);
      generatedFiles.push({
        path: baseComponentPagePath,
        content: '',
        type: 'pageObject',
      });

      const baseFlowScreenDef: BaseFlowScreenDefinition = {
        name: 'BaseFlowScreen',
        type: 'Flow',
        locators: [],
        methods: [],
      };
      const baseFlowScreenPath = await generateBaseFlowScreen(pagesBaseDir, baseFlowScreenDef);
      generatedFiles.push({
        path: baseFlowScreenPath,
        content: '',
        type: 'pageObject',
      });
    } catch (error) {
      errors.push({
        file: 'base-page-objects',
        errorMessage: error instanceof Error ? error.message : String(error),
        errorType: 'compilation',
      });
      logger.error({ error }, 'Failed to generate base page object classes');
    }

    // Generate object page objects
    if (metadata.objects && metadata.objects.length > 0) {
      logger.info({ count: metadata.objects.length }, 'Generating object page objects...');
      try {
        const objectPagePaths = await generateObjectPageObjects(config.outputDirectory, metadata.objects);
        objectPagePaths.forEach((path) => {
          generatedFiles.push({
            path,
            content: '',
            type: 'pageObject',
          });
        });
      } catch (error) {
        errors.push({
          file: 'object-page-objects',
          errorMessage: error instanceof Error ? error.message : String(error),
          errorType: 'compilation',
        });
        logger.error({ error }, 'Failed to generate object page objects');
      }
    } else {
      warnings.push('No object metadata provided, skipping object page object generation');
    }

    // Generate LWC component page objects
    if (metadata.lwcComponents && metadata.lwcComponents.length > 0) {
      logger.info({ count: metadata.lwcComponents.length }, 'Generating LWC component page objects...');
      try {
        for (const component of metadata.lwcComponents) {
          try {
            const componentPagePath = await generateLWCComponentPageObject(pagesBaseDir, component);
            generatedFiles.push({
              path: componentPagePath,
              content: '',
              type: 'pageObject',
            });
          } catch (error) {
            logger.warn({ componentName: component.metadata.name, error }, 'Failed to generate LWC component page object, skipping');
          }
        }
      } catch (error) {
        errors.push({
          file: 'lwc-component-page-objects',
          errorMessage: error instanceof Error ? error.message : String(error),
          errorType: 'compilation',
        });
        logger.error({ error }, 'Failed to generate LWC component page objects');
      }
    } else {
      warnings.push('No LWC component metadata provided, skipping LWC component page object generation');
    }

    // Generate Aura component page objects
    if (metadata.auraComponents && metadata.auraComponents.length > 0) {
      logger.info({ count: metadata.auraComponents.length }, 'Generating Aura component page objects...');
      try {
        for (const component of metadata.auraComponents) {
          try {
            const componentPagePath = await generateAuraComponentPageObject(pagesBaseDir, component);
            generatedFiles.push({
              path: componentPagePath,
              content: '',
              type: 'pageObject',
            });
          } catch (error) {
            logger.warn({ componentName: component.metadata.name, error }, 'Failed to generate Aura component page object, skipping');
          }
        }
      } catch (error) {
        errors.push({
          file: 'aura-component-page-objects',
          errorMessage: error instanceof Error ? error.message : String(error),
          errorType: 'compilation',
        });
        logger.error({ error }, 'Failed to generate Aura component page objects');
      }
    } else {
      warnings.push('No Aura component metadata provided, skipping Aura component page object generation');
    }

    // Generate Flow screen page objects
    if (metadata.flows && metadata.flows.length > 0) {
      logger.info({ count: metadata.flows.length }, 'Generating Flow screen page objects...');
      try {
        for (const flow of metadata.flows) {
          if (flow.screens && Array.isArray(flow.screens)) {
            for (const screen of flow.screens) {
              try {
                const screenPagePath = await generateFlowScreenPageObject(pagesBaseDir, flow.name || flow.apiName || 'Flow', screen);
                generatedFiles.push({
                  path: screenPagePath,
                  content: '',
                  type: 'pageObject',
                });
              } catch (error) {
                logger.warn({ flowName: flow.name, screenName: screen.screenElement, error }, 'Failed to generate Flow screen page object, skipping');
              }
            }
          }
        }
      } catch (error) {
        errors.push({
          file: 'flow-screen-page-objects',
          errorMessage: error instanceof Error ? error.message : String(error),
          errorType: 'compilation',
        });
        logger.error({ error }, 'Failed to generate Flow screen page objects');
      }
    } else {
      warnings.push('No Flow metadata provided, skipping Flow screen page object generation');
    }

    logger.info(
      {
        generatedFiles: generatedFiles.length,
        errors: errors.length,
        warnings: warnings.length,
      },
      'Page object generation completed'
    );

    return {
      generatedFiles,
      errors,
      warnings,
      summary: {
        totalFiles: generatedFiles.length,
        successfulFiles: generatedFiles.length - errors.length,
        failedFiles: errors.length,
        totalErrors: errors.length,
        totalWarnings: warnings.length,
      },
    };
  } catch (error) {
    logger.error({ error }, 'Fatal error during page object generation');
    throw error;
  }
}

