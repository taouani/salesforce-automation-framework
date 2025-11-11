/**
 * Tests for component test generator
 */

import { describe, it, expect } from 'vitest';
import {
  convertLWCToTests,
  convertAuraToTests,
  generateComponentTestGroup,
} from '../../src/generator/test-specs/component-test-generator.js';
import type { LWCComponentDefinition } from '../../src/types/lwc-parsed.js';
import type { AuraComponentDefinition } from '../../src/types/aura-parsed.js';

describe('Component Test Generator', () => {
  describe('convertLWCToTests', () => {
    it('should generate multiple tests for LWC component', () => {
      const componentDef: LWCComponentDefinition = {
        name: 'MyComponent',
        path: 'lwc/myComponent',
        properties: [],
        methods: [],
        events: [],
      };

      const tests = convertLWCToTests(componentDef);

      // Rendering test + error state test = 2 tests
      expect(tests).toHaveLength(2);
      expect(tests[0].componentName).toBe('MyComponent');
      expect(tests[0].componentType).toBe('LWC');
      expect(tests[0].testScenario).toBe('rendering');
      expect(tests[1].testScenario).toBe('interaction');
    });

    it('should include tags in test definitions', () => {
      const componentDef: LWCComponentDefinition = {
        name: 'MyComponent',
        path: 'lwc/myComponent',
        properties: [],
        methods: [],
        events: [],
      };

      const tests = convertLWCToTests(componentDef);

      tests.forEach(test => {
        expect(test.tags).toBeDefined();
        expect(test.tags).toContain('@component');
        expect(test.tags).toContain('@component:lwc:MyComponent');
      });
    });

    it('should handle component with unknown name', () => {
      const componentDef: LWCComponentDefinition = {
        name: undefined as unknown as string,
        path: 'lwc/myComponent',
        properties: [],
        methods: [],
        events: [],
      };

      const tests = convertLWCToTests(componentDef);

      expect(tests).toHaveLength(2); // Rendering + error state
      expect(tests[0].componentName).toBe('Unknown');
    });

    it('should generate error state test for LWC component', () => {
      const componentDef: LWCComponentDefinition = {
        name: 'MyComponent',
        path: 'lwc/myComponent',
        properties: [],
        methods: [],
        events: [],
      };

      const tests = convertLWCToTests(componentDef);

      const errorStateTest = tests.find(t => t.testScenario === 'interaction');
      expect(errorStateTest).toBeDefined();
      expect(errorStateTest?.componentName).toBe('MyComponent');
      expect(errorStateTest?.componentType).toBe('LWC');
    });
  });

  describe('convertAuraToTests', () => {
    it('should generate multiple tests for Aura component', () => {
      const componentDef: AuraComponentDefinition = {
        metadata: {
          name: 'MyAuraComponent',
        },
        attributes: [],
        events: [],
      };

      const tests = convertAuraToTests(componentDef);

      // Rendering test + error state test = 2 tests
      expect(tests).toHaveLength(2);
      expect(tests[0].componentName).toBe('MyAuraComponent');
      expect(tests[0].componentType).toBe('Aura');
      expect(tests[0].testScenario).toBe('rendering');
      expect(tests[1].testScenario).toBe('interaction');
    });

    it('should include tags in test definitions', () => {
      const componentDef: AuraComponentDefinition = {
        metadata: {
          name: 'MyAuraComponent',
        },
        attributes: [],
        events: [],
      };

      const tests = convertAuraToTests(componentDef);

      tests.forEach(test => {
        expect(test.tags).toBeDefined();
        expect(test.tags).toContain('@component');
        expect(test.tags).toContain('@component:aura:MyAuraComponent');
      });
    });

    it('should handle component with unknown name', () => {
      const componentDef: AuraComponentDefinition = {
        metadata: {
          name: undefined as unknown as string,
        },
        attributes: [],
        events: [],
      };

      const tests = convertAuraToTests(componentDef);

      expect(tests).toHaveLength(2); // Rendering + error state
      expect(tests[0].componentName).toBe('Unknown');
    });

    it('should generate error state test for Aura component', () => {
      const componentDef: AuraComponentDefinition = {
        metadata: {
          name: 'MyAuraComponent',
        },
        attributes: [],
        events: [],
      };

      const tests = convertAuraToTests(componentDef);

      const errorStateTest = tests.find(t => t.testScenario === 'interaction');
      expect(errorStateTest).toBeDefined();
      expect(errorStateTest?.componentName).toBe('MyAuraComponent');
      expect(errorStateTest?.componentType).toBe('Aura');
    });
  });

  describe('generateComponentTestGroup', () => {
    it('should generate test group for LWC component', () => {
      const testGroup = generateComponentTestGroup('MyComponent', 'LWC');

      expect(testGroup.groupName).toBe('Component Tests - MyComponent');
      expect(testGroup.testType).toBe('Component');
      // Rendering + error state = 2 tests
      expect(testGroup.tests).toHaveLength(2);
      expect(testGroup.tags).toBeDefined();
      expect(testGroup.tags).toContain('@component');
      expect(testGroup.tags).toContain('@component:lwc:MyComponent');
    });

    it('should generate test group for Aura component', () => {
      const testGroup = generateComponentTestGroup('MyAuraComponent', 'Aura');

      expect(testGroup.groupName).toBe('Component Tests - MyAuraComponent');
      expect(testGroup.testType).toBe('Component');
      // Rendering + error state = 2 tests
      expect(testGroup.tests).toHaveLength(2);
      expect(testGroup.tags).toBeDefined();
      expect(testGroup.tags).toContain('@component');
      expect(testGroup.tags).toContain('@component:aura:MyAuraComponent');
    });

    it('should include tags in test case', () => {
      const testGroup = generateComponentTestGroup('MyComponent', 'LWC');

      expect(testGroup.tests[0].tags).toBeDefined();
      expect(testGroup.tests[0].testCase).toContain('@component');
      expect(testGroup.tests[0].testCase).toContain('@component:lwc:MyComponent');
    });
  });
});

