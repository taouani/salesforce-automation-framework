/**
 * Aura dependency graph implementations
 */

import type {
  AuraDependencyGraph,
  AuraDependencyNode,
  AuraDependencyEdge,
  AuraDependencyGraphJSON,
  AuraToObjectDependencyGraph,
  AuraToObjectNode,
  AuraToObjectEdge,
  AuraToObjectDependencyGraphJSON,
  AuraToApexDependencyGraph,
  AuraToApexNode,
  AuraToApexEdge,
  AuraToApexDependencyGraphJSON,
} from '../types/aura-dependency-graph.js';
import type { AuraToObjectRelationshipType, AuraToApexRelationshipType } from '../types/aura-dependency-graph.js';

/**
 * Aura-to-Aura dependency graph implementation
 */
export class AuraDependencyGraphImpl implements AuraDependencyGraph {
  nodes: Map<string, AuraDependencyNode> = new Map();
  private edges: AuraDependencyEdge[] = [];

  /**
   * Adds a dependency between Aura components
   */
  addDependency(sourceComponent: string, targetComponent: string, location?: string): void {
    // Get or create source node
    if (!this.nodes.has(sourceComponent)) {
      this.nodes.set(sourceComponent, {
        name: sourceComponent,
        type: 'component',
      });
    }

    // Get or create target node
    if (!this.nodes.has(targetComponent)) {
      this.nodes.set(targetComponent, {
        name: targetComponent,
        type: 'component',
      });
    }

    // Add edge
    const edge: AuraDependencyEdge = {
      sourceComponent,
      targetComponent,
      location,
    };
    this.edges.push(edge);
  }

  /**
   * Gets all dependencies for a component (components it uses)
   */
  getDependencies(componentName: string): AuraDependencyEdge[] {
    return this.edges.filter((edge) => edge.sourceComponent === componentName);
  }

  /**
   * Gets all dependents for a component (components that use this component)
   */
  getDependents(componentName: string): AuraDependencyEdge[] {
    return this.edges.filter((edge) => edge.targetComponent === componentName);
  }

  /**
   * Gets all related components (both dependencies and dependents)
   */
  getRelatedComponents(componentName: string): string[] {
    const related = new Set<string>();
    this.getDependencies(componentName).forEach((edge) => related.add(edge.targetComponent));
    this.getDependents(componentName).forEach((edge) => related.add(edge.sourceComponent));
    return Array.from(related);
  }

  /**
   * Converts graph to JSON for persistence
   */
  toJSON(): AuraDependencyGraphJSON {
    const nodes: Record<string, AuraDependencyNode> = {};
    for (const [name, node] of this.nodes.entries()) {
      nodes[name] = node;
    }

    return {
      nodes,
      edges: this.edges,
    };
  }
}

/**
 * Aura-to-object dependency graph implementation
 */
export class AuraToObjectDependencyGraphImpl implements AuraToObjectDependencyGraph {
  nodes: Map<string, AuraToObjectNode> = new Map();
  private edges: AuraToObjectEdge[] = [];

  /**
   * Adds a relationship between Aura component and Salesforce object
   */
  addRelationship(
    componentName: string,
    objectName: string,
    relationshipType: AuraToObjectRelationshipType,
    details?: Record<string, unknown>
  ): void {
    // Get or create component node
    if (!this.nodes.has(componentName)) {
      this.nodes.set(componentName, {
        name: componentName,
        type: 'aura',
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
    const edge: AuraToObjectEdge = {
      componentName,
      objectName,
      relationshipType,
      details,
    };
    this.edges.push(edge);
  }

  /**
   * Gets all relationships for a component
   */
  getRelationships(componentName: string): AuraToObjectEdge[] {
    return this.edges.filter((edge) => edge.componentName === componentName);
  }

  /**
   * Gets all objects used by a component
   */
  getObjectsForComponent(componentName: string): string[] {
    const relationships = this.getRelationships(componentName);
    const objects = new Set<string>();
    relationships.forEach((rel) => objects.add(rel.objectName));
    return Array.from(objects);
  }

  /**
   * Gets all components that use an object
   */
  getComponentsForObject(objectName: string): string[] {
    const components = new Set<string>();
    this.edges.forEach((edge) => {
      if (edge.objectName === objectName) {
        components.add(edge.componentName);
      }
    });
    return Array.from(components);
  }

  /**
   * Converts graph to JSON for persistence
   */
  toJSON(): AuraToObjectDependencyGraphJSON {
    const nodes: Record<string, AuraToObjectNode> = {};
    for (const [name, node] of this.nodes.entries()) {
      nodes[name] = node;
    }
    return {
      nodes,
      edges: [...this.edges],
    };
  }
}

/**
 * Aura-to-Apex dependency graph implementation
 */
export class AuraToApexDependencyGraphImpl implements AuraToApexDependencyGraph {
  nodes: Map<string, AuraToApexNode> = new Map();
  private edges: AuraToApexEdge[] = [];

  /**
   * Adds a relationship between Aura component and Apex class
   */
  addRelationship(
    componentName: string,
    apexClassName: string,
    relationshipType: AuraToApexRelationshipType,
    details?: Record<string, unknown>
  ): void {
    // Get or create component node
    if (!this.nodes.has(componentName)) {
      this.nodes.set(componentName, {
        name: componentName,
        type: 'aura',
      });
    }

    // Get or create Apex node
    if (!this.nodes.has(apexClassName)) {
      this.nodes.set(apexClassName, {
        name: apexClassName,
        type: 'apex',
      });
    }

    // Add edge
    const edge: AuraToApexEdge = {
      componentName,
      apexClassName,
      relationshipType,
      details,
    };
    this.edges.push(edge);
  }

  /**
   * Gets all relationships for a component
   */
  getRelationships(componentName: string): AuraToApexEdge[] {
    return this.edges.filter((edge) => edge.componentName === componentName);
  }

  /**
   * Gets all Apex classes used by a component
   */
  getApexForComponent(componentName: string): string[] {
    const relationships = this.getRelationships(componentName);
    const apexClasses = new Set<string>();
    relationships.forEach((rel) => apexClasses.add(rel.apexClassName));
    return Array.from(apexClasses);
  }

  /**
   * Gets all components that use an Apex class
   */
  getComponentsForApex(apexClassName: string): string[] {
    const components = new Set<string>();
    this.edges.forEach((edge) => {
      if (edge.apexClassName === apexClassName) {
        components.add(edge.componentName);
      }
    });
    return Array.from(components);
  }

  /**
   * Converts graph to JSON for persistence
   */
  toJSON(): AuraToApexDependencyGraphJSON {
    const nodes: Record<string, AuraToApexNode> = {};
    for (const [name, node] of this.nodes.entries()) {
      nodes[name] = node;
    }
    return {
      nodes,
      edges: [...this.edges],
    };
  }
}

