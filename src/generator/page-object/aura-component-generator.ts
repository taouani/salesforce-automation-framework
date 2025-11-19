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
import { sanitizeClassName, generateFileNameFromClassName } from '../name-sanitizer.js';

/**
 * Maps Apex/Salesforce types to TypeScript types
 */
function mapApexTypeToTypeScript(apexType: string): string {
  const typeMap: Record<string, string> = {
    'String': 'string',
    'Integer': 'number',
    'Double': 'number',
    'Decimal': 'number',
    'Long': 'number',
    'Boolean': 'boolean',
    'Date': 'Date',
    'DateTime': 'Date',
    'List': 'any[]',
    'Set': 'any[]',
    'Map': 'Record<string, any>',
    'Object': 'any',
    'Id': 'string',
    'Blob': 'string',
  };
  
  // Handle generic types like List<String>, Map<String, Integer>
  if (apexType.includes('<')) {
    const baseType = apexType.split('<')[0].trim();
    const mappedBase = typeMap[baseType] || 'any';
    return `${mappedBase}[]`;
  }
  
  // Handle array notation like String[]
  if (apexType.endsWith('[]')) {
    const baseType = apexType.slice(0, -2);
    return `${mapApexTypeToTypeScript(baseType)}[]`;
  }
  
  // Check if it's a mapped type
  if (typeMap[apexType]) {
    return typeMap[apexType];
  }
  
  // Custom Salesforce object types (end with __c) or other Apex types should be 'any'
  // This includes types like PRSCO_Prescription__c, Account, Contact, etc.
  return 'any';
}

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

  const sanitizedComponentName = sanitizeClassName(componentName);
  
  return {
    name: `${sanitizedComponentName}ComponentPage`,
    type: 'Aura',
    componentName,
    componentType: 'Aura',
    locators,
    methods: [],
    properties: componentDef.markup?.attributes?.reduce((acc, attr) => {
      // Map Salesforce/Apex types to TypeScript types
      const tsType = mapApexTypeToTypeScript(attr.type || 'any');
      acc[attr.name] = { type: tsType, required: attr.required };
      return acc;
    }, {} as Record<string, unknown>) || {},
    events: [...new Set(componentDef.markup?.handlers?.map(h => h.name) || [])], // Remove duplicates
    nestedComponents: componentDef.markup?.componentReferences?.map(ref => ref.componentName) || [],
  };
}

/**
 * Reserved component names that should not have page objects generated
 * (to avoid conflicts with base classes)
 */
const RESERVED_COMPONENT_NAMES = new Set([
  'Base',
  'BaseObject',
  'BaseLightning',
  'BaseComponent',
  'BaseFlow',
  'BasePage',
]);

/**
 * Generates a page object class for an Aura component
 */
export async function generateAuraComponentPageObject(
  outputDir: string,
  componentDef: AuraComponentDefinition
): Promise<string> {
  const componentName = componentDef.metadata.name;
  
  // Skip reserved component names to avoid conflicts with base classes
  if (RESERVED_COMPONENT_NAMES.has(componentName)) {
    logger.warn({ componentName }, 'Skipping reserved component name to avoid conflicts with base classes');
    throw new Error(`Cannot generate page object for reserved component name: ${componentName}`);
  }
  
  try {
    const pageDefinition = convertAuraToPageDefinition(componentDef);
    const template = await readTemplate('page-object/aura-component.hbs');
    const content = renderTemplate(template, {
      definition: pageDefinition,
      component: componentDef,
    });
    
    const className = pageDefinition.name;
    const fileName = `${generateFileNameFromClassName(className, '-component-page')}.ts`;
    // If outputDir already ends with 'pages', don't add it again
    const baseDir = outputDir.endsWith('pages') || outputDir.endsWith('pages/') ? outputDir : join(outputDir, 'pages');
    const filePath = join(baseDir, 'components', 'aura', fileName);
    
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath, componentName: componentDef.metadata.name }, 'Aura component page object generated');
    
    return filePath;
  } catch (error) {
    logger.error({ outputDir, componentName: componentDef.metadata.name, error }, 'Failed to generate Aura component page object');
    throw error;
  }
}

