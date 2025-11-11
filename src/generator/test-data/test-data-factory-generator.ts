/**
 * Test Data Factory Generator
 * Generates factory functions for creating test data using Salesforce REST API
 */

import type {
  TestDataFactoryDefinition,
  TestDataHelperDefinition,
  ParameterDefinition,
} from '../../types/test-generation.js';
import type { ObjectDefinition, Relationship } from '../../types/xml-parsed.js';
import { logger } from '../../utils/logger.js';

/**
 * Generates a factory function for creating records of a specific object type
 */
export function generateTestDataFactory(
  objectDef: ObjectDefinition
): TestDataFactoryDefinition {
  const objectName = objectDef.fullName;
  const functionName = `create${objectName}`;
  
  // Determine required fields (excluding system fields)
  const requiredFields = objectDef.fields.filter(
    field => field.required && !field.fullName.endsWith('__c') && !isSystemField(field.fullName)
  );
  
  // Build parameters from required fields
  const parameters: ParameterDefinition[] = requiredFields.map(field => ({
    name: field.fullName.toLowerCase(),
    type: getTypeScriptType(field.type),
    optional: false,
    description: field.label || field.fullName,
  }));
  
  // Add optional data parameter
  parameters.push({
    name: 'additionalData',
    type: 'Record<string, unknown>',
    optional: true,
    defaultValue: '{}',
    description: 'Additional field values to set on the record',
  });
  
  // Build implementation
  const fieldAssignments = requiredFields.map(field => {
    const paramName = field.fullName.toLowerCase();
    return `      ${field.fullName}: ${paramName},`;
  }).join('\n');
  
  const implementation = `/**
 * Creates a ${objectName} record using Salesforce REST API
 * @param ${parameters.slice(0, -1).map(p => `${p.name}: ${p.type}`).join(', ')}
 * @param additionalData - Additional field values to set on the record
 * @returns Promise with the created record ID
 */
export async function ${functionName}(
  ${parameters.map(p => {
    // If parameter has a default value, don't use '?' (optional marker)
    // TypeScript doesn't allow both '?' and '=' together
    if (p.defaultValue) {
      return `${p.name}: ${p.type} = ${p.defaultValue}`;
    }
    return `${p.name}${p.optional ? '?' : ''}: ${p.type}`;
  }).join(',\n  ')}
): Promise<string> {
  const auth = await authenticate();
  const client = new SalesforceRESTAPIClient(auth);
  
  const recordData: Record<string, unknown> = {
${fieldAssignments}
    ...additionalData,
  };
  
  return await client.createRecord('${objectName}', recordData);
}`;

  return {
    objectName,
    functionName,
    parameters,
    returnType: 'Promise<string>',
    implementation,
    usesAPI: true,
  };
}

/**
 * Generates a helper function for creating related records
 */
export function generateRelationshipHelper(
  relationship: Relationship,
  parentObjectName: string,
  childObjectName: string
): TestDataHelperDefinition {
  const helperName = `create${childObjectName}For${parentObjectName}`;
  const relationshipField = relationship.fieldName;
  
  const implementation = `/**
 * Creates a ${childObjectName} record related to a ${parentObjectName} record
 * @param ${parentObjectName.toLowerCase()}Id - The ID of the parent ${parentObjectName} record
 * @param additionalData - Additional field values to set on the ${childObjectName} record
 * @returns Promise with the created ${childObjectName} record ID
 */
export async function ${helperName}(
  ${parentObjectName.toLowerCase()}Id: string,
  additionalData: Record<string, unknown> = {}
): Promise<string> {
  const auth = await authenticate();
  const client = new SalesforceRESTAPIClient(auth);
  
  const recordData: Record<string, unknown> = {
    ${relationshipField}: ${parentObjectName.toLowerCase()}Id,
    ...additionalData,
  };
  
  return await client.createRecord('${childObjectName}', recordData);
}`;

  return {
    helperName,
    purpose: 'createRelated',
    parameters: [
      {
        name: `${parentObjectName.toLowerCase()}Id`,
        type: 'string',
        description: `The ID of the parent ${parentObjectName} record`,
      },
      {
        name: 'additionalData',
        type: 'Record<string, unknown>',
        optional: true,
        defaultValue: '{}',
        description: `Additional field values to set on the ${childObjectName} record`,
      },
    ],
    returnType: 'Promise<string>',
    implementation,
    usesAPI: true,
  };
}

/**
 * Generates a cleanup function for deleting test records
 */
export function generateCleanupFunction(objectName: string): TestDataHelperDefinition {
  const helperName = `delete${objectName}`;
  
  const implementation = `/**
 * Deletes a ${objectName} record using Salesforce REST API
 * @param recordId - The ID of the record to delete
 * @returns Promise that resolves when the record is deleted
 */
export async function ${helperName}(recordId: string): Promise<void> {
  const auth = await authenticate();
  const client = new SalesforceRESTAPIClient(auth);
  
  await client.deleteRecord('${objectName}', recordId);
}`;

  return {
    helperName,
    purpose: 'cleanup',
    parameters: [
      {
        name: 'recordId',
        type: 'string',
        description: 'The ID of the record to delete',
      },
    ],
    returnType: 'Promise<void>',
    implementation,
    usesAPI: true,
  };
}

/**
 * Generates all test data factories and helpers for an object
 */
export function generateTestDataFactoriesForObject(
  objectDef: ObjectDefinition,
  relationships: Relationship[] = []
): {
  factory: TestDataFactoryDefinition;
  helpers: TestDataHelperDefinition[];
  cleanup: TestDataHelperDefinition;
} {
  const factory = generateTestDataFactory(objectDef);
  
  const helpers: TestDataHelperDefinition[] = relationships.map(rel => {
    // Determine parent and child objects
    const isMasterDetail = rel.type === 'MasterDetail';
    const parentObject = isMasterDetail ? rel.relatedObject : objectDef.fullName;
    const childObject = isMasterDetail ? objectDef.fullName : rel.relatedObject;
    
    return generateRelationshipHelper(rel, parentObject, childObject);
  });
  
  const cleanup = generateCleanupFunction(objectDef.fullName);
  
  logger.debug(
    { objectName: objectDef.fullName, factoryCount: 1, helperCount: helpers.length },
    'Generated test data factories and helpers'
  );
  
  return { factory, helpers, cleanup };
}

/**
 * Helper function to check if a field is a system field
 */
function isSystemField(fieldName: string): boolean {
  const systemFields = ['Id', 'CreatedDate', 'LastModifiedDate', 'CreatedById', 'LastModifiedById', 'SystemModstamp'];
  return systemFields.includes(fieldName);
}

/**
 * Converts Salesforce field type to TypeScript type
 */
function getTypeScriptType(salesforceType: string): string {
  const typeMap: Record<string, string> = {
    'String': 'string',
    'Text': 'string',
    'LongTextArea': 'string',
    'RichTextArea': 'string',
    'Email': 'string',
    'Phone': 'string',
    'URL': 'string',
    'Picklist': 'string',
    'MultiPicklist': 'string',
    'Currency': 'number',
    'Number': 'number',
    'Percent': 'number',
    'Double': 'number',
    'Integer': 'number',
    'Date': 'Date',
    'DateTime': 'Date',
    'Checkbox': 'boolean',
    'Boolean': 'boolean',
  };
  
  return typeMap[salesforceType] || 'string';
}

