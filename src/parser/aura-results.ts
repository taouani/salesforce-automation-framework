/**
 * Parsed Aura results storage implementation
 */

import type {
  ParsedAuraResults,
  ParsedAuraResultsJSON,
} from '../types/aura-results.js';
import type { AuraComponentDefinition, ApplicationDefinition } from '../types/aura-parsed.js';
import type {
  AuraDependencyGraph,
  AuraToObjectDependencyGraph,
  AuraToApexDependencyGraph,
} from '../types/aura-dependency-graph.js';
import {
  AuraDependencyGraphImpl,
  AuraToObjectDependencyGraphImpl,
  AuraToApexDependencyGraphImpl,
} from './aura-dependency-graph.js';

/**
 * Parsed Aura results implementation
 */
export class ParsedAuraResultsImpl implements ParsedAuraResults {
  components: Map<string, AuraComponentDefinition> = new Map();
  applications: Map<string, ApplicationDefinition> = new Map();
  auraDependencyGraph: AuraDependencyGraph = new AuraDependencyGraphImpl();
  auraToObjectDependencyGraph: AuraToObjectDependencyGraph = new AuraToObjectDependencyGraphImpl();
  auraToApexDependencyGraph: AuraToApexDependencyGraph = new AuraToApexDependencyGraphImpl();
  parsedAt: Date = new Date();
  [key: string]: unknown;

  /**
   * Adds a component to the results
   */
  addComponent(component: AuraComponentDefinition): void {
    this.components.set(component.metadata.name, component);
  }

  /**
   * Gets a component by name
   */
  getComponent(componentName: string): AuraComponentDefinition | undefined {
    return this.components.get(componentName);
  }

  /**
   * Gets all components
   */
  getAllComponents(): AuraComponentDefinition[] {
    return Array.from(this.components.values());
  }

  /**
   * Adds an application to the results
   */
  addApplication(application: ApplicationDefinition): void {
    this.applications.set(application.metadata.name, application);
  }

  /**
   * Gets an application by name
   */
  getApplication(applicationName: string): ApplicationDefinition | undefined {
    return this.applications.get(applicationName);
  }

  /**
   * Gets all applications
   */
  getAllApplications(): ApplicationDefinition[] {
    return Array.from(this.applications.values());
  }

  /**
   * Converts results to JSON for persistence
   */
  toJSON(): ParsedAuraResultsJSON {
    const components: Record<string, AuraComponentDefinition> = {};
    for (const [name, component] of this.components.entries()) {
      components[name] = component;
    }

    const applications: Record<string, ApplicationDefinition> = {};
    for (const [name, application] of this.applications.entries()) {
      applications[name] = application;
    }

    return {
      components,
      applications,
      parsedAt: this.parsedAt.toISOString(),
    };
  }
}

