/**
 * Type definitions for Apex-to-object dependency graph structures
 */

import type { ApexToObjectRelationshipType } from './apex-parsed.js';

/**
 * Node in the dependency graph representing an Apex class/trigger or Salesforce object
 */
export interface ApexToObjectNode {
  name: string; // Apex class/trigger name or object name
  type: 'apex' | 'object'; // Node type
  [key: string]: unknown;
}

/**
 * Edge in the dependency graph representing a relationship between Apex and object
 */
export interface ApexToObjectEdge {
  apexName: string; // Apex class or trigger name
  objectName: string; // Salesforce object name
  relationshipType: ApexToObjectRelationshipType; // SOQL, DML, parameter, return type, trigger
  details?: Record<string, unknown>; // Additional relationship details
  [key: string]: unknown;
}

/**
 * Dependency graph for storing Apex-to-object relationships
 */
export interface ApexToObjectDependencyGraph {
  nodes: Map<string, ApexToObjectNode>;
  addRelationship(apexName: string, objectName: string, relationshipType: ApexToObjectRelationshipType, details?: Record<string, unknown>): void;
  getRelationships(apexName: string): ApexToObjectEdge[];
  getObjectsForApex(apexName: string): string[]; // Get all objects used by an Apex class/trigger
  getApexForObject(objectName: string): string[]; // Get all Apex classes/triggers that use an object
  toJSON(): ApexToObjectDependencyGraphJSON;
}

/**
 * JSON representation of dependency graph for persistence
 */
export interface ApexToObjectDependencyGraphJSON {
  nodes: Record<string, ApexToObjectNode>;
  edges: ApexToObjectEdge[];
}

