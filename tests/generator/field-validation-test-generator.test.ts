/**
 * Tests for field validation test generator
 */

import { describe, it, expect } from 'vitest';
import {
  convertFieldsToValidationTests,
  generateFieldValidationTestGroup,
} from '../../src/generator/test-specs/field-validation-test-generator.js';
import type { ObjectDefinition, FieldDefinition } from '../../src/types/xml-parsed.js';

describe('Field Validation Test Generator', () => {
  const mockObjectDef: ObjectDefinition = {
    fullName: 'Account',
    label: 'Account',
    fields: [],
    validationRules: [],
    recordTypes: [],
    relationships: [],
  };

  describe('convertFieldsToValidationTests', () => {
    it('should generate test for required fields', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Name',
          type: 'String',
          label: 'Account Name',
          required: true,
        },
        {
          fullName: 'Email__c',
          type: 'Email',
          label: 'Email',
          required: true,
        },
        {
          fullName: 'Description__c',
          type: 'Text',
          label: 'Description',
          required: false,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      // Name: required test
      // Email__c: required test + format test (Email type)
      expect(tests.length).toBeGreaterThanOrEqual(3);
      expect(tests.some(t => t.fieldName === 'Name' && t.validationType === 'required')).toBe(true);
      expect(tests.some(t => t.fieldName === 'Email__c' && t.validationType === 'required')).toBe(true);
      expect(tests.some(t => t.fieldName === 'Email__c' && t.validationType === 'format')).toBe(true);
    });

    it('should skip non-required fields', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Description__c',
          type: 'Text',
          label: 'Description',
          required: false,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      expect(tests).toHaveLength(0);
    });

    it('should include field validation type as required', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Name',
          type: 'String',
          label: 'Account Name',
          required: true,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      expect(tests[0].validationType).toBe('required');
    });

    it('should include expected error message', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Name',
          type: 'String',
          label: 'Account Name',
          required: true,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      expect(tests[0].expectedError).toBeDefined();
      expect(tests[0].expectedError).toContain('Name');
    });

    it('should include tags in test definitions', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Name',
          type: 'String',
          label: 'Account Name',
          required: true,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      expect(tests[0].tags).toBeDefined();
      expect(tests[0].tags).toContain('@field-validation');
      expect(tests[0].tags).toContain('@Account');
    });

    it('should generate test names with field name', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Name',
          type: 'String',
          label: 'Account Name',
          required: true,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      const requiredTest = tests.find(t => t.validationType === 'required');
      expect(requiredTest).toBeDefined();
      expect(requiredTest?.name).toContain('field');
      expect(requiredTest?.name).toContain('name');
      expect(requiredTest?.name).toContain('required');
    });

    it('should generate format validation test for Email fields', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Email__c',
          type: 'Email',
          label: 'Email',
          required: false,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      const formatTest = tests.find(t => t.validationType === 'format');
      expect(formatTest).toBeDefined();
      expect(formatTest?.fieldName).toBe('Email__c');
      expect(formatTest?.fieldType).toBe('Email');
    });

    it('should generate format validation test for Phone fields', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Phone__c',
          type: 'Phone',
          label: 'Phone',
          required: false,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      const formatTest = tests.find(t => t.validationType === 'format');
      expect(formatTest).toBeDefined();
      expect(formatTest?.fieldName).toBe('Phone__c');
      expect(formatTest?.fieldType).toBe('Phone');
    });

    it('should generate format validation test for URL fields', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Website__c',
          type: 'URL',
          label: 'Website',
          required: false,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      const formatTest = tests.find(t => t.validationType === 'format');
      expect(formatTest).toBeDefined();
      expect(formatTest?.fieldName).toBe('Website__c');
      expect(formatTest?.fieldType).toBe('URL');
    });

    it('should generate length constraint test for String fields with length', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'ShortText__c',
          type: 'String',
          label: 'Short Text',
          required: false,
          length: 50,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      const lengthTest = tests.find(t => t.validationType === 'length');
      expect(lengthTest).toBeDefined();
      expect(lengthTest?.fieldName).toBe('ShortText__c');
      expect(lengthTest?.fieldType).toBe('String');
      expect(lengthTest?.expectedError).toContain('50');
    });

    it('should generate length constraint test for Text fields with length', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'LongText__c',
          type: 'Text',
          label: 'Long Text',
          required: false,
          length: 100,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      const lengthTest = tests.find(t => t.validationType === 'length');
      expect(lengthTest).toBeDefined();
      expect(lengthTest?.fieldName).toBe('LongText__c');
      expect(lengthTest?.fieldType).toBe('Text');
    });

    it('should not generate length constraint test for fields without length', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Name',
          type: 'String',
          label: 'Name',
          required: false,
          // No length property
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      const lengthTest = tests.find(t => t.validationType === 'length');
      expect(lengthTest).toBeUndefined();
    });

    it('should generate picklist restriction test for Picklist fields', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Status__c',
          type: 'Picklist',
          label: 'Status',
          required: false,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      const picklistTest = tests.find(t => t.validationType === 'picklist');
      expect(picklistTest).toBeDefined();
      expect(picklistTest?.fieldName).toBe('Status__c');
      expect(picklistTest?.fieldType).toBe('Picklist');
    });

    it('should generate picklist restriction test for MultiPicklist fields', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Categories__c',
          type: 'MultiPicklist',
          label: 'Categories',
          required: false,
        },
      ];

      const tests = convertFieldsToValidationTests(mockObjectDef, fields);

      const picklistTest = tests.find(t => t.validationType === 'picklist');
      expect(picklistTest).toBeDefined();
      expect(picklistTest?.fieldName).toBe('Categories__c');
      expect(picklistTest?.fieldType).toBe('MultiPicklist');
    });
  });

  describe('generateFieldValidationTestGroup', () => {
    it('should generate test group with correct structure', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Name',
          type: 'String',
          label: 'Account Name',
          required: true,
        },
      ];

      const testGroup = generateFieldValidationTestGroup(mockObjectDef, fields);

      expect(testGroup.groupName).toBe('Field Validations - Account');
      expect(testGroup.testType).toBe('FieldValidation');
      expect(testGroup.tests.length).toBeGreaterThanOrEqual(1);
      expect(testGroup.tags).toBeDefined();
      expect(testGroup.tags).toContain('@field-validation');
      expect(testGroup.tags).toContain('@Account');
    });

    it('should handle empty fields array', () => {
      const testGroup = generateFieldValidationTestGroup(mockObjectDef, []);

      expect(testGroup.tests).toHaveLength(0);
      expect(testGroup.groupName).toBe('Field Validations - Account');
    });

    it('should filter out non-required fields', () => {
      const fields: FieldDefinition[] = [
        {
          fullName: 'Description__c',
          type: 'Text',
          label: 'Description',
          required: false,
        },
      ];

      const testGroup = generateFieldValidationTestGroup(mockObjectDef, fields);

      expect(testGroup.tests).toHaveLength(0);
    });
  });
});

