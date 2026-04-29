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
import { generateTestDataFactoryFunctionName, generateDeleteFunctionName, sanitizeVariableName, generateRelationshipHelperName } from '../name-sanitizer.js';

/**
 * Generates a factory function for creating records of a specific object type.
 *
 * Every factory takes a single `Record<string, unknown>` payload — required
 * fields are documented in JSDoc rather than enforced through positional
 * parameters. This was a deliberate change after the per-required-field
 * signature broke object-style call sites (e.g. `createUser({ Name: 'X' })`)
 * for objects with many required fields like `User` (15+ args).
 */
export function generateTestDataFactory(
  objectDef: ObjectDefinition,
): TestDataFactoryDefinition {
  const objectName = objectDef.fullName;
  const functionName = generateTestDataFactoryFunctionName(objectName);

  // We still surface the required-field list so callers know what to pass,
  // but it now lives in JSDoc instead of the function signature.
  const requiredFields = objectDef.fields.filter(
    (field) => field.required && !field.fullName.endsWith('__c') && !isSystemField(field.fullName),
  );

  const parameters: ParameterDefinition[] = [
    {
      name: 'data',
      type: 'Record<string, unknown>',
      optional: true,
      defaultValue: '{}',
      description: 'Field values to set on the record',
    },
  ];

  const requiredDoc = requiredFields.length
    ? requiredFields
        .map((f) => ` *   - ${f.fullName}${f.label ? ` (${f.label})` : ''}`)
        .join('\n')
    : ' *   (no required fields detected from XML metadata)';

  const implementation = `/**
 * Creates a ${objectName} record using the Salesforce REST API.
 *
 * Required fields (per the parsed XML metadata; the live org may differ —
 * run sf-scanner build with --org <alias> to enrich this list):
${requiredDoc}
 *
 * @param data - Field values to set on the record. Pass at minimum the
 *   required fields above plus any others your test needs.
 * @returns Promise with the created record ID.
 */
export async function ${functionName}(
  data: Record<string, unknown> = {},
): Promise<string> {
  const auth = await authenticate();
  const client = new SalesforceRESTAPIClient(auth);
  return await client.createRecord('${objectName}', { ...data });
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
  const helperName = generateRelationshipHelperName(parentObjectName, childObjectName);
  const relationshipField = relationship.fieldName;
  
  const paramName = sanitizeVariableName(`${parentObjectName}Id`);
  
  const implementation = `/**
 * Creates a ${childObjectName} record related to a ${parentObjectName} record
 * @param ${paramName} - The ID of the parent ${parentObjectName} record
 * @param additionalData - Additional field values to set on the ${childObjectName} record
 * @returns Promise with the created ${childObjectName} record ID
 */
export async function ${helperName}(
  ${paramName}: string,
  additionalData: Record<string, unknown> = {}
): Promise<string> {
  const auth = await authenticate();
  const client = new SalesforceRESTAPIClient(auth);
  
  const recordData: Record<string, unknown> = {
    ${relationshipField}: ${paramName},
    ...additionalData,
  };
  
  return await client.createRecord('${childObjectName}', recordData);
}`;

  return {
    helperName,
    purpose: 'createRelated',
    parameters: [
      {
        name: paramName,
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
  const helperName = generateDeleteFunctionName(objectName);
  
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


