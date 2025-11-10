/**
 * Flow dependency graph implementation
 */

import type {
  FlowDependencyGraph,
  FlowDependencyNode,
  FlowDependencyEdge,
  FlowDependencyGraphJSON,
  FlowToObjectDependencyGraph,
  FlowToObjectNode,
  FlowToObjectEdge,
  FlowToObjectDependencyGraphJSON,
} from '../types/flow-dependency-graph.js';
import type { FlowToObjectRelationshipType } from '../types/flow-parsed.js';

/**
 * Flow dependency graph implementation
 */
export class FlowDependencyGraphImpl implements FlowDependencyGraph {
  nodes: Map<string, FlowDependencyNode> = new Map();
  private edges: FlowDependencyEdge[] = [];

  /**
   * Adds a dependency between flows (subflow relationship)
   */
  addDependency(sourceFlow: string, targetFlow: string, location?: string): void {
    // Get or create source node
    if (!this.nodes.has(sourceFlow)) {
      this.nodes.set(sourceFlow, {
        name: sourceFlow,
        type: 'flow',
      });
    }

    // Get or create target node
    if (!this.nodes.has(targetFlow)) {
      this.nodes.set(targetFlow, {
        name: targetFlow,
        type: 'subflow',
      });
    }

    // Add edge
    const edge: FlowDependencyEdge = {
      sourceFlow,
      targetFlow,
      location,
    };
    this.edges.push(edge);
  }

  /**
   * Gets all dependencies for a flow (subflows it calls)
   */
  getDependencies(flowName: string): FlowDependencyEdge[] {
    return this.edges.filter((edge) => edge.sourceFlow === flowName);
  }

  /**
   * Gets all dependents for a flow (flows that call this flow as subflow)
   */
  getDependents(flowName: string): FlowDependencyEdge[] {
    return this.edges.filter((edge) => edge.targetFlow === flowName);
  }

  /**
   * Gets all related flows (both dependencies and dependents)
   */
  getRelatedFlows(flowName: string): string[] {
    const related = new Set<string>();
    this.getDependencies(flowName).forEach((edge) => related.add(edge.targetFlow));
    this.getDependents(flowName).forEach((edge) => related.add(edge.sourceFlow));
    return Array.from(related);
  }

  /**
   * Converts graph to JSON for persistence
   */
  toJSON(): FlowDependencyGraphJSON {
    const nodes: Record<string, FlowDependencyNode> = {};
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
 * Flow-to-object dependency graph implementation
 */
export class FlowToObjectDependencyGraphImpl implements FlowToObjectDependencyGraph {
  nodes: Map<string, FlowToObjectNode> = new Map();
  private edges: FlowToObjectEdge[] = [];

  /**
   * Adds a relationship between Flow and Salesforce object
   */
  addRelationship(
    flowName: string,
    objectName: string,
    relationshipType: FlowToObjectRelationshipType,
    details?: Record<string, unknown>
  ): void {
    // Get or create flow node
    if (!this.nodes.has(flowName)) {
      this.nodes.set(flowName, {
        name: flowName,
        type: 'flow',
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
    const edge: FlowToObjectEdge = {
      flowName,
      objectName,
      relationshipType,
      details,
    };
    this.edges.push(edge);
  }

  /**
   * Gets all relationships for a flow
   */
  getRelationships(flowName: string): FlowToObjectEdge[] {
    return this.edges.filter((edge) => edge.flowName === flowName);
  }

  /**
   * Gets all objects used by a flow
   */
  getObjectsForFlow(flowName: string): string[] {
    const relationships = this.getRelationships(flowName);
    const objects = new Set<string>();
    relationships.forEach((rel) => objects.add(rel.objectName));
    return Array.from(objects);
  }

  /**
   * Gets all flows that use an object
   */
  getFlowsForObject(objectName: string): string[] {
    const flows = new Set<string>();
    this.edges.forEach((edge) => {
      if (edge.objectName === objectName) {
        flows.add(edge.flowName);
      }
    });
    return Array.from(flows);
  }

  /**
   * Converts graph to JSON for persistence
   */
  toJSON(): FlowToObjectDependencyGraphJSON {
    const nodes: Record<string, FlowToObjectNode> = {};
    for (const [name, node] of this.nodes.entries()) {
      nodes[name] = node;
    }

    return {
      nodes,
      edges: this.edges,
    };
  }
}

