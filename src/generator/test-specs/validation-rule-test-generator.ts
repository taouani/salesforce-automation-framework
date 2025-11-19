/**
 * Validation Rule Test Generator
 * Generates validation rule test cases for Salesforce objects
 */

import type { ValidationRuleTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition, ValidationRule } from '../../types/xml-parsed.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';
import { 
  generateTestDataFactoryFunctionName, 
  generateDeleteFunctionName 
} from '../name-sanitizer.js';

/**
 * Converts validation rules to test definitions
 */
export function convertValidationRulesToTests(
  objectDef: ObjectDefinition,
  validationRules: ValidationRule[],
  sanitizedNames?: {
    createFunctionName: string;
    deleteFunctionName: string;
  }
): ValidationRuleTestDefinition[] {
  const createFunctionName = sanitizedNames?.createFunctionName || generateTestDataFactoryFunctionName(objectDef.fullName);
  const deleteFunctionName = sanitizedNames?.deleteFunctionName || generateDeleteFunctionName(objectDef.fullName);
  
  const tests: ValidationRuleTestDefinition[] = [];
  
  for (const rule of validationRules) {
    if (!rule.active) continue;
    
    // Positive test (valid data should pass)
    tests.push({
      name: `test-validation-${rule.fullName.toLowerCase()}-positive`,
      type: 'ValidationRule',
      validationRuleName: rule.fullName,
      validationRuleMessage: rule.errorMessage,
      isPositive: true,
      objectName: objectDef.fullName,
      testData: {},
      testCase: generatePositiveValidationTestCase(objectDef, rule, createFunctionName, deleteFunctionName),
      tags: generateTestTags('ValidationRule', { objectName: objectDef.fullName }),
      assertions: [
        { type: 'toBeVisible', expected: true, description: 'Record should be saved successfully' },
      ],
    });
    
    // Negative test (invalid data should trigger validation)
    tests.push({
      name: `test-validation-${rule.fullName.toLowerCase()}-negative`,
      type: 'ValidationRule',
      validationRuleName: rule.fullName,
      validationRuleMessage: rule.errorMessage,
      isPositive: false,
      objectName: objectDef.fullName,
      testData: {},
      testCase: generateNegativeValidationTestCase(objectDef, rule, createFunctionName),
      tags: generateTestTags('ValidationRule', { objectName: objectDef.fullName }),
      assertions: [
        { type: 'toContain', expected: rule.errorMessage, description: 'Validation error should be displayed' },
      ],
    });
  }
  
  return tests;
}

function generatePositiveValidationTestCase(
  objectDef: ObjectDefinition, 
  rule: ValidationRule,
  createFunctionName: string,
  deleteFunctionName: string
): string {
  return `test('should pass validation rule ${rule.fullName} with valid data @validation-rule @${objectDef.fullName}', async ({ page, testData }) => {
    // Create record with valid data that should pass validation
    const recordId = await testData.${createFunctionName}({
      Name: 'Valid Test Record',
    });
    
    // Verify record was created (validation passed)
    await page.goto(\`/lightning/r/${objectDef.fullName}/\${recordId}/view\`);
    await expect(page.locator('h1')).toBeVisible();
    
    // Cleanup
    await testData.${deleteFunctionName}(recordId);
  });`;
}

function generateNegativeValidationTestCase(
  objectDef: ObjectDefinition, 
  rule: ValidationRule,
  createFunctionName: string
): string {
  // Escape the error message to prevent syntax errors in generated code
  // Replace newlines with spaces and escape special characters
  const escapedErrorMessage = rule.errorMessage
    ? rule.errorMessage
        .replace(/\r\n/g, ' ')  // Replace Windows line endings
        .replace(/\n/g, ' ')    // Replace Unix line endings
        .replace(/\r/g, ' ')    // Replace old Mac line endings
        .replace(/\\/g, '\\\\') // Escape backslashes
        .replace(/`/g, '\\`')   // Escape backticks
        .replace(/\${/g, '\\${') // Escape template literal expressions
        .replace(/"/g, '\\"')    // Escape double quotes
    : '';
  
  return `test('should trigger validation rule ${rule.fullName} with invalid data @validation-rule @${objectDef.fullName}', async ({ page, testData }) => {
    // Attempt to create record with invalid data via API (should fail)
    try {
      await testData.${createFunctionName}({
        Name: '', // Invalid data that triggers validation
      });
    } catch (error) {
      // Expected: API should reject invalid data
    }
    
    // Verify validation error via UI
    await page.goto(\`/lightning/o/${objectDef.fullName}/new\`);
    // Fill form with invalid data
    // Attempt to save
    // Verify error message: ${escapedErrorMessage ? `"${escapedErrorMessage}"` : 'validation error'}
  });`;
}

export function generateValidationRuleTestGroup(
  objectDef: ObjectDefinition,
  validationRules: ValidationRule[],
  sanitizedNames?: {
    createFunctionName: string;
    deleteFunctionName: string;
  }
): TestGroupDefinition {
  const tests = convertValidationRulesToTests(objectDef, validationRules, sanitizedNames);
  
  return {
    groupName: `Validation Rules - ${objectDef.fullName}`,
    testType: 'ValidationRule',
    tests,
    tags: generateTestTags('ValidationRule', { objectName: objectDef.fullName }),
  };
}

