/**
 * Type definitions for Flow parsing results
 */

import type { FlowDefinition } from './flow-parsed.js';
import type { FlowDependencyGraph, FlowToObjectDependencyGraph } from './flow-dependency-graph.js';

/**
 * Parsed Flow results interface
 */
export interface ParsedFlowResults {
  flows: Map<string, FlowDefinition>;
  dependencyGraph: FlowDependencyGraph; // Flow-to-Flow dependencies (subflows)
  flowToObjectGraph: FlowToObjectDependencyGraph; // Flow-to-object dependencies
  parsedAt: string;

  addFlow(flow: FlowDefinition): void;
  getFlow(flowName: string): FlowDefinition | undefined;
  getAllFlows(): FlowDefinition[];
  toJSON(): ParsedFlowResultsJSON;
}

/**
 * JSON representation of parsed Flow results for persistence
 */
export interface ParsedFlowResultsJSON {
  flows: Record<string, FlowDefinition>;
  dependencyGraph: unknown; // FlowDependencyGraphJSON
  flowToObjectGraph: unknown; // FlowToObjectDependencyGraphJSON
  parsedAt: string;
}

