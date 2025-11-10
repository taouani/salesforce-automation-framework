/**
 * Aura Component Page Object Generator
 * Generates page object classes for Aura components
 */

import type { ComponentPageDefinition, ComponentLocatorDefinition } from '../../types/page-object.js';
import type { AuraComponentDefinition } from '../../types/aura-parsed.js';
import { renderTemplate } from '../template-engine.js';
import { writeGeneratedFile } from '../file-generator.js';
import { readTemplate } from '../template-loader.js';
import { logger } from '../../utils/logger.js';
import { join } from 'path';

/**
 * Converts parsed Aura component definition to ComponentPageDefinition
 */
export function convertAuraToPageDefinition(
  componentDef: AuraComponentDefinition
): ComponentPageDefinition {
  const componentName = componentDef.metadata.name;
  
  // Generate locators from markup
  const locators: ComponentLocatorDefinition[] = [];
  
  if (componentDef.markup) {
    // Generate locators for component references
    componentDef.markup.componentReferences?.forEach((ref) => {
      locators.push({
        name: ref.componentName.charAt(0).toLowerCase() + ref.componentName.slice(1),
        strategy: 'css' as any,
        selector: `.c${ref.componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}`,
        componentName: ref.componentName,
        componentType: 'Aura',
        attributes: ref.attributes,
      });
    });
  }

  return {
    name: `${componentName}ComponentPage`,
    type: 'Aura',
    componentName,
    componentType: 'Aura',
    locators,
    methods: [],
    properties: componentDef.markup?.attributes?.reduce((acc, attr) => {
      acc[attr.name] = { type: attr.type || 'any', required: attr.required };
      return acc;
    }, {} as Record<string, unknown>) || {},
    events: componentDef.markup?.handlers?.map(h => h.name) || [],
    nestedComponents: componentDef.markup?.componentReferences?.map(ref => ref.componentName) || [],
  };
}

/**
 * Generates a page object class for an Aura component
 */
export async function generateAuraComponentPageObject(
  outputDir: string,
  componentDef: AuraComponentDefinition
): Promise<string> {
  try {
    const pageDefinition = convertAuraToPageDefinition(componentDef);
    const template = await readTemplate('page-object/aura-component.hbs');
    const content = renderTemplate(template, {
      definition: pageDefinition,
      component: componentDef,
    });
    
    const className = pageDefinition.name;
    const fileName = `${className.charAt(0).toLowerCase() + className.slice(1).replace('ComponentPage', '-component-page')}.ts`;
    const filePath = join(outputDir, 'pages', 'components', 'aura', fileName);
    
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath, componentName: componentDef.metadata.name }, 'Aura component page object generated');
    
    return filePath;
  } catch (error) {
    logger.error({ outputDir, componentName: componentDef.metadata.name, error }, 'Failed to generate Aura component page object');
    throw error;
  }
}

