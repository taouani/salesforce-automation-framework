/**
 * Tests for CRUD test generator
 */

import { describe, it, expect } from 'vitest';
import {
  convertObjectToCRUDTests,
  generateCRUDTestGroup,
} from '../../src/generator/test-specs/crud-test-generator.js';
import type { ObjectDefinition, FieldDefinition } from '../../src/types/xml-parsed.js';

describe('CRUD Test Generator', () => {
  const mockAccountObject: ObjectDefinition = {
    fullName: 'Account',
    label: 'Account',
    fields: [
      {
        fullName: 'Name',
        type: 'String',
        label: 'Account Name',
        required: true,
      } as FieldDefinition,
    ],
    validationRules: [],
    recordTypes: [],
    relationships: [],
  };

  it('should convert object to CRUD test definitions', () => {
    const tests = convertObjectToCRUDTests(mockAccountObject);
    
    expect(tests).toHaveLength(4);
    expect(tests.some(t => t.operation === 'Create')).toBe(true);
    expect(tests.some(t => t.operation === 'Read')).toBe(true);
    expect(tests.some(t => t.operation === 'Update')).toBe(true);
    expect(tests.some(t => t.operation === 'Delete')).toBe(true);
  });

  it('should generate CRUD test group', () => {
    const testGroup = generateCRUDTestGroup(mockAccountObject);
    
    expect(testGroup.groupName).toContain('CRUD Operations');
    expect(testGroup.testType).toBe('CRUD');
    expect(testGroup.tests).toHaveLength(4);
  });

  it('should include test data in Create test', () => {
    const tests = convertObjectToCRUDTests(mockAccountObject);
    const createTest = tests.find(t => t.operation === 'Create');
    
    expect(createTest).toBeDefined();
    expect(createTest?.testData).toBeDefined();
    expect(createTest?.testData?.Name).toBeDefined();
  });
});

