/**
 * Flow Test Generator
 * Generates Flow execution test cases
 */

import type { FlowTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { FlowDefinition } from '../../types/flow-parsed.js';

export function convertFlowToTests(flowDef: FlowDefinition): FlowTestDefinition[] {
  const flowName = String(flowDef.fullName || 'Unknown');
  return [{
    name: `test-flow-${flowName.toLowerCase()}`,
    type: 'Flow',
    flowName,
    testScenario: 'execution',
    flowInputs: {},
    testCase: generateFlowTestCase(flowName),
  }];
}

function generateFlowTestCase(flowName: string): string {
  return `test('should execute flow ${flowName}', async ({ page }) => {
    // Navigate to flow
    await page.goto(\`/lightning/r/Flow/${flowName}/view\`);
    
    // Execute flow with inputs
    // Verify flow completes successfully
    await expect(page.locator('text=Flow completed')).toBeVisible();
  });`;
}

export function generateFlowTestGroup(flowDef: FlowDefinition): TestGroupDefinition {
  const tests = convertFlowToTests(flowDef);
  
  return {
    groupName: `Flow Tests - ${flowDef.fullName}`,
    testType: 'Flow',
    tests,
  };
}

