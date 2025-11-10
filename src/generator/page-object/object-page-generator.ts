/**
 * Salesforce Object Page Object Generator
 * Generates page object classes for Salesforce objects based on parsed metadata
 */

import type { ObjectDefinition } from '../../types/xml-parsed.js';
import type { ObjectPageDefinition, FieldLocatorDefinition } from '../../types/page-object.js';
import { generateFieldLocator } from '../locator-generator.js';
import { renderTemplate } from '../template-engine.js';
import { writeGeneratedFile } from '../file-generator.js';
import { readTemplate } from '../template-loader.js';
import { logger } from '../../utils/logger.js';
import { join } from 'path';

/**
 * Converts parsed ObjectDefinition to ObjectPageDefinition
 */
export function convertObjectToPageDefinition(
  objectDef: ObjectDefinition
): ObjectPageDefinition {
  const fieldLocators: FieldLocatorDefinition[] = objectDef.fields.map((field) => {
    const fieldLabel = field.label || field.fullName;
    return generateFieldLocator(
      field.fullName,
      fieldLabel,
      field.type || 'String',
      {
        isRequired: field.required === true,
        isReadOnly: field.updateable === false,
      }
    );
  });

  return {
    name: `${objectDef.fullName}Page`,
    type: 'Object',
    objectName: objectDef.fullName,
    objectLabel: objectDef.label,
    locators: fieldLocators,
    fields: fieldLocators,
    methods: [], // Methods will be generated from template
    relationships: objectDef.relationships?.map((rel) => rel.relatedObject || '') || [],
    recordTypes: objectDef.recordTypes?.map((rt) => rt.fullName || '') || [],
  };
}

/**
 * Generates a page object class for a Salesforce object
 */
export async function generateObjectPageObject(
  outputDir: string,
  objectDef: ObjectDefinition
): Promise<string> {
  try {
    const pageDefinition = convertObjectToPageDefinition(objectDef);
    const template = await readTemplate('page-object/object-page.hbs');
    const content = renderTemplate(template, {
      definition: pageDefinition,
      object: objectDef,
    });
    
    const className = pageDefinition.name;
    const fileName = `${className.charAt(0).toLowerCase() + className.slice(1).replace('Page', '-page')}.ts`;
    const filePath = join(outputDir, 'pages', 'objects', fileName);
    
    await writeGeneratedFile(filePath, content, { format: true, fileType: 'typescript' });
    logger.debug({ filePath, objectName: objectDef.fullName }, 'Object page object generated');
    
    return filePath;
  } catch (error) {
    logger.error({ outputDir, objectName: objectDef.fullName, error }, 'Failed to generate object page object');
    throw error;
  }
}

/**
 * Generates page objects for multiple objects
 */
export async function generateObjectPageObjects(
  outputDir: string,
  objects: ObjectDefinition[]
): Promise<string[]> {
  const filePaths: string[] = [];
  
  for (const objectDef of objects) {
    try {
      const filePath = await generateObjectPageObject(outputDir, objectDef);
      filePaths.push(filePath);
    } catch (error) {
      logger.warn({ objectName: objectDef.fullName, error }, 'Failed to generate object page object, skipping');
    }
  }
  
  logger.info({ count: filePaths.length, total: objects.length }, 'Object page objects generated');
  return filePaths;
}

