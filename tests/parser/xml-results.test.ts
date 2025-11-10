/**
 * Tests for XML results structure
 */

import { describe, it, expect } from 'vitest';
import { ParsedXMLResultsImpl } from '../../src/parser/xml-results.js';
import { RelationshipGraphImpl } from '../../src/parser/relationship-graph.js';
import type { ObjectDefinition } from '../../src/types/xml-parsed.js';
import type { ProfileDefinition } from '../../src/types/profile-permissions.js';

describe('ParsedXMLResultsImpl', () => {
  it('should store and retrieve objects', () => {
    const graph = new RelationshipGraphImpl();
    const results = new ParsedXMLResultsImpl(graph);

    const object: ObjectDefinition = {
      fullName: 'TestObject__c',
      fields: [],
      validationRules: [],
      recordTypes: [],
      relationships: [],
    };

    results.addObject(object);
    const retrieved = results.getObject('TestObject__c');

    expect(retrieved).toBeDefined();
    expect(retrieved?.fullName).toBe('TestObject__c');
  });

  it('should get fields for an object', () => {
    const graph = new RelationshipGraphImpl();
    const results = new ParsedXMLResultsImpl(graph);

    const object: ObjectDefinition = {
      fullName: 'TestObject__c',
      fields: [
        {
          fullName: 'Name',
          type: 'String',
        },
      ],
      validationRules: [],
      recordTypes: [],
      relationships: [],
    };

    results.addObject(object);
    const fields = results.getFieldsForObject('TestObject__c');

    expect(fields).toHaveLength(1);
    expect(fields[0].fullName).toBe('Name');
  });

  it('should convert to JSON', () => {
    const graph = new RelationshipGraphImpl();
    const results = new ParsedXMLResultsImpl(graph);

    const object: ObjectDefinition = {
      fullName: 'TestObject__c',
      fields: [],
      validationRules: [],
      recordTypes: [],
      relationships: [],
    };

    results.addObject(object);
    const json = results.toJSON();

    expect(json.objects).toHaveLength(1);
    expect(json.parsedAt).toBeDefined();
  });
});

