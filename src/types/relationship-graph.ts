/**
 * Type definitions for relationship graph structures
 */

import type { Relationship } from './xml-parsed.js';

/**
 * Node in the relationship graph representing an object
 */
export interface RelationshipNode {
  objectName: string;
  relationships: RelationshipEdge[];
}

/**
 * Edge in the relationship graph representing a relationship between objects
 */
export interface RelationshipEdge {
  fieldName: string;
  relatedObject: string;
  type: 'MasterDetail' | 'Lookup';
  direction: 'outgoing' | 'incoming';
  relationship: Relationship;
}

/**
 * Relationship graph for storing object relationships
 */
export interface RelationshipGraph {
  nodes: Map<string, RelationshipNode>;
  addRelationship(relationship: Relationship, sourceObject: string): void;
  getRelationships(objectName: string): RelationshipEdge[];
  getOutgoingRelationships(objectName: string): RelationshipEdge[];
  getIncomingRelationships(objectName: string): RelationshipEdge[];
  getRelatedObjects(objectName: string): string[];
  toJSON(): RelationshipGraphJSON;
}

/**
 * JSON representation of relationship graph for persistence
 */
export interface RelationshipGraphJSON {
  nodes: Array<{
    objectName: string;
    relationships: RelationshipEdge[];
  }>;
  generatedAt: string;
}

