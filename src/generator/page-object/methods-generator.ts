/**
 * Page Object Methods Generator
 * Generates common methods for page objects
 */

import type { MethodDefinition, FieldInteractionMethodDefinition, ValidationMethodDefinition, AssertionMethodDefinition } from '../../types/page-object.js';

/**
 * Generates field interaction methods for a field
 */
export function generateFieldInteractionMethods(fieldName: string, fieldLabel: string): MethodDefinition[] {
  const camelCaseName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  
  return [
    {
      name: `fill${camelCaseName}`,
      parameters: [{ name: 'value', type: 'string' }],
      returnType: 'Promise<void>',
      description: `Fill ${fieldLabel} field with a value`,
      type: 'fieldInteraction',
      fieldName,
      operation: 'fill',
    } as FieldInteractionMethodDefinition,
    {
      name: `get${camelCaseName}`,
      parameters: [],
      returnType: 'Promise<string>',
      description: `Get ${fieldLabel} field value`,
      type: 'fieldInteraction',
      fieldName,
      operation: 'get',
    } as FieldInteractionMethodDefinition,
    {
      name: `clear${camelCaseName}`,
      parameters: [],
      returnType: 'Promise<void>',
      description: `Clear ${fieldLabel} field`,
      type: 'fieldInteraction',
      fieldName,
      operation: 'clear',
    } as FieldInteractionMethodDefinition,
    {
      name: `is${camelCaseName}Visible`,
      parameters: [],
      returnType: 'Promise<boolean>',
      description: `Check if ${fieldLabel} field is visible`,
      type: 'validation',
      validationType: 'isVisible',
    } as ValidationMethodDefinition,
    {
      name: `is${camelCaseName}Enabled`,
      parameters: [],
      returnType: 'Promise<boolean>',
      description: `Check if ${fieldLabel} field is enabled`,
      type: 'validation',
      validationType: 'isEnabled',
    } as ValidationMethodDefinition,
  ];
}

/**
 * Generates assertion methods for a field
 */
export function generateAssertionMethods(fieldName: string, fieldLabel: string): AssertionMethodDefinition[] {
  const camelCaseName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  
  return [
    {
      name: `shouldHave${camelCaseName}`,
      parameters: [{ name: 'expectedValue', type: 'string' }],
      returnType: 'Promise<void>',
      description: `Assert that ${fieldLabel} field has the expected value`,
      type: 'assertion',
      assertionType: 'shouldHaveValue',
    },
    {
      name: `shouldBe${camelCaseName}Visible`,
      parameters: [],
      returnType: 'Promise<void>',
      description: `Assert that ${fieldLabel} field is visible`,
      type: 'assertion',
      assertionType: 'shouldBeVisible',
    },
    {
      name: `shouldBe${camelCaseName}Enabled`,
      parameters: [],
      returnType: 'Promise<void>',
      description: `Assert that ${fieldLabel} field is enabled`,
      type: 'assertion',
      assertionType: 'shouldBeEnabled',
    },
  ];
}

/**
 * Generates button interaction methods
 */
export function generateButtonMethods(buttonLabel: string, buttonName?: string): MethodDefinition[] {
  const methodName = buttonName || buttonLabel.replace(/\s+/g, '');
  const camelCaseName = methodName.charAt(0).toUpperCase() + methodName.slice(1);
  
  return [
    {
      name: `click${camelCaseName}`,
      parameters: [],
      returnType: 'Promise<void>',
      description: `Click ${buttonLabel} button`,
    },
    {
      name: `is${camelCaseName}Visible`,
      parameters: [],
      returnType: 'Promise<boolean>',
      description: `Check if ${buttonLabel} button is visible`,
      type: 'validation',
      validationType: 'isVisible',
    } as ValidationMethodDefinition,
    {
      name: `is${camelCaseName}Enabled`,
      parameters: [],
      returnType: 'Promise<boolean>',
      description: `Check if ${buttonLabel} button is enabled`,
      type: 'validation',
      validationType: 'isEnabled',
    } as ValidationMethodDefinition,
  ];
}

/**
 * Generates helper methods for common Salesforce UI patterns
 */
export function generateHelperMethods(): MethodDefinition[] {
  return [
    {
      name: 'waitForRecordLoad',
      parameters: [],
      returnType: 'Promise<void>',
      description: 'Wait for Salesforce record to finish loading',
    },
    {
      name: 'waitForSpinner',
      parameters: [],
      returnType: 'Promise<void>',
      description: 'Wait for spinner to disappear',
    },
    {
      name: 'waitForToast',
      parameters: [{ name: 'message', type: 'string', optional: true }],
      returnType: 'Promise<void>',
      description: 'Wait for toast message to appear',
    },
    {
      name: 'getToastMessage',
      parameters: [],
      returnType: 'Promise<string | null>',
      description: 'Get the current toast message',
    },
    {
      name: 'handleError',
      parameters: [],
      returnType: 'Promise<void>',
      description: 'Handle and log any errors on the page',
    },
  ];
}

