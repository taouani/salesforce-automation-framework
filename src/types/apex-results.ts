/**
 * Type definitions for Apex parsing results
 */

import type { ApexClassDefinition, ApexTriggerDefinition } from './apex-parsed.js';
import type { ApexToObjectDependencyGraph } from './apex-dependency-graph.js';

/**
 * Parsed Apex results interface
 */
export interface ParsedApexResults {
  classes: Map<string, ApexClassDefinition>;
  triggers: Map<string, ApexTriggerDefinition>;
  dependencyGraph: ApexToObjectDependencyGraph;
  parsedAt: string;

  addClass(apexClass: ApexClassDefinition): void;
  addTrigger(trigger: ApexTriggerDefinition): void;
  getClass(className: string): ApexClassDefinition | undefined;
  getTrigger(triggerName: string): ApexTriggerDefinition | undefined;
  getAllClasses(): ApexClassDefinition[];
  getAllTriggers(): ApexTriggerDefinition[];
  toJSON(): ParsedApexResultsJSON;
}

/**
 * JSON representation of parsed Apex results for persistence
 */
export interface ParsedApexResultsJSON {
  classes: Record<string, ApexClassDefinition>;
  triggers: Record<string, ApexTriggerDefinition>;
  dependencyGraph: unknown; // ApexToObjectDependencyGraphJSON
  parsedAt: string;
}

