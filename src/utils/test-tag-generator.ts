/**
 * Test Tag Generator
 * Generates standardized tags for test filtering
 * 
 * Tag Naming Convention:
 * - Test type tags: @crud, @validation-rule, @relationship, @record-type, @field-validation, @component, @flow, @permission
 * - Object tags: @ObjectName (e.g., @Account)
 * - Component tags: @component:lwc:ComponentName or @component:aura:ComponentName
 * - Flow tags: @flow:FlowName
 * 
 * Usage examples:
 * - Run only CRUD tests: npx playwright test --grep @crud
 * - Run tests for specific object: npx playwright test --grep @Account
 * - Run component tests: npx playwright test --grep @component
 * - Run multiple tags: npx playwright test --grep "@crud|@validation-rule"
 */

import type { TestType } from '../types/test-generation.js';

/**
 * Generates tags for a test based on test type and context
 */
export function generateTestTags(
  testType: TestType,
  context: {
    objectName?: string;
    componentName?: string;
    componentType?: 'LWC' | 'Aura';
    flowName?: string;
  }
): string[] {
  const tags: string[] = [];

  // Add test type tag
  const typeTag = getTestTypeTag(testType);
  if (typeTag) {
    tags.push(typeTag);
  }

  // Add object tag if applicable (format: @ObjectName)
  if (context.objectName) {
    tags.push(`@${context.objectName}`);
  }

  // Add component tag if applicable
  if (context.componentName && context.componentType) {
    tags.push(`@component:${context.componentType.toLowerCase()}:${context.componentName}`);
  }

  // Add flow tag if applicable
  if (context.flowName) {
    tags.push(`@flow:${context.flowName}`);
  }

  return tags;
}

/**
 * Gets the tag for a test type
 */
function getTestTypeTag(testType: TestType): string | null {
  const tagMap: Record<TestType, string> = {
    'CRUD': '@crud',
    'ValidationRule': '@validation-rule',
    'RecordType': '@record-type',
    'FieldValidation': '@field-validation',
    'Relationship': '@relationship',
    'Component': '@component',
    'Flow': '@flow',
    'Permission': '@permission',
  };

  return tagMap[testType] || null;
}

/**
 * Formats tags for Playwright test.describe() or test() calls
 * Playwright uses .tag() method or tags in test name
 */
export function formatTagsForPlaywright(tags: string[]): string {
  if (tags.length === 0) return '';
  
  // Playwright supports tags via .tag() method
  // We'll add tags as a comment and use test.describe().tag() or test().tag()
  return tags.join(' ');
}

