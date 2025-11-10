/**
 * Type definitions for LWC parsing results
 */

import type { LWCComponentDefinition } from './lwc-parsed.js';
import type { ComponentDependencyGraph } from './component-dependency-graph.js';

/**
 * Parsed LWC results interface
 */
export interface ParsedLWCResults {
  components: Map<string, LWCComponentDefinition>;
  dependencyGraph: ComponentDependencyGraph;
  parsedAt: string;

  addComponent(component: LWCComponentDefinition): void;
  getComponent(componentName: string): LWCComponentDefinition | undefined;
  getAllComponents(): LWCComponentDefinition[];
  toJSON(): ParsedLWCResultsJSON;
}

/**
 * JSON representation of parsed LWC results for persistence
 */
export interface ParsedLWCResultsJSON {
  components: Record<string, LWCComponentDefinition>;
  dependencyGraph: unknown; // ComponentDependencyGraphJSON
  parsedAt: string;
}

