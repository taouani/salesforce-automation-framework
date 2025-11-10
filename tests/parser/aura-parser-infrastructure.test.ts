/**
 * Tests for Aura parser infrastructure and type definitions
 */

import { describe, it, expect } from 'vitest';
import type {
  AuraComponentDefinition,
  ApplicationDefinition,
  ComponentType,
  ComponentAccessLevel,
  AttributeDefinition,
  HandlerDefinition,
  ComponentMarkupDefinition,
  ControllerDefinition,
  HelperDefinition,
  RendererDefinition,
  CSSDefinition,
  ComponentMetadata,
  ApplicationMetadata,
} from '../../src/types/aura-parsed.js';
import type {
  AuraDependencyGraph,
  AuraToObjectDependencyGraph,
  AuraToApexDependencyGraph,
} from '../../src/types/aura-dependency-graph.js';
import type {
  ParsedAuraResults,
} from '../../src/types/aura-results.js';

describe('Aura Parser Type Definitions', () => {
  it('should compile type definitions without errors', () => {
    // Test that all type definitions are valid TypeScript
    const componentType: ComponentType = 'Component';
    const accessLevel: ComponentAccessLevel = 'public';
    
    expect(componentType).toBe('Component');
    expect(accessLevel).toBe('public');
  });

  it('should create valid AttributeDefinition', () => {
    const attribute: AttributeDefinition = {
      name: 'recordId',
      type: 'String',
      access: 'public',
      defaultValue: '',
      required: false,
      description: 'Record ID',
    };

    expect(attribute.name).toBe('recordId');
    expect(attribute.type).toBe('String');
    expect(attribute.access).toBe('public');
  });

  it('should create valid HandlerDefinition', () => {
    const handler: HandlerDefinition = {
      name: 'init',
      eventType: 'init',
      action: 'c.initialize',
      parameters: {},
    };

    expect(handler.name).toBe('init');
    expect(handler.eventType).toBe('init');
    expect(handler.action).toBe('c.initialize');
  });

  it('should create valid ComponentMarkupDefinition', () => {
    const markup: ComponentMarkupDefinition = {
      attributes: [],
      handlers: [],
      implements: ['flexipage:availableForRecordHome'],
      accessLevel: 'public',
      componentReferences: [],
      bindings: [],
      conditionalRendering: [],
      events: [],
    };

    expect(markup.implements).toContain('flexipage:availableForRecordHome');
    expect(markup.accessLevel).toBe('public');
  });

  it('should create valid AuraComponentDefinition', () => {
    const component: AuraComponentDefinition = {
      metadata: {
        name: 'TestComponent',
        apiVersion: '51.0',
      },
      type: 'Component',
      markup: {
        attributes: [],
        handlers: [],
        implements: [],
        accessLevel: 'public',
        componentReferences: [],
        bindings: [],
        conditionalRendering: [],
        events: [],
      },
    };

    expect(component.metadata.name).toBe('TestComponent');
    expect(component.type).toBe('Component');
  });

  it('should create valid ApplicationDefinition', () => {
    const application: ApplicationDefinition = {
      metadata: {
        name: 'TestApp',
        apiVersion: '51.0',
      },
      type: 'Application',
      extends: {
        extends: 'ltng:outApp',
      },
      componentDependencies: [],
    };

    expect(application.metadata.name).toBe('TestApp');
    expect(application.type).toBe('Application');
    expect(application.extends?.extends).toBe('ltng:outApp');
  });

  it('should create valid ControllerDefinition', () => {
    const controller: ControllerDefinition = {
      actionMethods: [],
    };

    expect(controller.actionMethods).toBeDefined();
    expect(Array.isArray(controller.actionMethods)).toBe(true);
  });

  it('should create valid HelperDefinition', () => {
    const helper: HelperDefinition = {
      functions: [],
      apexCalls: [],
      promiseChains: [],
    };

    expect(helper.functions).toBeDefined();
    expect(helper.apexCalls).toBeDefined();
    expect(helper.promiseChains).toBeDefined();
  });

  it('should create valid RendererDefinition', () => {
    const renderer: RendererDefinition = {
      renderMethods: [],
      domManipulation: [],
    };

    expect(renderer.renderMethods).toBeDefined();
    expect(renderer.domManipulation).toBeDefined();
  });

  it('should create valid CSSDefinition', () => {
    const css: CSSDefinition = {
      customProperties: {},
      selectors: [],
      mediaQueries: [],
      keyframes: [],
    };

    expect(css.customProperties).toBeDefined();
    expect(css.selectors).toBeDefined();
    expect(css.mediaQueries).toBeDefined();
    expect(css.keyframes).toBeDefined();
  });

  it('should create valid ParsedAuraResults structure', () => {
    // This test verifies the structure can be created
    // Actual implementation will be in aura-results.ts
    const results: ParsedAuraResults = {
      components: new Map(),
      applications: new Map(),
      auraDependencyGraph: {} as AuraDependencyGraph,
      auraToObjectDependencyGraph: {} as AuraToObjectDependencyGraph,
      auraToApexDependencyGraph: {} as AuraToApexDependencyGraph,
      parsedAt: new Date(),
    };

    expect(results.components).toBeDefined();
    expect(results.applications).toBeDefined();
    expect(results.parsedAt).toBeInstanceOf(Date);
  });
});

