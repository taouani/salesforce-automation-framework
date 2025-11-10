/**
 * Type definitions for Flow dependency graph structures
 */

import type { FlowToObjectRelationshipType } from './flow-parsed.js';

/**
 * Node in the dependency graph representing a Flow or subflow
 */
export interface FlowDependencyNode {
  name: string; // Flow or subflow name
  type: 'flow' | 'subflow'; // Node type
  [key: string]: unknown;
}

/**
 * Edge in the dependency graph representing a relationship between flows
 */
export interface FlowDependencyEdge {
  sourceFlow: string; // Source flow name
  targetFlow: string; // Target flow (subflow) name
  location?: string; // Location in source flow where subflow is called
  [key: string]: unknown;
}

/**
 * Dependency graph for storing Flow-to-Flow relationships (subflows)
 */
export interface FlowDependencyGraph {
  nodes: Map<string, FlowDependencyNode>;
  addDependency(sourceFlow: string, targetFlow: string, location?: string): void;
  getDependencies(flowName: string): FlowDependencyEdge[];
  getDependents(flowName: string): FlowDependencyEdge[]; // Get flows that depend on this flow
  getRelatedFlows(flowName: string): string[]; // Get all related flows
  toJSON(): FlowDependencyGraphJSON;
}

/**
 * JSON representation of Flow dependency graph for persistence
 */
export interface FlowDependencyGraphJSON {
  nodes: Record<string, FlowDependencyNode>;
  edges: FlowDependencyEdge[];
}

/**
 * Node in the Flow-to-object dependency graph
 */
export interface FlowToObjectNode {
  name: string; // Flow name or object name
  type: 'flow' | 'object'; // Node type
  [key: string]: unknown;
}

/**
 * Edge in the Flow-to-object dependency graph
 */
export interface FlowToObjectEdge {
  flowName: string; // Flow name
  objectName: string; // Salesforce object name
  relationshipType: FlowToObjectRelationshipType;
  details?: Record<string, unknown>; // Additional relationship details
  [key: string]: unknown;
}

/**
 * Dependency graph for storing Flow-to-object relationships
 */
export interface FlowToObjectDependencyGraph {
  nodes: Map<string, FlowToObjectNode>;
  addRelationship(flowName: string, objectName: string, relationshipType: FlowToObjectRelationshipType, details?: Record<string, unknown>): void;
  getRelationships(flowName: string): FlowToObjectEdge[];
  getObjectsForFlow(flowName: string): string[]; // Get all objects used by a flow
  getFlowsForObject(objectName: string): string[]; // Get all flows that use an object
  toJSON(): FlowToObjectDependencyGraphJSON;
}

/**
 * JSON representation of Flow-to-object dependency graph for persistence
 */
export interface FlowToObjectDependencyGraphJSON {
  nodes: Record<string, FlowToObjectNode>;
  edges: FlowToObjectEdge[];
}

