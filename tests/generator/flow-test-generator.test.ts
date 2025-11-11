/**
 * Tests for flow test generator
 */

import { describe, it, expect } from 'vitest';
import {
  convertFlowToTests,
  generateFlowTestGroup,
} from '../../src/generator/test-specs/flow-test-generator.js';
import type { FlowDefinition } from '../../src/types/flow-parsed.js';

describe('Flow Test Generator', () => {
  describe('convertFlowToTests', () => {
    it('should generate multiple tests for flow', () => {
      const flowDef: FlowDefinition = {
        name: 'MyFlow',
        fullName: 'MyFlow',
        label: 'My Flow',
        type: 'Screen',
        status: 'Active',
        elements: [],
      };

      const tests = convertFlowToTests(flowDef);

      // Execution test + error handling test = 2 tests minimum
      expect(tests.length).toBeGreaterThanOrEqual(2);
      expect(tests.some(t => t.testScenario === 'execution')).toBe(true);
      expect(tests.some(t => t.testScenario === 'errorHandling')).toBe(true);
      expect(tests[0].flowName).toBe('MyFlow');
    });

    it('should generate screen navigation test when flow has screens', () => {
      const flowDef: FlowDefinition = {
        name: 'MyFlow',
        fullName: 'MyFlow',
        label: 'My Flow',
        type: 'Screen',
        status: 'Active',
        elements: [],
        screens: [
          {
            screenElement: 'Screen1',
            fields: [],
          },
        ],
      };

      const tests = convertFlowToTests(flowDef);

      const screenNavTest = tests.find(t => t.testScenario === 'screenNavigation');
      expect(screenNavTest).toBeDefined();
      expect(screenNavTest?.flowName).toBe('MyFlow');
    });

    it('should generate decision path test when flow has decision paths', () => {
      const flowDef: FlowDefinition = {
        name: 'MyFlow',
        fullName: 'MyFlow',
        label: 'My Flow',
        type: 'Screen',
        status: 'Active',
        elements: [],
        decisionPaths: [
          {
            decisionElement: 'Decision1',
            outcomes: [],
            paths: [],
          },
        ],
      };

      const tests = convertFlowToTests(flowDef);

      const decisionPathTest = tests.find(t => t.testScenario === 'decisionPath');
      expect(decisionPathTest).toBeDefined();
      expect(decisionPathTest?.flowName).toBe('MyFlow');
    });

    it('should include tags in test definitions', () => {
      const flowDef: FlowDefinition = {
        fullName: 'MyFlow',
        label: 'My Flow',
        type: 'AutoLaunchedFlow',
        status: 'Active',
      };

      const tests = convertFlowToTests(flowDef);

      expect(tests[0].tags).toBeDefined();
      expect(tests[0].tags).toContain('@flow');
      expect(tests[0].tags).toContain('@flow:MyFlow');
    });

    it('should handle flow with unknown name', () => {
      const flowDef: FlowDefinition = {
        name: undefined as unknown as string,
        fullName: undefined as unknown as string,
        label: 'My Flow',
        type: 'AutoLaunchedFlow',
        status: 'Active',
        elements: [],
      };

      const tests = convertFlowToTests(flowDef);

      expect(tests.length).toBeGreaterThanOrEqual(2); // Execution + error handling
      expect(tests[0].flowName).toBe('Unknown');
    });

    it('should generate test names with flow name', () => {
      const flowDef: FlowDefinition = {
        name: 'MyFlow',
        fullName: 'MyFlow',
        label: 'My Flow',
        type: 'AutoLaunchedFlow',
        status: 'Active',
        elements: [],
      };

      const tests = convertFlowToTests(flowDef);

      const executionTest = tests.find(t => t.testScenario === 'execution');
      expect(executionTest).toBeDefined();
      expect(executionTest?.name).toContain('flow');
      expect(executionTest?.name).toContain('myflow');
      expect(executionTest?.name).toContain('execution');
    });
  });

  describe('generateFlowTestGroup', () => {
    it('should generate test group with correct structure', () => {
      const flowDef: FlowDefinition = {
        name: 'MyFlow',
        fullName: 'MyFlow',
        label: 'My Flow',
        type: 'AutoLaunchedFlow',
        status: 'Active',
        elements: [],
      };

      const testGroup = generateFlowTestGroup(flowDef);

      expect(testGroup.groupName).toBe('Flow Tests - MyFlow');
      expect(testGroup.testType).toBe('Flow');
      // Execution + error handling = 2 tests minimum
      expect(testGroup.tests.length).toBeGreaterThanOrEqual(2);
      expect(testGroup.tags).toBeDefined();
      expect(testGroup.tags).toContain('@flow');
      expect(testGroup.tags).toContain('@flow:MyFlow');
    });

    it('should handle flow with unknown name', () => {
      const flowDef: FlowDefinition = {
        name: undefined as unknown as string,
        fullName: undefined as unknown as string,
        label: 'My Flow',
        type: 'AutoLaunchedFlow',
        status: 'Active',
        elements: [],
      };

      const testGroup = generateFlowTestGroup(flowDef);

      expect(testGroup.groupName).toBe('Flow Tests - Unknown');
      expect(testGroup.tests.length).toBeGreaterThanOrEqual(2); // Execution + error handling
    });

    it('should include tags in test case', () => {
      const flowDef: FlowDefinition = {
        fullName: 'MyFlow',
        label: 'My Flow',
        type: 'AutoLaunchedFlow',
        status: 'Active',
      };

      const testGroup = generateFlowTestGroup(flowDef);

      expect(testGroup.tests[0].testCase).toContain('@flow');
      expect(testGroup.tests[0].testCase).toContain('@flow:MyFlow');
    });
  });
});

