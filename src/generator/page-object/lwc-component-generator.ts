/**
 * LWC Component Page Object Generator
 * Generates page object classes for Lightning Web Components
 */

import type { ComponentPageDefinition, ComponentLocatorDefinition } from '../../types/page-object.js';
import type { LWCComponentDefinition } from '../../types/lwc-parsed.js';
import { renderTemplate } from '../template-engine.js';
import { writeGeneratedFile } from '../file-generator.js';
import { readTemplate } from '../template-loader.js';
import { logger } from '../../utils/logger.js';
import { join } from 'path';

/**
 * Converts parsed LWC component definition to ComponentPageDefinition
 */
export function convertLWCToPageDefinition(
  componentDef: LWCComponentDefinition
): ComponentPageDefinition {
  const componentName = componentDef.metadata.name;
  
  // Generate locators from HTML template elements
  const locators: ComponentLocatorDefinition[] = [];
  
  if (componentDef.html) {
    // Generate locators for HTML elements with data-testid or other identifiable attributes
    componentDef.html.elements?.forEach((element) => {
      if (element.attributes?.['data-testid']) {
        locators.push({
          name: element.attributes['data-testid'].replace(/-/g, ''),
          strategy: 'getByTestId' as any,
          selector: element.attributes['data-testid'],
          componentName,
          componentType: 'LWC',
        });
      }
    });
  }

  return {
    name: `${componentName}ComponentPage`,
    type: 'LWC',
    componentName,
    componentType: 'LWC',
    locators,
    methods: [],
    properties: componentDef.javascript?.properties?.reduce((acc, prop) => {
      acc[prop.name] = { type: prop.type || 'any', required: prop.required };
      return acc;
    }, {} as Record<string, unknown>) || {},
    events: componentDef.javascript?.methods?.filter(m => m.name.startsWith('handle')).map(m => m.name) || [],
    nestedComponents: componentDef.html?.elements?.filter(e => e.tagName?.startsWith('c-')).map(e => e.tagName || '') || [],
  };
}

/**
 * Generates a page object class for an LWC component
 */
export async function generateLWCComponentPageObject(
  outputDir: string,
  componentDef: LWCComponentDefinition
): Promise<string> {
  try {
    const pageDefinition = convertLWCToPageDefinition(componentDef);
    const template = await readTemplate('page-object/lwc-component.hbs');
    const content = renderTemplate(template, {
      definition: pageDefinition,
      component: componentDef,
    });
    
    const className = pageDefinition.name;
    const fileName = `${className.charAt(0).toLowerCase() + className.slice(1).replace('ComponentPage', '-component-page')}.ts`;
    const filePath = join(outputDir, 'pages', 'components', 'lwc', fileName);
    
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath, componentName: componentDef.metadata.name }, 'LWC component page object generated');
    
    return filePath;
  } catch (error) {
    logger.error({ outputDir, componentName: componentDef.metadata.name, error }, 'Failed to generate LWC component page object');
    throw error;
  }
}

