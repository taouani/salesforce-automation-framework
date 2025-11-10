/**
 * Type definitions for storing parsed Aura component results
 */

import type { AuraComponentDefinition, ApplicationDefinition } from './aura-parsed.js';
import type { AuraDependencyGraph, AuraToObjectDependencyGraph, AuraToApexDependencyGraph } from './aura-dependency-graph.js';

/**
 * Parsed Aura results (in-memory structure)
 */
export interface ParsedAuraResults {
  components: Map<string, AuraComponentDefinition>;
  applications: Map<string, ApplicationDefinition>;
  auraDependencyGraph: AuraDependencyGraph;
  auraToObjectDependencyGraph: AuraToObjectDependencyGraph;
  auraToApexDependencyGraph: AuraToApexDependencyGraph;
  parsedAt: Date;
  [key: string]: unknown;
}

/**
 * JSON representation of parsed Aura results for persistence
 */
export interface ParsedAuraResultsJSON {
  components: Record<string, AuraComponentDefinition>;
  applications: Record<string, ApplicationDefinition>;
  parsedAt: string; // ISO date string
  [key: string]: unknown;
}

