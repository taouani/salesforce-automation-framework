/**
 * Parsed Apex results storage implementation
 */

import type {
  ParsedApexResults,
  ParsedApexResultsJSON,
} from '../types/apex-results.js';
import type { ApexClassDefinition, ApexTriggerDefinition } from '../types/apex-parsed.js';
import type { ApexToObjectDependencyGraph } from '../types/apex-dependency-graph.js';
import { ApexToObjectDependencyGraphImpl } from './apex-dependency-graph.js';

/**
 * Parsed Apex results implementation
 */
export class ParsedApexResultsImpl implements ParsedApexResults {
  classes: Map<string, ApexClassDefinition> = new Map();
  triggers: Map<string, ApexTriggerDefinition> = new Map();
  dependencyGraph: ApexToObjectDependencyGraph = new ApexToObjectDependencyGraphImpl();
  parsedAt: string = new Date().toISOString();

  /**
   * Adds an Apex class to the results
   */
  addClass(apexClass: ApexClassDefinition): void {
    this.classes.set(apexClass.name, apexClass);
  }

  /**
   * Adds an Apex trigger to the results
   */
  addTrigger(trigger: ApexTriggerDefinition): void {
    this.triggers.set(trigger.name, trigger);
  }

  /**
   * Gets an Apex class by name
   */
  getClass(className: string): ApexClassDefinition | undefined {
    return this.classes.get(className);
  }

  /**
   * Gets an Apex trigger by name
   */
  getTrigger(triggerName: string): ApexTriggerDefinition | undefined {
    return this.triggers.get(triggerName);
  }

  /**
   * Gets all Apex classes
   */
  getAllClasses(): ApexClassDefinition[] {
    return Array.from(this.classes.values());
  }

  /**
   * Gets all Apex triggers
   */
  getAllTriggers(): ApexTriggerDefinition[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Converts results to JSON for persistence
   */
  toJSON(): ParsedApexResultsJSON {
    const classes: Record<string, ApexClassDefinition> = {};
    for (const [name, apexClass] of this.classes.entries()) {
      classes[name] = apexClass;
    }

    const triggers: Record<string, ApexTriggerDefinition> = {};
    for (const [name, trigger] of this.triggers.entries()) {
      triggers[name] = trigger;
    }

    return {
      classes,
      triggers,
      dependencyGraph: this.dependencyGraph.toJSON(),
      parsedAt: this.parsedAt,
    };
  }
}

