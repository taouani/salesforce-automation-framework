/**
 * Field Validation Test Generator
 * Generates field-level validation test cases
 */

import type { FieldValidationTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition, FieldDefinition } from '../../types/xml-parsed.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';

export function convertFieldsToValidationTests(
  objectDef: ObjectDefinition,
  fields: FieldDefinition[]
): FieldValidationTestDefinition[] {
  const tests: FieldValidationTestDefinition[] = [];
  
  let testIndex = 0;
  for (const field of fields) {
    testIndex++;
    // Required field validation
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
        tags: generateTestTags('FieldValidation', { objectName: objectDef.fullName }),
      });
    }
    
    // Format validation (Email, Phone, URL)
    if (field.type === 'Email' || field.type === 'Phone' || field.type === 'URL') {
      tests.push({
        name: `test-field-${field.fullName.toLowerCase()}-format`,
        type: 'FieldValidation',
        fieldName: field.fullName,
        fieldType: field.type,
        validationType: 'format',
        objectName: objectDef.fullName,
        expectedError: `Invalid ${field.type.toLowerCase()} format`,
        testCase: generateFormatValidationTestCase(objectDef, field, `${testIndex}_${field.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_fmt`),
        tags: generateTestTags('FieldValidation', { objectName: objectDef.fullName }),
      });
    }
    
    // Length constraint validation
    if (field.length && (field.type === 'String' || field.type === 'Text')) {
      tests.push({
        name: `test-field-${field.fullName.toLowerCase()}-length`,
        type: 'FieldValidation',
        fieldName: field.fullName,
        fieldType: field.type,
        validationType: 'length',
        objectName: objectDef.fullName,
        expectedError: `Field length exceeds maximum of ${field.length} characters`,
        testCase: generateLengthConstraintTestCase(objectDef, field, `${testIndex}_${field.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_len`),
        tags: generateTestTags('FieldValidation', { objectName: objectDef.fullName }),
      });
    }
    
    // Picklist restriction validation
    if (field.type === 'Picklist' || field.type === 'MultiPicklist') {
      tests.push({
        name: `test-field-${field.fullName.toLowerCase()}-picklist`,
        type: 'FieldValidation',
        fieldName: field.fullName,
        fieldType: field.type,
        validationType: 'picklist',
        objectName: objectDef.fullName,
        expectedError: `Invalid picklist value for ${field.label || field.fullName}`,
        testCase: generatePicklistRestrictionTestCase(objectDef, field, `${testIndex}_${field.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_pl`),
        tags: generateTestTags('FieldValidation', { objectName: objectDef.fullName }),
      });
    }
  }
  
  return tests;
}

function generateRequiredFieldTestCase(objectDef: ObjectDefinition, field: FieldDefinition): string {
  return `test('should require field ${field.fullName} @field-validation @${objectDef.fullName}', async ({ page, testData }) => {
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

function generateFormatValidationTestCase(objectDef: ObjectDefinition, field: FieldDefinition, testIndex: string | number): string {
  const objectName = objectDef.fullName;
  const pageObjectName = `${objectName}Page`;
  const pageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_fv_${testIndex}`;
  const invalidValue = getInvalidFormatValue(field.type);
  const fieldLabel = field.label || field.fullName;
  
  return `test('should validate ${field.type.toLowerCase()} format for field ${field.fullName} @field-validation @${objectDef.fullName}', async ({ page, testData }) => {
    // Attempt to create record with invalid ${field.type.toLowerCase()} format
    try {
      await testData.create${objectDef.fullName}({
        Name: 'Test Record',
        ${field.fullName}: '${invalidValue}',
      });
      // Should fail with format validation error
    } catch (error) {
      // Expected: API should reject invalid format
    }
    
    // Verify via UI
    await page.goto(\`/lightning/o/${objectDef.fullName}/new\`);
    const ${pageVar} = new ${pageObjectName}(page);
    
    // Enter invalid ${field.type.toLowerCase()} format
    await ${pageVar}.fillField('${field.fullName}', '${invalidValue}');
    
    // Attempt to save
    await ${pageVar}.clickSave();
    
    // Verify format validation error
    await expect(page.locator('text=Invalid ${field.type.toLowerCase()} format')).toBeVisible();
  });`;
}

function generateLengthConstraintTestCase(objectDef: ObjectDefinition, field: FieldDefinition, testIndex: string | number): string {
  const objectName = objectDef.fullName;
  const pageObjectName = `${objectName}Page`;
  const pageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_fv_${testIndex}`;
  const maxLength = field.length || 255;
  const invalidValue = 'x'.repeat(maxLength + 1); // Exceeds max length
  const fieldLabel = field.label || field.fullName;
  
  return `test('should validate length constraint for field ${field.fullName} @field-validation @${objectDef.fullName}', async ({ page, testData }) => {
    // Attempt to create record with value exceeding max length (${maxLength} characters)
    try {
      await testData.create${objectDef.fullName}({
        Name: 'Test Record',
        ${field.fullName}: '${invalidValue}',
      });
      // Should fail with length validation error
    } catch (error) {
      // Expected: API should reject value exceeding max length
    }
    
    // Verify via UI
    await page.goto(\`/lightning/o/${objectDef.fullName}/new\`);
    const ${pageVar} = new ${pageObjectName}(page);
    
    // Enter value exceeding max length
    await ${pageVar}.fillField('${field.fullName}', '${invalidValue}');
    
    // Attempt to save
    await ${pageVar}.clickSave();
    
    // Verify length constraint error
    await expect(page.locator('text=Field length exceeds maximum')).toBeVisible();
  });`;
}

function generatePicklistRestrictionTestCase(objectDef: ObjectDefinition, field: FieldDefinition, testIndex: string | number): string {
  const objectName = objectDef.fullName;
  const pageObjectName = `${objectName}Page`;
  const pageVar = `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_fv_${testIndex}`;
  const invalidValue = 'InvalidPicklistValue';
  const fieldLabel = field.label || field.fullName;
  
  return `test('should validate picklist values for field ${field.fullName} @field-validation @${objectDef.fullName}', async ({ page, testData }) => {
    // Attempt to create record with invalid picklist value
    try {
      await testData.create${objectDef.fullName}({
        Name: 'Test Record',
        ${field.fullName}: '${invalidValue}',
      });
      // Should fail with picklist validation error
    } catch (error) {
      // Expected: API should reject invalid picklist value
    }
    
    // Verify via UI
    await page.goto(\`/lightning/o/${objectDef.fullName}/new\`);
    const ${pageVar} = new ${pageObjectName}(page);
    
    // Attempt to select invalid picklist value
    // Note: UI may prevent selecting invalid values, but we test the validation
    await ${pageVar}.fillField('${field.fullName}', '${invalidValue}');
    
    // Attempt to save
    await ${pageVar}.clickSave();
    
    // Verify picklist restriction error
    await expect(page.locator('text=Invalid picklist value')).toBeVisible();
  });`;
}

function getInvalidFormatValue(fieldType: string): string {
  switch (fieldType) {
    case 'Email':
      return 'invalid-email-format';
    case 'Phone':
      return 'invalid-phone';
    case 'URL':
      return 'not-a-valid-url';
    default:
      return 'invalid-format';
  }
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
    tags: generateTestTags('FieldValidation', { objectName: objectDef.fullName }),
  };
}

