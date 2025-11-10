/**
 * Apex-to-object dependency graph implementation
 */

import type {
  ApexToObjectDependencyGraph,
  ApexToObjectNode,
  ApexToObjectEdge,
  ApexToObjectDependencyGraphJSON,
} from '../types/apex-dependency-graph.js';
import type { ApexToObjectRelationshipType } from '../types/apex-parsed.js';

/**
 * Apex-to-object dependency graph implementation
 */
export class ApexToObjectDependencyGraphImpl implements ApexToObjectDependencyGraph {
  nodes: Map<string, ApexToObjectNode> = new Map();
  private edges: ApexToObjectEdge[] = [];

  /**
   * Adds a relationship between Apex class/trigger and Salesforce object
   */
  addRelationship(
    apexName: string,
    objectName: string,
    relationshipType: ApexToObjectRelationshipType,
    details?: Record<string, unknown>
  ): void {
    // Get or create Apex node
    if (!this.nodes.has(apexName)) {
      this.nodes.set(apexName, {
        name: apexName,
        type: 'apex',
      });
    }

    // Get or create object node
    if (!this.nodes.has(objectName)) {
      this.nodes.set(objectName, {
        name: objectName,
        type: 'object',
      });
    }

    // Add edge
    const edge: ApexToObjectEdge = {
      apexName,
      objectName,
      relationshipType,
      details,
    };
    this.edges.push(edge);
  }

  /**
   * Gets all relationships for an Apex class/trigger
   */
  getRelationships(apexName: string): ApexToObjectEdge[] {
    return this.edges.filter((edge) => edge.apexName === apexName);
  }

  /**
   * Gets all objects used by an Apex class/trigger
   */
  getObjectsForApex(apexName: string): string[] {
    const relationships = this.getRelationships(apexName);
    const objects = new Set<string>();
    relationships.forEach((rel) => objects.add(rel.objectName));
    return Array.from(objects);
  }

  /**
   * Gets all Apex classes/triggers that use an object
   */
  getApexForObject(objectName: string): string[] {
    const apexClasses = new Set<string>();
    this.edges.forEach((edge) => {
      if (edge.objectName === objectName) {
        apexClasses.add(edge.apexName);
      }
    });
    return Array.from(apexClasses);
  }

  /**
   * Converts graph to JSON for persistence
   */
  toJSON(): ApexToObjectDependencyGraphJSON {
    const nodes: Record<string, ApexToObjectNode> = {};
    for (const [name, node] of this.nodes.entries()) {
      nodes[name] = node;
    }
    return {
      nodes,
      edges: [...this.edges],
    };
  }
}

