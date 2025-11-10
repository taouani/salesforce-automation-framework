/**
 * Type definitions for component dependency graph structures
 */

/**
 * Node in the dependency graph representing a component
 */
export interface ComponentDependencyNode {
  componentName: string;
  dependencies: ComponentDependencyEdge[];
}

/**
 * Edge in the dependency graph representing a dependency between components
 */
export interface ComponentDependencyEdge {
  targetComponent: string;
  source: 'import' | 'html'; // Where the dependency comes from (JS import or HTML template)
}

/**
 * Dependency graph for storing component dependencies
 */
export interface ComponentDependencyGraph {
  nodes: Map<string, ComponentDependencyNode>;
  addDependency(sourceComponent: string, targetComponent: string, source: 'import' | 'html'): void;
  getDependencies(componentName: string): ComponentDependencyEdge[];
  getDependents(componentName: string): ComponentDependencyEdge[]; // Components that depend on this one
  getRelatedComponents(componentName: string): string[];
  toJSON(): ComponentDependencyGraphJSON;
}

/**
 * JSON representation of dependency graph for persistence
 */
export interface ComponentDependencyGraphJSON {
  nodes: Record<string, ComponentDependencyNode>;
}

