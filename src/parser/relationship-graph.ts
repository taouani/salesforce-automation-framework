/**
 * Relationship graph implementation for object relationships
 */

import type { Relationship } from '../types/xml-parsed.js';
import type {
  RelationshipGraph,
  RelationshipNode,
  RelationshipEdge,
  RelationshipGraphJSON,
} from '../types/relationship-graph.js';

/**
 * Relationship graph implementation
 */
export class RelationshipGraphImpl implements RelationshipGraph {
  nodes: Map<string, RelationshipNode> = new Map();

  /**
   * Adds a relationship to the graph
   */
  addRelationship(relationship: Relationship, sourceObject: string): void {
    // Get or create source node
    if (!this.nodes.has(sourceObject)) {
      this.nodes.set(sourceObject, {
        objectName: sourceObject,
        relationships: [],
      });
    }

    const sourceNode = this.nodes.get(sourceObject)!;

    // Add outgoing edge
    const outgoingEdge: RelationshipEdge = {
      fieldName: relationship.fieldName,
      relatedObject: relationship.relatedObject,
      type: relationship.type,
      direction: 'outgoing',
      relationship,
    };
    sourceNode.relationships.push(outgoingEdge);

    // Get or create target node
    if (!this.nodes.has(relationship.relatedObject)) {
      this.nodes.set(relationship.relatedObject, {
        objectName: relationship.relatedObject,
        relationships: [],
      });
    }

    const targetNode = this.nodes.get(relationship.relatedObject)!;

    // Add incoming edge
    const incomingEdge: RelationshipEdge = {
      fieldName: relationship.fieldName,
      relatedObject: sourceObject,
      type: relationship.type,
      direction: 'incoming',
      relationship: {
        ...relationship,
        relatedObject: sourceObject,
      },
    };
    targetNode.relationships.push(incomingEdge);
  }

  /**
   * Gets all relationships for an object
   */
  getRelationships(objectName: string): RelationshipEdge[] {
    const node = this.nodes.get(objectName);
    return node ? [...node.relationships] : [];
  }

  /**
   * Gets outgoing relationships (where this object is the source)
   */
  getOutgoingRelationships(objectName: string): RelationshipEdge[] {
    return this.getRelationships(objectName).filter((r) => r.direction === 'outgoing');
  }

  /**
   * Gets incoming relationships (where this object is the target)
   */
  getIncomingRelationships(objectName: string): RelationshipEdge[] {
    return this.getRelationships(objectName).filter((r) => r.direction === 'incoming');
  }

  /**
   * Gets all related objects (both incoming and outgoing)
   */
  getRelatedObjects(objectName: string): string[] {
    const relationships = this.getRelationships(objectName);
    const relatedObjects = new Set<string>();
    for (const rel of relationships) {
      if (rel.direction === 'outgoing') {
        relatedObjects.add(rel.relatedObject);
      } else {
        relatedObjects.add(rel.relatedObject);
      }
    }
    return Array.from(relatedObjects);
  }

  /**
   * Converts graph to JSON format
   */
  toJSON(): RelationshipGraphJSON {
    return {
      nodes: Array.from(this.nodes.values()),
      generatedAt: new Date().toISOString(),
    };
  }
}

