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

  describe('convertObjectToCRUDTests', () => {
    it('should convert object to CRUD test definitions', () => {
      const tests = convertObjectToCRUDTests(mockAccountObject);
      
      expect(tests).toHaveLength(4);
      expect(tests.some(t => t.operation === 'Create')).toBe(true);
      expect(tests.some(t => t.operation === 'Read')).toBe(true);
      expect(tests.some(t => t.operation === 'Update')).toBe(true);
      expect(tests.some(t => t.operation === 'Delete')).toBe(true);
    });

    it('should include test data in Create test', () => {
      const tests = convertObjectToCRUDTests(mockAccountObject);
      const createTest = tests.find(t => t.operation === 'Create');
      
      expect(createTest).toBeDefined();
      expect(createTest?.testData).toBeDefined();
      expect(createTest?.testData?.Name).toBeDefined();
    });

    it('should include test data in Update test', () => {
      const tests = convertObjectToCRUDTests(mockAccountObject);
      const updateTest = tests.find(t => t.operation === 'Update');
      
      expect(updateTest).toBeDefined();
      expect(updateTest?.testData).toBeDefined();
      expect(updateTest?.testData?.Name).toBeDefined();
    });

    it('should include tags in test definitions', () => {
      const tests = convertObjectToCRUDTests(mockAccountObject);
      
      tests.forEach(test => {
        expect(test.tags).toBeDefined();
        expect(test.tags).toContain('@crud');
        expect(test.tags).toContain('@Account');
      });
    });

    it('should generate test names with object name', () => {
      const tests = convertObjectToCRUDTests(mockAccountObject);
      
      expect(tests[0].name).toContain('create');
      expect(tests[0].name).toContain('account');
      expect(tests[1].name).toContain('read');
      expect(tests[2].name).toContain('update');
      expect(tests[3].name).toContain('delete');
    });

    it('should include assertions in test definitions', () => {
      const tests = convertObjectToCRUDTests(mockAccountObject);
      
      tests.forEach(test => {
        expect(test.assertions).toBeDefined();
        expect(test.assertions?.length).toBeGreaterThan(0);
      });
    });

    it('should include tags in test case strings', () => {
      const tests = convertObjectToCRUDTests(mockAccountObject);
      
      tests.forEach(test => {
        expect(test.testCase).toContain('@crud');
        expect(test.testCase).toContain('@Account');
      });
    });
  });

  describe('generateCRUDTestGroup', () => {
    it('should generate CRUD test group', () => {
      const testGroup = generateCRUDTestGroup(mockAccountObject);
      
      expect(testGroup.groupName).toContain('CRUD Operations');
      expect(testGroup.groupName).toContain('Account');
      expect(testGroup.testType).toBe('CRUD');
      expect(testGroup.tests).toHaveLength(4);
    });

    it('should include tags in test group', () => {
      const testGroup = generateCRUDTestGroup(mockAccountObject);
      
      expect(testGroup.tags).toBeDefined();
      expect(testGroup.tags).toContain('@crud');
      expect(testGroup.tags).toContain('@Account');
    });

    it('should include beforeEach and afterEach hooks', () => {
      const testGroup = generateCRUDTestGroup(mockAccountObject);
      
      expect(testGroup.beforeEach).toBeDefined();
      expect(testGroup.afterEach).toBeDefined();
    });
  });
});

