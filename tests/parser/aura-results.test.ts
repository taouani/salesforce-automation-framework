/**
 * Tests for Aura results storage
 */

import { describe, it, expect } from 'vitest';
import { ParsedAuraResultsImpl } from '../../src/parser/aura-results.js';
import type { AuraComponentDefinition } from '../../src/types/aura-parsed.js';

describe('Aura Results Storage', () => {
  it('should store and retrieve components', () => {
    const results = new ParsedAuraResultsImpl();
    
    const component: AuraComponentDefinition = {
      metadata: { name: 'TestComponent' },
      type: 'Component',
    };

    results.addComponent(component);
    
    const retrieved = results.getComponent('TestComponent');
    expect(retrieved).toBeDefined();
    expect(retrieved?.metadata.name).toBe('TestComponent');
  });

  it('should convert results to JSON', () => {
    const results = new ParsedAuraResultsImpl();
    
    const component: AuraComponentDefinition = {
      metadata: { name: 'TestComponent' },
      type: 'Component',
    };

    results.addComponent(component);
    
    const json = results.toJSON();
    expect(json.components).toBeDefined();
    expect(json.components['TestComponent']).toBeDefined();
    expect(json.parsedAt).toBeDefined();
  });

  it('should store and retrieve applications', () => {
    const results = new ParsedAuraResultsImpl();
    
    const application = {
      metadata: { name: 'TestApp' },
      type: 'Application' as const,
    };

    results.addApplication(application);
    
    const retrieved = results.getApplication('TestApp');
    expect(retrieved).toBeDefined();
    expect(retrieved?.metadata.name).toBe('TestApp');
  });
});

