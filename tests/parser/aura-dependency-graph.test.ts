/**
 * Tests for Aura dependency graph implementations
 */

import { describe, it, expect } from 'vitest';
import {
  AuraDependencyGraphImpl,
  AuraToObjectDependencyGraphImpl,
  AuraToApexDependencyGraphImpl,
} from '../../src/parser/aura-dependency-graph.js';

describe('Aura Dependency Graphs', () => {
  it('should create Aura-to-Aura dependency graph', () => {
    const graph = new AuraDependencyGraphImpl();
    
    graph.addDependency('ComponentA', 'ComponentB', 'markup');
    graph.addDependency('ComponentA', 'ComponentC', 'markup');

    const deps = graph.getDependencies('ComponentA');
    expect(deps).toHaveLength(2);
    expect(deps.some(d => d.targetComponent === 'ComponentB')).toBe(true);
    expect(deps.some(d => d.targetComponent === 'ComponentC')).toBe(true);

    const dependents = graph.getDependents('ComponentB');
    expect(dependents).toHaveLength(1);
    expect(dependents[0].sourceComponent).toBe('ComponentA');
  });

  it('should create Aura-to-Object dependency graph', () => {
    const graph = new AuraToObjectDependencyGraphImpl();
    
    graph.addRelationship('ComponentA', 'Account', 'attribute');
    graph.addRelationship('ComponentA', 'Contact', 'binding');

    const relationships = graph.getRelationships('ComponentA');
    expect(relationships).toHaveLength(2);
    
    const objects = graph.getObjectsForComponent('ComponentA');
    expect(objects).toContain('Account');
    expect(objects).toContain('Contact');

    const components = graph.getComponentsForObject('Account');
    expect(components).toContain('ComponentA');
  });

  it('should create Aura-to-Apex dependency graph', () => {
    const graph = new AuraToApexDependencyGraphImpl();
    
    graph.addRelationship('ComponentA', 'MyApexClass', 'enqueueAction', { methodName: 'myMethod' });
    graph.addRelationship('ComponentA', 'MyApexClass2', 'controller');

    const relationships = graph.getRelationships('ComponentA');
    expect(relationships).toHaveLength(2);
    
    const apexClasses = graph.getApexForComponent('ComponentA');
    expect(apexClasses).toContain('MyApexClass');
    expect(apexClasses).toContain('MyApexClass2');

    const components = graph.getComponentsForApex('MyApexClass');
    expect(components).toContain('ComponentA');
  });

  it('should convert graphs to JSON', () => {
    const auraGraph = new AuraDependencyGraphImpl();
    auraGraph.addDependency('ComponentA', 'ComponentB');
    
    const json = auraGraph.toJSON();
    expect(json.nodes).toBeDefined();
    expect(json.edges).toBeDefined();
    expect(json.edges.length).toBe(1);
  });
});

