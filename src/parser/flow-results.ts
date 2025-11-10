/**
 * Parsed Flow results storage implementation
 */

import type {
  ParsedFlowResults,
  ParsedFlowResultsJSON,
} from '../types/flow-results.js';
import type { FlowDefinition } from '../types/flow-parsed.js';
import type {
  FlowDependencyGraph,
  FlowToObjectDependencyGraph,
} from '../types/flow-dependency-graph.js';
import { FlowDependencyGraphImpl } from './flow-dependency-graph.js';
import { FlowToObjectDependencyGraphImpl } from './flow-dependency-graph.js';

/**
 * Parsed Flow results implementation
 */
export class ParsedFlowResultsImpl implements ParsedFlowResults {
  flows: Map<string, FlowDefinition> = new Map();
  dependencyGraph: FlowDependencyGraph = new FlowDependencyGraphImpl();
  flowToObjectGraph: FlowToObjectDependencyGraph = new FlowToObjectDependencyGraphImpl();
  parsedAt: string = new Date().toISOString();

  /**
   * Adds a Flow to the results
   */
  addFlow(flow: FlowDefinition): void {
    this.flows.set(flow.name, flow);
  }

  /**
   * Gets a Flow by name
   */
  getFlow(flowName: string): FlowDefinition | undefined {
    return this.flows.get(flowName);
  }

  /**
   * Gets all Flows
   */
  getAllFlows(): FlowDefinition[] {
    return Array.from(this.flows.values());
  }

  /**
   * Converts results to JSON for persistence
   */
  toJSON(): ParsedFlowResultsJSON {
    const flows: Record<string, FlowDefinition> = {};
    for (const [name, flow] of this.flows.entries()) {
      flows[name] = flow;
    }

    return {
      flows,
      dependencyGraph: this.dependencyGraph.toJSON(),
      flowToObjectGraph: this.flowToObjectGraph.toJSON(),
      parsedAt: this.parsedAt,
    };
  }
}

