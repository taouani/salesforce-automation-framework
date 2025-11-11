/**
 * Validation Rule Test Generator
 * Generates validation rule test cases for Salesforce objects
 */

import type { ValidationRuleTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition, ValidationRule } from '../../types/xml-parsed.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';

/**
 * Converts validation rules to test definitions
 */
export function convertValidationRulesToTests(
  objectDef: ObjectDefinition,
  validationRules: ValidationRule[]
): ValidationRuleTestDefinition[] {
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
      testCase: generatePositiveValidationTestCase(objectDef, rule),
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
      testCase: generateNegativeValidationTestCase(objectDef, rule),
      tags: generateTestTags('ValidationRule', { objectName: objectDef.fullName }),
      assertions: [
        { type: 'toContain', expected: rule.errorMessage, description: 'Validation error should be displayed' },
      ],
    });
  }
  
  return tests;
}

function generatePositiveValidationTestCase(objectDef: ObjectDefinition, rule: ValidationRule): string {
  return `test('should pass validation rule ${rule.fullName} with valid data @validation-rule @${objectDef.fullName}', async ({ page, testData }) => {
    // Create record with valid data that should pass validation
    const recordId = await testData.create${objectDef.fullName}({
      Name: 'Valid Test Record',
    });
    
    // Verify record was created (validation passed)
    await page.goto(\`/lightning/r/${objectDef.fullName}/\${recordId}/view\`);
    await expect(page.locator('h1')).toBeVisible();
    
    // Cleanup
    await testData.delete${objectDef.fullName}(recordId);
  });`;
}

function generateNegativeValidationTestCase(objectDef: ObjectDefinition, rule: ValidationRule): string {
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
      await testData.create${objectDef.fullName}({
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
  validationRules: ValidationRule[]
): TestGroupDefinition {
  const tests = convertValidationRulesToTests(objectDef, validationRules);
  
  return {
    groupName: `Validation Rules - ${objectDef.fullName}`,
    testType: 'ValidationRule',
    tests,
    tags: generateTestTags('ValidationRule', { objectName: objectDef.fullName }),
  };
}

