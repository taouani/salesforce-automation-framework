/**
 * Flow Screen Page Object Generator
 * Generates page object classes for Flow screens
 */

import type { FlowScreenPageDefinition } from '../../types/page-object.js';
import type { FlowScreenDefinition } from '../../types/flow-parsed.js';
import { generateFieldLocator, generateButtonLocator } from '../locator-generator.js';
import { renderTemplate } from '../template-engine.js';
import { writeGeneratedFile } from '../file-generator.js';
import { readTemplate } from '../template-loader.js';
import { logger } from '../../utils/logger.js';
import { join } from 'path';

/**
 * Converts parsed Flow screen definition to FlowScreenPageDefinition
 */
export function convertFlowScreenToPageDefinition(
  flowName: string,
  screenDef: FlowScreenDefinition
): FlowScreenPageDefinition {
  const screenName = screenDef.screenElement || 'Screen';
  
  // Generate locators for screen fields
  const fieldLocators = Array.isArray(screenDef.fields) 
    ? screenDef.fields.map((field: any) => 
        generateFieldLocator(
          field.name || field.apiName || 'field',
          field.label || field.name || 'Field',
          field.dataType || 'String'
        )
      )
    : [];

  // Generate locators for navigation buttons
  const buttonLocators: any[] = [];
  if (screenDef.navigation) {
    if (screenDef.navigation.nextButton?.label) {
      buttonLocators.push(generateButtonLocator(screenDef.navigation.nextButton.label, 'next'));
    }
    if (screenDef.navigation.previousButton?.label) {
      buttonLocators.push(generateButtonLocator(screenDef.navigation.previousButton.label, 'previous'));
    }
  }

  return {
    name: `${flowName}${screenName}Page`,
    type: 'Flow',
    flowName,
    screenName,
    locators: [...fieldLocators, ...buttonLocators],
    methods: [],
    inputs: Array.isArray(screenDef.fields) 
      ? screenDef.fields.map((field: any) => ({
          name: field.name || field.apiName || 'field',
          type: field.dataType || 'String',
          label: field.label || field.name,
          required: field.required || false,
        }))
      : [],
    outputs: [],
    buttons: screenDef.navigation 
      ? [
          ...(screenDef.navigation.nextButton?.label ? [{ label: screenDef.navigation.nextButton.label, action: 'Next' }] : []),
          ...(screenDef.navigation.previousButton?.label ? [{ label: screenDef.navigation.previousButton.label, action: 'Previous' }] : []),
        ]
      : [],
  };
}

/**
 * Generates a page object class for a Flow screen
 */
export async function generateFlowScreenPageObject(
  outputDir: string,
  flowName: string,
  screenDef: FlowScreenDefinition
): Promise<string> {
  try {
    const pageDefinition = convertFlowScreenToPageDefinition(flowName, screenDef);
    const template = await readTemplate('page-object/flow-screen.hbs');
    const content = renderTemplate(template, {
      definition: pageDefinition,
      flowName,
      screen: screenDef,
    });
    
    const className = pageDefinition.name;
    const fileName = `${className.charAt(0).toLowerCase() + className.slice(1).replace('Page', '-page')}.ts`;
    const filePath = join(outputDir, 'pages', 'flows', fileName);
    
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath, flowName, screenName: screenDef.screenElement }, 'Flow screen page object generated');
    
    return filePath;
  } catch (error) {
    logger.error({ outputDir, flowName, screenName: screenDef.screenElement, error }, 'Failed to generate Flow screen page object');
    throw error;
  }
}

