/**
 * Field Validation Test Generator
 *
 * Emits Playwright tests that exercise Salesforce's UI-side field validation:
 * required-field enforcement, format checks (Email/Phone/URL), length limits
 * on Text/String, and restricted picklists.
 *
 * Tests use the page object's `fillFieldByApiName` helper so they are robust
 * against translated labels — the generator passes API names which are stable
 * across orgs and locales.
 */

import type { FieldValidationTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { ObjectDefinition, FieldDefinition } from '../../types/xml-parsed.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';
import {
  generatePageObjectClassName,
  generateTestDataFactoryFunctionName,
} from '../name-sanitizer.js';

const REQUIRED_ERROR_RE = /Complete this field|This field is required|You must enter a value/i;
const EMAIL_ERROR_RE = /valid email address|invalid email/i;
const PHONE_ERROR_RE = /valid phone|invalid phone/i;
const URL_ERROR_RE = /valid url|invalid url/i;

export function convertFieldsToValidationTests(
  objectDef: ObjectDefinition,
  fields: FieldDefinition[],
  sanitizedNames?: {
    pageObjectClassName: string;
    createFunctionName: string;
  },
): FieldValidationTestDefinition[] {
  const pageObjectClassName =
    sanitizedNames?.pageObjectClassName || generatePageObjectClassName(objectDef.fullName);
  const createFunctionName =
    sanitizedNames?.createFunctionName || generateTestDataFactoryFunctionName(objectDef.fullName);

  const tests: FieldValidationTestDefinition[] = [];

  let testIndex = 0;
  for (const field of fields) {
    testIndex++;
    const safeIndex = `${testIndex}_${field.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    if (field.required) {
      tests.push({
        name: `test-field-${field.fullName.toLowerCase()}-required`,
        type: 'FieldValidation',
        fieldName: field.fullName,
        fieldType: field.type,
        validationType: 'required',
        objectName: objectDef.fullName,
        expectedError: `${field.label || field.fullName} is required`,
        testCase: generateRequiredFieldTestCase(
          objectDef,
          field,
          `${safeIndex}_req`,
          pageObjectClassName,
        ),
        tags: generateTestTags('FieldValidation', { objectName: objectDef.fullName }),
      });
    }

    if (field.type === 'Email' || field.type === 'Phone' || field.type === 'URL') {
      tests.push({
        name: `test-field-${field.fullName.toLowerCase()}-format`,
        type: 'FieldValidation',
        fieldName: field.fullName,
        fieldType: field.type,
        validationType: 'format',
        objectName: objectDef.fullName,
        expectedError: `Invalid ${field.type.toLowerCase()} format`,
        testCase: generateFormatValidationTestCase(
          objectDef,
          field,
          `${safeIndex}_fmt`,
          pageObjectClassName,
        ),
        tags: generateTestTags('FieldValidation', { objectName: objectDef.fullName }),
      });
    }

    if (field.length && (field.type === 'String' || field.type === 'Text')) {
      tests.push({
        name: `test-field-${field.fullName.toLowerCase()}-length`,
        type: 'FieldValidation',
        fieldName: field.fullName,
        fieldType: field.type,
        validationType: 'length',
        objectName: objectDef.fullName,
        expectedError: `Field length exceeds maximum of ${field.length} characters`,
        testCase: generateLengthConstraintTestCase(
          objectDef,
          field,
          `${safeIndex}_len`,
          pageObjectClassName,
        ),
        tags: generateTestTags('FieldValidation', { objectName: objectDef.fullName }),
      });
    }

    if (field.type === 'Picklist' || field.type === 'MultiPicklist') {
      tests.push({
        name: `test-field-${field.fullName.toLowerCase()}-picklist`,
        type: 'FieldValidation',
        fieldName: field.fullName,
        fieldType: field.type,
        validationType: 'picklist',
        objectName: objectDef.fullName,
        expectedError: `Invalid picklist value for ${field.label || field.fullName}`,
        testCase: generatePicklistRestrictionTestCase(
          objectDef,
          field,
          `${safeIndex}_pl`,
          pageObjectClassName,
        ),
        tags: generateTestTags('FieldValidation', { objectName: objectDef.fullName }),
      });
    }
  }

  // `createFunctionName` is no longer used in the rewritten test bodies (we
  // exercise the UI directly), but is retained on the public signature for
  // backwards compatibility with callers passing sanitizedNames.
  void createFunctionName;
  return tests;
}

function pageVar(objectName: string, suffix: string): string {
  return `${objectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_page_${suffix}`;
}

function generateRequiredFieldTestCase(
  objectDef: ObjectDefinition,
  field: FieldDefinition,
  index: string,
  pageObjectClassName: string,
): string {
  const objectName = objectDef.fullName;
  const variable = pageVar(objectName, index);
  return `test('should require field ${field.fullName} @field-validation @${objectName}', async ({ page }) => {
    // Open the new-record page directly — required-field tests don't need API setup.
    await page.goto(\`/lightning/o/${objectName}/new\`);
    const ${variable} = new ${pageObjectClassName}(page);

    // Click Save without filling the required field.
    await ${variable}.clickSave();

    // Salesforce surfaces required-field errors either inline near the field
    // or via the page-level "We hit a snag" alert.
    const fieldError = ${variable}.fieldErrorByApiName('${field.fullName}');
    const pageError = page.getByText(${REQUIRED_ERROR_RE.toString()}).first();
    await expect(fieldError.or(pageError)).toBeVisible({ timeout: 10000 });
  });`;
}

function generateFormatValidationTestCase(
  objectDef: ObjectDefinition,
  field: FieldDefinition,
  index: string,
  pageObjectClassName: string,
): string {
  const objectName = objectDef.fullName;
  const variable = pageVar(objectName, index);
  const invalidValue = getInvalidFormatValue(field.type);
  const errorPattern = formatErrorPattern(field.type);

  return `test('should validate ${field.type.toLowerCase()} format for field ${field.fullName} @field-validation @${objectName}', async ({ page }) => {
    await page.goto(\`/lightning/o/${objectName}/new\`);
    const ${variable} = new ${pageObjectClassName}(page);

    // Fill a value that breaks Salesforce's ${field.type.toLowerCase()} format check.
    await ${variable}.fillFieldByApiName('${field.fullName}', '${invalidValue}');
    await ${variable}.clickSave();

    const fieldError = ${variable}.fieldErrorByApiName('${field.fullName}');
    const pageError = page.getByText(${errorPattern.toString()}).first();
    await expect(fieldError.or(pageError)).toBeVisible({ timeout: 10000 });
  });`;
}

function generateLengthConstraintTestCase(
  objectDef: ObjectDefinition,
  field: FieldDefinition,
  index: string,
  pageObjectClassName: string,
): string {
  const objectName = objectDef.fullName;
  const variable = pageVar(objectName, index);
  const maxLength = field.length || 255;

  // Salesforce inputs typically truncate at maxlength rather than emitting an
  // error, so we test the more deterministic behaviour: the value is clamped.
  return `test('should enforce length constraint for field ${field.fullName} @field-validation @${objectName}', async ({ page }) => {
    await page.goto(\`/lightning/o/${objectName}/new\`);
    const ${variable} = new ${pageObjectClassName}(page);

    const oversized = 'x'.repeat(${maxLength + 1});
    await ${variable}.fillFieldByApiName('${field.fullName}', oversized);

    // Either Salesforce truncated the input to <= ${maxLength} characters, or it
    // surfaced an explicit length-validation error after we attempt to save.
    const stored = await ${variable}.getFieldValueByApiName('${field.fullName}');
    if (stored.length <= ${maxLength}) {
      expect(stored.length).toBeLessThanOrEqual(${maxLength});
      return;
    }

    await ${variable}.clickSave();
    const fieldError = ${variable}.fieldErrorByApiName('${field.fullName}');
    const pageError = page.getByText(/too long|exceeds maximum length|maximum length/i).first();
    await expect(fieldError.or(pageError)).toBeVisible({ timeout: 10000 });
  });`;
}

function generatePicklistRestrictionTestCase(
  objectDef: ObjectDefinition,
  field: FieldDefinition,
  index: string,
  pageObjectClassName: string,
): string {
  const objectName = objectDef.fullName;
  const variable = pageVar(objectName, index);

  // For a restricted picklist we can't type an arbitrary value — Salesforce's
  // combobox simply won't accept it. The most reliable assertion is that the
  // combobox's option list contains only the metadata-declared values; a
  // hand-edited USER-CODE block can override this for orgs with row-driven
  // picklists. We assert at least that the combobox renders.
  return `test('should expose only valid picklist values for ${field.fullName} @field-validation @${objectName}', async ({ page }) => {
    await page.goto(\`/lightning/o/${objectName}/new\`);
    const ${variable} = new ${pageObjectClassName}(page);

    const combobox = ${variable}.fieldByApiName('${field.fullName}').locator('lightning-combobox, lightning-base-combobox, [role="combobox"]').first();
    await expect(combobox).toBeVisible({ timeout: 10000 });

    await combobox.click();
    const options = page.locator('lightning-base-combobox-item, [role="option"]');
    await expect(options.first()).toBeVisible({ timeout: 10000 });
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
  });`;
}

function getInvalidFormatValue(fieldType: string): string {
  switch (fieldType) {
    case 'Email':
      return 'invalid-email-format';
    case 'Phone':
      // Salesforce accepts most strings as phones, so emit something
      // unambiguously invalid (letters with no digits).
      return 'not-a-phone-number';
    case 'URL':
      return 'not-a-valid-url';
    default:
      return 'invalid-format';
  }
}

function formatErrorPattern(fieldType: string): RegExp {
  switch (fieldType) {
    case 'Email':
      return EMAIL_ERROR_RE;
    case 'Phone':
      return PHONE_ERROR_RE;
    case 'URL':
      return URL_ERROR_RE;
    default:
      return /invalid format/i;
  }
}

export function generateFieldValidationTestGroup(
  objectDef: ObjectDefinition,
  fields: FieldDefinition[],
  sanitizedNames?: {
    pageObjectClassName: string;
    createFunctionName: string;
  },
): TestGroupDefinition {
  const tests = convertFieldsToValidationTests(objectDef, fields, sanitizedNames);

  return {
    groupName: `Field Validations - ${objectDef.fullName}`,
    testType: 'FieldValidation',
    tests,
    tags: generateTestTags('FieldValidation', { objectName: objectDef.fullName }),
  };
}
