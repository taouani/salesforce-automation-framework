/**
 * Tests for record type test generator
 */

import { describe, it, expect } from 'vitest';
import {
  convertRecordTypesToTests,
  generateRecordTypeTestGroup,
} from '../../src/generator/test-specs/record-type-test-generator.js';
import type { ObjectDefinition, RecordType } from '../../src/types/xml-parsed.js';

describe('Record Type Test Generator', () => {
  const mockObjectDef: ObjectDefinition = {
    fullName: 'Account',
    label: 'Account',
    fields: [
      {
        fullName: 'Name',
        type: 'String',
        label: 'Account Name',
        required: true,
      },
    ],
    validationRules: [],
    recordTypes: [],
    relationships: [],
  };

  describe('convertRecordTypesToTests', () => {
    it('should generate multiple tests for each active record type', () => {
      const recordTypes: RecordType[] = [
        {
          fullName: 'Customer',
          label: 'Customer',
          active: true,
        },
        {
          fullName: 'Partner',
          label: 'Partner',
          active: true,
        },
      ];

      const tests = convertRecordTypesToTests(mockObjectDef, recordTypes);

      // Each record type generates: creation, field visibility (if fields exist), assignment
      // With fields in mockObjectDef, we get: creation + field visibility + assignment = 3 tests per record type
      expect(tests.length).toBeGreaterThanOrEqual(2); // At least creation + assignment for each
      expect(tests.filter(t => t.recordTypeName === 'Customer' && t.testScenario === 'creation')).toHaveLength(1);
      expect(tests.filter(t => t.recordTypeName === 'Partner' && t.testScenario === 'creation')).toHaveLength(1);
      expect(tests.filter(t => t.recordTypeName === 'Customer' && t.testScenario === 'assignment')).toHaveLength(1);
      expect(tests.filter(t => t.recordTypeName === 'Partner' && t.testScenario === 'assignment')).toHaveLength(1);
    });

    it('should skip inactive record types', () => {
      const recordTypes: RecordType[] = [
        {
          fullName: 'Customer',
          label: 'Customer',
          active: false,
        },
        {
          fullName: 'Partner',
          label: 'Partner',
          active: true,
        },
      ];

      const tests = convertRecordTypesToTests(mockObjectDef, recordTypes);

      // Partner is active, so we get: creation + field visibility + assignment = 3 tests
      expect(tests.length).toBeGreaterThanOrEqual(2); // At least creation + assignment
      expect(tests.every(t => t.recordTypeName === 'Partner')).toBe(true);
      expect(tests.some(t => t.recordTypeName === 'Customer')).toBe(false);
    });

    it('should include record type in test data', () => {
      const recordTypes: RecordType[] = [
        {
          fullName: 'Customer',
          label: 'Customer',
          active: true,
        },
      ];

      const tests = convertRecordTypesToTests(mockObjectDef, recordTypes);

      const creationTest = tests.find(t => t.testScenario === 'creation');
      expect(creationTest).toBeDefined();
      expect(creationTest?.testData).toBeDefined();
      expect(creationTest?.testData?.RecordTypeId).toBe('Customer');
    });

    it('should include tags in test definitions', () => {
      const recordTypes: RecordType[] = [
        {
          fullName: 'Customer',
          label: 'Customer',
          active: true,
        },
      ];

      const tests = convertRecordTypesToTests(mockObjectDef, recordTypes);

      expect(tests[0].tags).toBeDefined();
      expect(tests[0].tags).toContain('@record-type');
      expect(tests[0].tags).toContain('@Account');
    });

    it('should generate test names with record type name', () => {
      const recordTypes: RecordType[] = [
        {
          fullName: 'Customer',
          label: 'Customer',
          active: true,
        },
      ];

      const tests = convertRecordTypesToTests(mockObjectDef, recordTypes);

      const creationTest = tests.find(t => t.testScenario === 'creation');
      expect(creationTest).toBeDefined();
      expect(creationTest?.name).toContain('record-type');
      expect(creationTest?.name).toContain('customer');
      expect(creationTest?.name).toContain('creation');
    });

    it('should generate field visibility test when object has fields', () => {
      const recordTypes: RecordType[] = [
        {
          fullName: 'Customer',
          label: 'Customer',
          active: true,
        },
      ];

      const tests = convertRecordTypesToTests(mockObjectDef, recordTypes);

      const fieldVisibilityTest = tests.find(t => t.testScenario === 'fieldVisibility');
      expect(fieldVisibilityTest).toBeDefined();
      expect(fieldVisibilityTest?.recordTypeName).toBe('Customer');
    });

    it('should generate picklist values test when record type has picklist values', () => {
      const recordTypes: RecordType[] = [
        {
          fullName: 'Customer',
          label: 'Customer',
          active: true,
          picklistValues: [
            {
              picklist: 'Status',
              values: ['Active', 'Inactive'],
            },
          ],
        },
      ];

      const tests = convertRecordTypesToTests(mockObjectDef, recordTypes);

      const picklistTest = tests.find(t => t.testScenario === 'picklistValues');
      expect(picklistTest).toBeDefined();
      expect(picklistTest?.recordTypeName).toBe('Customer');
    });

    it('should generate assignment test for each record type', () => {
      const recordTypes: RecordType[] = [
        {
          fullName: 'Customer',
          label: 'Customer',
          active: true,
        },
      ];

      const tests = convertRecordTypesToTests(mockObjectDef, recordTypes);

      const assignmentTest = tests.find(t => t.testScenario === 'assignment');
      expect(assignmentTest).toBeDefined();
      expect(assignmentTest?.recordTypeName).toBe('Customer');
    });
  });

  describe('generateRecordTypeTestGroup', () => {
    it('should generate test group with correct structure', () => {
      const recordTypes: RecordType[] = [
        {
          fullName: 'Customer',
          label: 'Customer',
          active: true,
        },
      ];

      const testGroup = generateRecordTypeTestGroup(mockObjectDef, recordTypes);

      expect(testGroup.groupName).toBe('Record Types - Account');
      expect(testGroup.testType).toBe('RecordType');
      // With fields in mockObjectDef, we get: creation + field visibility + assignment = 3 tests
      expect(testGroup.tests.length).toBeGreaterThanOrEqual(2); // At least creation + assignment
      expect(testGroup.tags).toBeDefined();
      expect(testGroup.tags).toContain('@record-type');
      expect(testGroup.tags).toContain('@Account');
    });

    it('should handle empty record types array', () => {
      const testGroup = generateRecordTypeTestGroup(mockObjectDef, []);

      expect(testGroup.tests).toHaveLength(0);
      expect(testGroup.groupName).toBe('Record Types - Account');
    });

    it('should filter out inactive record types', () => {
      const recordTypes: RecordType[] = [
        {
          fullName: 'Customer',
          label: 'Customer',
          active: false,
        },
      ];

      const testGroup = generateRecordTypeTestGroup(mockObjectDef, recordTypes);

      expect(testGroup.tests).toHaveLength(0);
    });
  });
});

