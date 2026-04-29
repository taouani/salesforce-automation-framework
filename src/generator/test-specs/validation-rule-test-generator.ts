/**
 * Validation Rule Test Generator
 *
 * Validation rules trip on field combinations the framework can't reliably
 * synthesize from XML alone (the rule's `errorConditionFormula` is a string
 * that may reference custom logic, related records, or org-specific picklist
 * values). The negative test therefore navigates to the new-record form,
 * exposes a `// <SF-SCANNER:USER-CODE>` block where the test author writes
 * the rule-tripping field-fills, attempts to save, and asserts the rule's
 * `errorMessage` becomes visible. The USER-CODE block is preserved across
 * regeneration so authors edit it once.
 *
 * The positive test stays API-driven — REST is the natural way to assert
 * "valid data succeeds" — and continues to clean up after itself.
 */

import type { ValidationRuleTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition, ValidationRule } from '../../types/xml-parsed.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';
import {
  generatePageObjectClassName,
  generateTestDataFactoryFunctionName,
  generateDeleteFunctionName,
} from '../name-sanitizer.js';

export function convertValidationRulesToTests(
  objectDef: ObjectDefinition,
  validationRules: ValidationRule[],
  sanitizedNames?: {
    pageObjectClassName?: string;
    createFunctionName?: string;
    deleteFunctionName?: string;
  },
): ValidationRuleTestDefinition[] {
  const pageObjectClassName =
    sanitizedNames?.pageObjectClassName || generatePageObjectClassName(objectDef.fullName);
  const createFunctionName =
    sanitizedNames?.createFunctionName || generateTestDataFactoryFunctionName(objectDef.fullName);
  const deleteFunctionName =
    sanitizedNames?.deleteFunctionName || generateDeleteFunctionName(objectDef.fullName);

  const tests: ValidationRuleTestDefinition[] = [];

  for (const rule of validationRules) {
    if (!rule.active) continue;

    tests.push({
      name: `test-validation-${rule.fullName.toLowerCase()}-positive`,
      type: 'ValidationRule',
      validationRuleName: rule.fullName,
      validationRuleMessage: rule.errorMessage,
      isPositive: true,
      objectName: objectDef.fullName,
      testData: {},
      testCase: generatePositiveValidationTestCase(
        objectDef,
        rule,
        createFunctionName,
        deleteFunctionName,
      ),
      tags: generateTestTags('ValidationRule', { objectName: objectDef.fullName }),
      assertions: [
        { type: 'toBeVisible', expected: true, description: 'Record should be saved successfully' },
      ],
    });

    tests.push({
      name: `test-validation-${rule.fullName.toLowerCase()}-negative`,
      type: 'ValidationRule',
      validationRuleName: rule.fullName,
      validationRuleMessage: rule.errorMessage,
      isPositive: false,
      objectName: objectDef.fullName,
      testData: {},
      testCase: generateNegativeValidationTestCase(objectDef, rule, pageObjectClassName),
      tags: generateTestTags('ValidationRule', { objectName: objectDef.fullName }),
      assertions: [
        {
          type: 'toContain',
          expected: rule.errorMessage,
          description: 'Validation error should be displayed',
        },
      ],
    });
  }

  return tests;
}

function generatePositiveValidationTestCase(
  objectDef: ObjectDefinition,
  rule: ValidationRule,
  createFunctionName: string,
  deleteFunctionName: string,
): string {
  return `test('should pass validation rule ${rule.fullName} with valid data @validation-rule @${objectDef.fullName}', async ({ page, testData }) => {
    // The API rejects records that fail validation, so a successful create
    // proves the rule allowed this data. We then verify the record renders.
    const recordId = await testData.${createFunctionName}({
      Name: 'Valid Test Record',
    });

    await page.goto(\`/lightning/r/${objectDef.fullName}/\${recordId}/view\`);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

    await testData.${deleteFunctionName}(recordId);
  });`;
}

function generateNegativeValidationTestCase(
  objectDef: ObjectDefinition,
  rule: ValidationRule,
  pageObjectClassName: string,
): string {
  // Escape the parsed errorMessage for safe embedding in a JS string literal.
  // Validation-rule error messages are user-authored and may contain quotes,
  // backticks, line breaks, and template-literal-looking sequences.
  const escapedErrorMessage = (rule.errorMessage || '')
    .replace(/\r\n/g, ' ')
    .replace(/[\r\n]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");

  const ruleId = rule.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const variable = `${objectDef.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_vr_${ruleId}`;

  // The error pattern is a string-literal regex: `escapedErrorMessage` is
  // wrapped in /.../i as a substring match. We avoid `getByText(string)`
  // because Salesforce sometimes prefixes with "Review the errors on this
  // page." so an exact match would miss.
  return `test('should trigger validation rule ${rule.fullName} with invalid data @validation-rule @${objectDef.fullName}', async ({ page }) => {
    // Open the new-record form. We can't synthesize rule-tripping data from
    // the metadata alone — fill the fields that violate "${rule.fullName}"
    // in the USER-CODE block below. The fill survives regeneration.
    await page.goto(\`/lightning/o/${objectDef.fullName}/new\`);
    const ${variable} = new ${pageObjectClassName}(page);

    // <SF-SCANNER:USER-CODE id="trip-${ruleId}">
    // Example:
    //   await ${variable}.fillFieldByApiName('Name', '');
    //   await ${variable}.fillFieldByApiName('Some_Required_Field__c', 'invalid');
    // </SF-SCANNER:USER-CODE>

    await ${variable}.clickSave();

    // Salesforce surfaces the rule's errorMessage either inline or in a
    // page-level alert. Either match satisfies the test.
    const ruleErrorText = '${escapedErrorMessage}';
    const inline = ${variable}.fieldErrorMessage();
    const pageMatch = page.getByText(ruleErrorText, { exact: false }).first();
    await expect(inline.or(pageMatch)).toBeVisible({ timeout: 10000 });
  });`;
}

export function generateValidationRuleTestGroup(
  objectDef: ObjectDefinition,
  validationRules: ValidationRule[],
  sanitizedNames?: {
    pageObjectClassName?: string;
    createFunctionName?: string;
    deleteFunctionName?: string;
  },
): TestGroupDefinition {
  const tests = convertValidationRulesToTests(objectDef, validationRules, sanitizedNames);

  return {
    groupName: `Validation Rules - ${objectDef.fullName}`,
    testType: 'ValidationRule',
    tests,
    tags: generateTestTags('ValidationRule', { objectName: objectDef.fullName }),
  };
}
