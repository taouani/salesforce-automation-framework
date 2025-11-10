/**
 * LWC parsing results structure implementation
 */

import type { LWCComponentDefinition } from '../types/lwc-parsed.js';
import type { ComponentDependencyGraph } from '../types/component-dependency-graph.js';
import type { ParsedLWCResults, ParsedLWCResultsJSON } from '../types/lwc-results.js';

/**
 * Implementation of ParsedLWCResults
 */
export class ParsedLWCResultsImpl implements ParsedLWCResults {
  components: Map<string, LWCComponentDefinition> = new Map();
  dependencyGraph: ComponentDependencyGraph;
  parsedAt: string;

  constructor(dependencyGraph: ComponentDependencyGraph) {
    this.dependencyGraph = dependencyGraph;
    this.parsedAt = new Date().toISOString();
  }

  /**
   * Adds a component definition
   */
  addComponent(component: LWCComponentDefinition): void {
    this.components.set(component.metadata.name, component);
    
    // Add dependencies to graph
    if (component.dependencies) {
      for (const dep of component.dependencies) {
        // Determine source: if dependency comes from JS imports, use 'import', otherwise 'html'
        const hasJSImport = component.javascript?.imports?.some(imp => 
          imp.isLWCImport && imp.source.replace('c/', '') === dep
        );
        this.dependencyGraph.addDependency(
          component.metadata.name,
          dep,
          hasJSImport ? 'import' : 'html'
        );
      }
    }
  }

  /**
   * Gets a component by name
   */
  getComponent(componentName: string): LWCComponentDefinition | undefined {
    return this.components.get(componentName);
  }

  /**
   * Gets all parsed components
   */
  getAllComponents(): LWCComponentDefinition[] {
    return Array.from(this.components.values());
  }

  /**
   * Converts results to JSON for persistence
   */
  toJSON(): ParsedLWCResultsJSON {
    const components: Record<string, LWCComponentDefinition> = {};
    for (const [name, component] of this.components.entries()) {
      components[name] = component;
    }
    return {
      components,
      dependencyGraph: this.dependencyGraph.toJSON(),
      parsedAt: this.parsedAt,
    };
  }
}

