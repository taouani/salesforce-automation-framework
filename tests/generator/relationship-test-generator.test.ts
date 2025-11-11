/**
 * Tests for relationship test generator
 */

import { describe, it, expect } from 'vitest';
import {
  convertRelationshipsToTests,
  generateRelationshipTestGroup,
} from '../../src/generator/test-specs/relationship-test-generator.js';
import type { ObjectDefinition, Relationship } from '../../src/types/xml-parsed.js';

describe('Relationship Test Generator', () => {
  const mockObjectDef: ObjectDefinition = {
    fullName: 'Contact',
    label: 'Contact',
    fields: [],
    validationRules: [],
    recordTypes: [],
    relationships: [],
  };

  describe('convertRelationshipsToTests', () => {
    it('should generate multiple tests for each relationship', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'Lookup',
          relatedObject: 'Account',
        },
        {
          fieldName: 'ParentContactId',
          type: 'Lookup',
          relatedObject: 'Contact',
        },
      ];

      const tests = convertRelationshipsToTests(mockObjectDef, relationships);

      // Each relationship generates: population, update, navigation = 3 tests
      // 2 relationships × 3 tests = 6 tests
      expect(tests.length).toBeGreaterThanOrEqual(6);
      expect(tests.filter(t => t.relationshipName === 'AccountId' && t.testScenario === 'population')).toHaveLength(1);
      expect(tests.filter(t => t.relationshipName === 'AccountId' && t.testScenario === 'update')).toHaveLength(1);
      expect(tests.filter(t => t.relationshipName === 'AccountId' && t.testScenario === 'navigation')).toHaveLength(1);
    });

    it('should correctly identify lookup relationships', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'Lookup',
          relatedObject: 'Account',
        },
      ];

      const tests = convertRelationshipsToTests(mockObjectDef, relationships);

      const populationTest = tests.find(t => t.testScenario === 'population');
      expect(populationTest).toBeDefined();
      expect(populationTest?.relationshipType).toBe('lookup');
      expect(populationTest?.parentObject).toBe('Contact');
      expect(populationTest?.childObject).toBe('Account');
    });

    it('should correctly identify master-detail relationships', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'MasterDetail',
          relatedObject: 'Account',
        },
      ];

      const tests = convertRelationshipsToTests(mockObjectDef, relationships);

      const populationTest = tests.find(t => t.testScenario === 'population');
      expect(populationTest).toBeDefined();
      expect(populationTest?.relationshipType).toBe('masterDetail');
      expect(populationTest?.parentObject).toBe('Account');
      expect(populationTest?.childObject).toBe('Contact');
    });

    it('should generate cascade delete test for master-detail relationships', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'MasterDetail',
          relatedObject: 'Account',
          cascadeDelete: true,
        },
      ];

      const tests = convertRelationshipsToTests(mockObjectDef, relationships);

      const cascadeDeleteTest = tests.find(t => t.testScenario === 'cascadeDelete');
      expect(cascadeDeleteTest).toBeDefined();
      expect(cascadeDeleteTest?.relationshipName).toBe('AccountId');
      expect(cascadeDeleteTest?.relationshipType).toBe('masterDetail');
    });

    it('should not generate cascade delete test for lookup relationships', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'Lookup',
          relatedObject: 'Account',
        },
      ];

      const tests = convertRelationshipsToTests(mockObjectDef, relationships);

      const cascadeDeleteTest = tests.find(t => t.testScenario === 'cascadeDelete');
      expect(cascadeDeleteTest).toBeUndefined();
    });

    it('should generate update test for relationships', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'Lookup',
          relatedObject: 'Account',
        },
      ];

      const tests = convertRelationshipsToTests(mockObjectDef, relationships);

      const updateTest = tests.find(t => t.testScenario === 'update');
      expect(updateTest).toBeDefined();
      expect(updateTest?.relationshipName).toBe('AccountId');
    });

    it('should generate navigation test for relationships', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'Lookup',
          relatedObject: 'Account',
        },
      ];

      const tests = convertRelationshipsToTests(mockObjectDef, relationships);

      const navigationTest = tests.find(t => t.testScenario === 'navigation');
      expect(navigationTest).toBeDefined();
      expect(navigationTest?.relationshipName).toBe('AccountId');
    });

    it('should include tags in test definitions', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'Lookup',
          relatedObject: 'Account',
        },
      ];

      const tests = convertRelationshipsToTests(mockObjectDef, relationships);

      expect(tests[0].tags).toBeDefined();
      expect(tests[0].tags).toContain('@relationship');
      expect(tests[0].tags).toContain('@Contact');
    });

    it('should generate test names with relationship field name', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'Lookup',
          relatedObject: 'Account',
        },
      ];

      const tests = convertRelationshipsToTests(mockObjectDef, relationships);

      const populationTest = tests.find(t => t.testScenario === 'population');
      expect(populationTest).toBeDefined();
      expect(populationTest?.name).toContain('relationship');
      expect(populationTest?.name).toContain('accountid');
      expect(populationTest?.name).toContain('population');
    });
  });

  describe('generateRelationshipTestGroup', () => {
    it('should generate test group with correct structure', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'Lookup',
          relatedObject: 'Account',
        },
      ];

      const testGroup = generateRelationshipTestGroup(mockObjectDef, relationships);

      expect(testGroup.groupName).toBe('Relationships - Contact');
      expect(testGroup.testType).toBe('Relationship');
      // Each relationship generates: population, update, navigation = 3 tests
      expect(testGroup.tests.length).toBeGreaterThanOrEqual(3);
      expect(testGroup.tags).toBeDefined();
      expect(testGroup.tags).toContain('@relationship');
      expect(testGroup.tags).toContain('@Contact');
    });

    it('should filter relationships based on available objects', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'Lookup',
          relatedObject: 'Account',
        },
        {
          fieldName: 'CustomObjectId__c',
          type: 'Lookup',
          relatedObject: 'CustomObject__c',
        },
      ];

      const availableObjects = new Set(['Account', 'Contact']);

      const testGroup = generateRelationshipTestGroup(mockObjectDef, relationships, availableObjects);

      // Should only include AccountId relationship since CustomObject__c is not available
      // AccountId generates: population, update, navigation = 3 tests
      expect(testGroup.tests.length).toBeGreaterThanOrEqual(3);
      expect(testGroup.tests.every(t => t.relationshipName === 'AccountId')).toBe(true);
    });

    it('should handle empty relationships array', () => {
      const testGroup = generateRelationshipTestGroup(mockObjectDef, []);

      expect(testGroup.tests).toHaveLength(0);
      expect(testGroup.groupName).toBe('Relationships - Contact');
    });

    it('should filter master-detail relationships correctly', () => {
      const relationships: Relationship[] = [
        {
          fieldName: 'AccountId',
          type: 'MasterDetail',
          relatedObject: 'Account',
          cascadeDelete: true,
        },
      ];

      const availableObjects = new Set(['Account', 'Contact']);

      const testGroup = generateRelationshipTestGroup(mockObjectDef, relationships, availableObjects);

      // Master-detail generates: population, cascade delete, update, navigation = 4 tests
      expect(testGroup.tests.length).toBeGreaterThanOrEqual(4);
      const populationTest = testGroup.tests.find(t => t.testScenario === 'population');
      expect(populationTest).toBeDefined();
      expect(populationTest?.parentObject).toBe('Account');
      expect(populationTest?.childObject).toBe('Contact');
    });
  });
});

