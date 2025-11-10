/**
 * Tests for relationship graph
 */

import { describe, it, expect } from 'vitest';
import { RelationshipGraphImpl } from '../../src/parser/relationship-graph.js';
import type { Relationship } from '../../src/types/xml-parsed.js';

describe('RelationshipGraphImpl', () => {
  let graph: RelationshipGraphImpl;

  beforeEach(() => {
    graph = new RelationshipGraphImpl();
  });

  it('should add relationships to the graph', () => {
    const relationship: Relationship = {
      fieldName: 'ContactId',
      type: 'Lookup',
      relatedObject: 'Contact',
    };

    graph.addRelationship(relationship, 'Account');

    const accountRelationships = graph.getRelationships('Account');
    expect(accountRelationships).toHaveLength(1);
    expect(accountRelationships[0].relatedObject).toBe('Contact');
  });

  it('should support bidirectional traversal', () => {
    const relationship: Relationship = {
      fieldName: 'AccountId',
      type: 'MasterDetail',
      relatedObject: 'Account',
    };

    graph.addRelationship(relationship, 'Contact');

    const contactOutgoing = graph.getOutgoingRelationships('Contact');
    expect(contactOutgoing).toHaveLength(1);
    expect(contactOutgoing[0].relatedObject).toBe('Account');

    const accountIncoming = graph.getIncomingRelationships('Account');
    expect(accountIncoming).toHaveLength(1);
    expect(accountIncoming[0].relatedObject).toBe('Contact');
  });

  it('should get related objects', () => {
    const relationship1: Relationship = {
      fieldName: 'ContactId',
      type: 'Lookup',
      relatedObject: 'Contact',
    };
    const relationship2: Relationship = {
      fieldName: 'OwnerId',
      type: 'Lookup',
      relatedObject: 'User',
    };

    graph.addRelationship(relationship1, 'Account');
    graph.addRelationship(relationship2, 'Account');

    const related = graph.getRelatedObjects('Account');
    expect(related).toContain('Contact');
    expect(related).toContain('User');
  });

  it('should convert to JSON', () => {
    const relationship: Relationship = {
      fieldName: 'ContactId',
      type: 'Lookup',
      relatedObject: 'Contact',
    };

    graph.addRelationship(relationship, 'Account');

    const json = graph.toJSON();
    expect(json.nodes).toHaveLength(2); // Account and Contact
    expect(json.generatedAt).toBeDefined();
  });
});

