/**
 * Tests for test data factory generator
 */

import { describe, it, expect } from 'vitest';
import {
  generateTestDataFactory,
  generateRelationshipHelper,
  generateCleanupFunction,
  generateTestDataFactoriesForObject,
} from '../../src/generator/test-data/test-data-factory-generator.js';
import type { ObjectDefinition, FieldDefinition, Relationship } from '../../src/types/xml-parsed.js';

describe('Test Data Factory Generator', () => {
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
      {
        fullName: 'Phone',
        type: 'Phone',
        label: 'Phone',
        required: false,
      } as FieldDefinition,
    ],
    validationRules: [],
    recordTypes: [],
    relationships: [],
  };

  it('should generate test data factory for object', () => {
    const factory = generateTestDataFactory(mockAccountObject);
    
    expect(factory.objectName).toBe('Account');
    expect(factory.functionName).toBe('createAccount');
    expect(factory.returnType).toBe('Promise<string>');
    expect(factory.usesAPI).toBe(true);
    expect(factory.parameters).toHaveLength(2); // Name (required) + additionalData
    expect(factory.implementation).toContain('createAccount');
    expect(factory.implementation).toContain('SalesforceRESTAPIClient');
  });

  it('should generate relationship helper', () => {
    const relationship: Relationship = {
      fieldName: 'AccountId',
      type: 'Lookup',
      relatedObject: 'Account',
    };
    
    const helper = generateRelationshipHelper(relationship, 'Account', 'Contact');
    
    expect(helper.helperName).toBe('createContactForAccount');
    expect(helper.purpose).toBe('createRelated');
    expect(helper.usesAPI).toBe(true);
    expect(helper.implementation).toContain('AccountId');
  });

  it('should generate cleanup function', () => {
    const cleanup = generateCleanupFunction('Account');
    
    expect(cleanup.helperName).toBe('deleteAccount');
    expect(cleanup.purpose).toBe('cleanup');
    expect(cleanup.usesAPI).toBe(true);
    expect(cleanup.parameters).toHaveLength(1);
    expect(cleanup.parameters[0].name).toBe('recordId');
  });

  it('should generate all factories and helpers for object', () => {
    const relationships: Relationship[] = [
      {
        fieldName: 'AccountId',
        type: 'Lookup',
        relatedObject: 'Account',
      },
    ];
    
    const result = generateTestDataFactoriesForObject(mockAccountObject, relationships);
    
    expect(result.factory).toBeDefined();
    expect(result.helpers).toHaveLength(1);
    expect(result.cleanup).toBeDefined();
    expect(result.factory.objectName).toBe('Account');
    expect(result.helpers[0].helperName).toBe('createAccountForAccount');
  });
});

