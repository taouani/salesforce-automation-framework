/**
 * Tests for XML parsed type definitions
 */

import { describe, it, expect } from 'vitest';
import type {
  ObjectDefinition,
  FieldDefinition,
  ValidationRule,
  RecordType,
  Relationship,
} from '../../src/types/xml-parsed.js';

describe('ObjectDefinition interface', () => {
  it('should create a valid ObjectDefinition', () => {
    const obj: ObjectDefinition = {
      fullName: 'Account',
      label: 'Account',
      pluralLabel: 'Accounts',
      fields: [],
      validationRules: [],
      recordTypes: [],
      relationships: [],
    };

    expect(obj.fullName).toBe('Account');
    expect(obj.fields).toEqual([]);
  });
});

describe('FieldDefinition interface', () => {
  it('should create a valid FieldDefinition', () => {
    const field: FieldDefinition = {
      fullName: 'Name',
      type: 'String',
      label: 'Account Name',
      required: true,
      length: 255,
    };

    expect(field.fullName).toBe('Name');
    expect(field.type).toBe('String');
    expect(field.required).toBe(true);
  });
});

describe('ValidationRule interface', () => {
  it('should create a valid ValidationRule', () => {
    const rule: ValidationRule = {
      fullName: 'TestRule',
      active: true,
      errorConditionFormula: 'ISBLANK(Name)',
      errorMessage: 'Name is required',
    };

    expect(rule.fullName).toBe('TestRule');
    expect(rule.active).toBe(true);
    expect(rule.errorConditionFormula).toBe('ISBLANK(Name)');
  });
});

describe('RecordType interface', () => {
  it('should create a valid RecordType', () => {
    const recordType: RecordType = {
      fullName: 'Customer',
      label: 'Customer',
      active: true,
    };

    expect(recordType.fullName).toBe('Customer');
    expect(recordType.active).toBe(true);
  });
});

describe('Relationship interface', () => {
  it('should create a valid Relationship', () => {
    const relationship: Relationship = {
      fieldName: 'ContactId',
      type: 'Lookup',
      relatedObject: 'Contact',
    };

    expect(relationship.fieldName).toBe('ContactId');
    expect(relationship.type).toBe('Lookup');
    expect(relationship.relatedObject).toBe('Contact');
  });
});

