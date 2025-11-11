/**
 * Tests for validation rule test generator
 */

import { describe, it, expect } from 'vitest';
import {
  convertValidationRulesToTests,
  generateValidationRuleTestGroup,
} from '../../src/generator/test-specs/validation-rule-test-generator.js';
import type { ObjectDefinition, ValidationRule } from '../../src/types/xml-parsed.js';

describe('Validation Rule Test Generator', () => {
  const mockObjectDef: ObjectDefinition = {
    fullName: 'Account',
    label: 'Account',
    fields: [],
    validationRules: [],
    recordTypes: [],
    relationships: [],
  };

  describe('convertValidationRulesToTests', () => {
    it('should generate positive and negative tests for each active validation rule', () => {
      const validationRules: ValidationRule[] = [
        {
          fullName: 'AccountNameRequired',
          active: true,
          errorMessage: 'Account Name is required',
          errorConditionFormula: 'ISBLANK(Name)',
        },
        {
          fullName: 'AccountEmailFormat',
          active: true,
          errorMessage: 'Email format is invalid',
          errorConditionFormula: 'NOT(REGEX(Email__c, "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"))',
        },
      ];

      const tests = convertValidationRulesToTests(mockObjectDef, validationRules);

      expect(tests).toHaveLength(4); // 2 rules × 2 tests each (positive + negative)
      expect(tests.filter(t => t.isPositive)).toHaveLength(2);
      expect(tests.filter(t => !t.isPositive)).toHaveLength(2);
    });

    it('should skip inactive validation rules', () => {
      const validationRules: ValidationRule[] = [
        {
          fullName: 'AccountNameRequired',
          active: false,
          errorMessage: 'Account Name is required',
          errorConditionFormula: 'ISBLANK(Name)',
        },
      ];

      const tests = convertValidationRulesToTests(mockObjectDef, validationRules);

      expect(tests).toHaveLength(0);
    });

    it('should include validation rule name and error message in tests', () => {
      const validationRules: ValidationRule[] = [
        {
          fullName: 'AccountNameRequired',
          active: true,
          errorMessage: 'Account Name is required',
          errorConditionFormula: 'ISBLANK(Name)',
        },
      ];

      const tests = convertValidationRulesToTests(mockObjectDef, validationRules);

      expect(tests[0].validationRuleName).toBe('AccountNameRequired');
      expect(tests[0].validationRuleMessage).toBe('Account Name is required');
      expect(tests[1].validationRuleName).toBe('AccountNameRequired');
      expect(tests[1].validationRuleMessage).toBe('Account Name is required');
    });

    it('should include tags in test definitions', () => {
      const validationRules: ValidationRule[] = [
        {
          fullName: 'AccountNameRequired',
          active: true,
          errorMessage: 'Account Name is required',
          errorConditionFormula: 'ISBLANK(Name)',
        },
      ];

      const tests = convertValidationRulesToTests(mockObjectDef, validationRules);

      expect(tests[0].tags).toBeDefined();
      expect(tests[0].tags).toContain('@validation-rule');
      expect(tests[0].tags).toContain('@Account');
      expect(tests[1].tags).toBeDefined();
      expect(tests[1].tags).toContain('@validation-rule');
      expect(tests[1].tags).toContain('@Account');
    });

    it('should generate test names with validation rule name', () => {
      const validationRules: ValidationRule[] = [
        {
          fullName: 'AccountNameRequired',
          active: true,
          errorMessage: 'Account Name is required',
          errorConditionFormula: 'ISBLANK(Name)',
        },
      ];

      const tests = convertValidationRulesToTests(mockObjectDef, validationRules);

      expect(tests[0].name).toContain('validation');
      expect(tests[0].name).toContain('accountnamerequired');
      expect(tests[0].name).toContain('positive');
      expect(tests[1].name).toContain('negative');
    });
  });

  describe('generateValidationRuleTestGroup', () => {
    it('should generate test group with correct structure', () => {
      const validationRules: ValidationRule[] = [
        {
          fullName: 'AccountNameRequired',
          active: true,
          errorMessage: 'Account Name is required',
          errorConditionFormula: 'ISBLANK(Name)',
        },
      ];

      const testGroup = generateValidationRuleTestGroup(mockObjectDef, validationRules);

      expect(testGroup.groupName).toBe('Validation Rules - Account');
      expect(testGroup.testType).toBe('ValidationRule');
      expect(testGroup.tests).toHaveLength(2);
      expect(testGroup.tags).toBeDefined();
      expect(testGroup.tags).toContain('@validation-rule');
      expect(testGroup.tags).toContain('@Account');
    });

    it('should handle empty validation rules array', () => {
      const testGroup = generateValidationRuleTestGroup(mockObjectDef, []);

      expect(testGroup.tests).toHaveLength(0);
      expect(testGroup.groupName).toBe('Validation Rules - Account');
    });

    it('should filter out inactive validation rules', () => {
      const validationRules: ValidationRule[] = [
        {
          fullName: 'AccountNameRequired',
          active: false,
          errorMessage: 'Account Name is required',
          errorConditionFormula: 'ISBLANK(Name)',
        },
      ];

      const testGroup = generateValidationRuleTestGroup(mockObjectDef, validationRules);

      expect(testGroup.tests).toHaveLength(0);
    });
  });
});

