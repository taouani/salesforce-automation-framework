/**
 * Field Validation Test Generator
 * Generates field-level validation test cases
 */

import type { FieldValidationTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition, FieldDefinition } from '../../types/xml-parsed.js';

export function convertFieldsToValidationTests(
  objectDef: ObjectDefinition,
  fields: FieldDefinition[]
): FieldValidationTestDefinition[] {
  const tests: FieldValidationTestDefinition[] = [];
  
  for (const field of fields) {
    if (field.required) {
      tests.push({
        name: `test-field-${field.fullName.toLowerCase()}-required`,
        type: 'FieldValidation',
        fieldName: field.fullName,
        fieldType: field.type,
        validationType: 'required',
        objectName: objectDef.fullName,
        expectedError: `${field.label || field.fullName} is required`,
        testCase: generateRequiredFieldTestCase(objectDef, field),
      });
    }
  }
  
  return tests;
}

function generateRequiredFieldTestCase(objectDef: ObjectDefinition, field: FieldDefinition): string {
  return `test('should require field ${field.fullName}', async ({ page, testData }) => {
    // Attempt to create record without required field
    try {
      await testData.create${objectDef.fullName}({
        // Missing required field: ${field.fullName}
      });
    } catch (error) {
      // Expected: API should reject missing required field
    }
    
    // Verify via UI
    await page.goto(\`/lightning/o/${objectDef.fullName}/new\`);
    // Leave ${field.fullName} empty
    // Attempt to save
    // Verify error message
  });`;
}

export function generateFieldValidationTestGroup(
  objectDef: ObjectDefinition,
  fields: FieldDefinition[]
): TestGroupDefinition {
  const tests = convertFieldsToValidationTests(objectDef, fields);
  
  return {
    groupName: `Field Validations - ${objectDef.fullName}`,
    testType: 'FieldValidation',
    tests,
  };
}

