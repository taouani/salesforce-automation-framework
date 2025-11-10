/**
 * Type definitions for Aura dependency graph structures
 */

/**
 * Aura-to-object relationship type enumeration
 */
export type AuraToObjectRelationshipType = 
  | 'attribute' // SObject type in attribute
  | 'binding' // Object reference in data binding
  | 'apexCall'; // Object reference in Apex call

/**
 * Aura-to-Apex relationship type enumeration
 */
export type AuraToApexRelationshipType = 
  | 'enqueueAction' // $A.enqueueAction() call
  | 'controller'; // Controller attribute reference

/**
 * Node in the Aura dependency graph (Aura-to-Aura)
 */
export interface AuraDependencyNode {
  name: string; // Component or application name
  type: 'component' | 'application'; // Node type
  [key: string]: unknown;
}

/**
 * Edge in the Aura dependency graph (Aura-to-Aura)
 */
export interface AuraDependencyEdge {
  sourceComponent: string; // Source component/application name
  targetComponent: string; // Target component name
  location?: string; // Location in source (markup, application dependency, etc.)
  [key: string]: unknown;
}

/**
 * Dependency graph for storing Aura-to-Aura component dependencies
 */
export interface AuraDependencyGraph {
  nodes: Map<string, AuraDependencyNode>;
  addDependency(sourceComponent: string, targetComponent: string, location?: string): void;
  getDependencies(componentName: string): AuraDependencyEdge[];
  getDependents(componentName: string): AuraDependencyEdge[]; // Get components that depend on this component
  getRelatedComponents(componentName: string): string[]; // Get all related components
  toJSON(): AuraDependencyGraphJSON;
}

/**
 * JSON representation of Aura dependency graph for persistence
 */
export interface AuraDependencyGraphJSON {
  nodes: Record<string, AuraDependencyNode>;
  edges: AuraDependencyEdge[];
}

/**
 * Node in the Aura-to-object dependency graph
 */
export interface AuraToObjectNode {
  name: string; // Component/application name or object name
  type: 'aura' | 'object'; // Node type
  [key: string]: unknown;
}

/**
 * Edge in the Aura-to-object dependency graph
 */
export interface AuraToObjectEdge {
  componentName: string; // Component or application name
  objectName: string; // Salesforce object name
  relationshipType: AuraToObjectRelationshipType;
  details?: Record<string, unknown>; // Additional relationship details
  [key: string]: unknown;
}

/**
 * Dependency graph for storing Aura-to-object relationships
 */
export interface AuraToObjectDependencyGraph {
  nodes: Map<string, AuraToObjectNode>;
  addRelationship(componentName: string, objectName: string, relationshipType: AuraToObjectRelationshipType, details?: Record<string, unknown>): void;
  getRelationships(componentName: string): AuraToObjectEdge[];
  getObjectsForComponent(componentName: string): string[]; // Get all objects used by a component
  getComponentsForObject(objectName: string): string[]; // Get all components that use an object
  toJSON(): AuraToObjectDependencyGraphJSON;
}

/**
 * JSON representation of Aura-to-object dependency graph for persistence
 */
export interface AuraToObjectDependencyGraphJSON {
  nodes: Record<string, AuraToObjectNode>;
  edges: AuraToObjectEdge[];
}

/**
 * Node in the Aura-to-Apex dependency graph
 */
export interface AuraToApexNode {
  name: string; // Component/application name or Apex class name
  type: 'aura' | 'apex'; // Node type
  [key: string]: unknown;
}

/**
 * Edge in the Aura-to-Apex dependency graph
 */
export interface AuraToApexEdge {
  componentName: string; // Component or application name
  apexClassName: string; // Apex class name
  relationshipType: AuraToApexRelationshipType;
  details?: Record<string, unknown>; // Additional relationship details (method name, etc.)
  [key: string]: unknown;
}

/**
 * Dependency graph for storing Aura-to-Apex relationships
 */
export interface AuraToApexDependencyGraph {
  nodes: Map<string, AuraToApexNode>;
  addRelationship(componentName: string, apexClassName: string, relationshipType: AuraToApexRelationshipType, details?: Record<string, unknown>): void;
  getRelationships(componentName: string): AuraToApexEdge[];
  getApexForComponent(componentName: string): string[]; // Get all Apex classes used by a component
  getComponentsForApex(apexClassName: string): string[]; // Get all components that use an Apex class
  toJSON(): AuraToApexDependencyGraphJSON;
}

/**
 * JSON representation of Aura-to-Apex dependency graph for persistence
 */
export interface AuraToApexDependencyGraphJSON {
  nodes: Record<string, AuraToApexNode>;
  edges: AuraToApexEdge[];
}

