/**
 * Component dependency graph implementation
 */

import type {
  ComponentDependencyGraph,
  ComponentDependencyNode,
  ComponentDependencyEdge,
  ComponentDependencyGraphJSON,
} from '../types/component-dependency-graph.js';

/**
 * Component dependency graph implementation
 */
export class ComponentDependencyGraphImpl implements ComponentDependencyGraph {
  nodes: Map<string, ComponentDependencyNode> = new Map();

  /**
   * Adds a dependency to the graph
   */
  addDependency(sourceComponent: string, targetComponent: string, source: 'import' | 'html'): void {
    // Get or create source node
    if (!this.nodes.has(sourceComponent)) {
      this.nodes.set(sourceComponent, {
        componentName: sourceComponent,
        dependencies: [],
      });
    }

    const sourceNode = this.nodes.get(sourceComponent)!;

    // Add outgoing edge
    const outgoingEdge: ComponentDependencyEdge = {
      targetComponent,
      source,
    };
    sourceNode.dependencies.push(outgoingEdge);

    // Get or create target node
    if (!this.nodes.has(targetComponent)) {
      this.nodes.set(targetComponent, {
        componentName: targetComponent,
        dependencies: [],
      });
    }
  }

  /**
   * Gets all dependencies for a component
   */
  getDependencies(componentName: string): ComponentDependencyEdge[] {
    const node = this.nodes.get(componentName);
    return node ? [...node.dependencies] : [];
  }

  /**
   * Gets all components that depend on this component (reverse dependencies)
   */
  getDependents(componentName: string): ComponentDependencyEdge[] {
    const dependents: ComponentDependencyEdge[] = [];
    for (const [compName, node] of this.nodes.entries()) {
      if (compName !== componentName) {
        const deps = node.dependencies.filter(dep => dep.targetComponent === componentName);
        dependents.push(...deps.map(dep => ({
          ...dep,
          targetComponent: compName, // Reverse the direction
        })));
      }
    }
    return dependents;
  }

  /**
   * Gets all related components (both dependencies and dependents)
   */
  getRelatedComponents(componentName: string): string[] {
    const related = new Set<string>();
    
    // Add dependencies
    const dependencies = this.getDependencies(componentName);
    dependencies.forEach(dep => related.add(dep.targetComponent));
    
    // Add dependents
    const dependents = this.getDependents(componentName);
    dependents.forEach(dep => related.add(dep.targetComponent));
    
    return Array.from(related);
  }

  /**
   * Converts graph to JSON for persistence
   */
  toJSON(): ComponentDependencyGraphJSON {
    const nodes: Record<string, ComponentDependencyNode> = {};
    for (const [name, node] of this.nodes.entries()) {
      nodes[name] = node;
    }
    return { nodes };
  }
}

