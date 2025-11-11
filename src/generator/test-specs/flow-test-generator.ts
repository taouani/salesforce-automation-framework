/**
 * Flow Test Generator
 * Generates Flow execution test cases
 */

import type { FlowTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { FlowDefinition, FlowScreenDefinition, FlowDecisionPathDefinition } from '../../types/flow-parsed.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';

export function convertFlowToTests(flowDef: FlowDefinition): FlowTestDefinition[] {
  const flowName = String(flowDef.fullName || flowDef.name || 'Unknown');
  const tests: FlowTestDefinition[] = [];
  
  // Execution test (existing)
  tests.push({
    name: `test-flow-${flowName.toLowerCase()}-execution`,
    type: 'Flow',
    flowName,
    testScenario: 'execution',
    flowInputs: {},
    testCase: generateFlowTestCase(flowName),
    tags: generateTestTags('Flow', { flowName }),
  });
  
  // Screen navigation tests (if flow has screens)
  if (flowDef.screens && flowDef.screens.length > 0) {
    tests.push({
      name: `test-flow-${flowName.toLowerCase()}-screen-navigation`,
      type: 'Flow',
      flowName,
      testScenario: 'screenNavigation',
      flowInputs: {},
      testCase: generateFlowScreenNavigationTestCase(flowName, flowDef.screens),
      tags: generateTestTags('Flow', { flowName }),
    });
  }
  
  // Decision path tests (if flow has decision paths)
  if (flowDef.decisionPaths && flowDef.decisionPaths.length > 0) {
    tests.push({
      name: `test-flow-${flowName.toLowerCase()}-decision-paths`,
      type: 'Flow',
      flowName,
      testScenario: 'decisionPath',
      flowInputs: {},
      testCase: generateFlowDecisionPathTestCase(flowName, flowDef.decisionPaths),
      tags: generateTestTags('Flow', { flowName }),
    });
  }
  
  // Error handling test
  tests.push({
    name: `test-flow-${flowName.toLowerCase()}-error-handling`,
    type: 'Flow',
    flowName,
    testScenario: 'errorHandling',
    flowInputs: {},
    testCase: generateFlowErrorHandlingTestCase(flowName),
    tags: generateTestTags('Flow', { flowName }),
  });
  
  return tests;
}

function generateFlowTestCase(flowName: string): string {
  return `test('should execute flow ${flowName} @flow @flow:${flowName}', async ({ page }) => {
    // Navigate to flow
    await page.goto(\`/lightning/r/Flow/${flowName}/view\`);
    
    // Execute flow with inputs
    // Verify flow completes successfully
    await expect(page.locator('text=Flow completed')).toBeVisible();
  });`;
}

function generateFlowScreenNavigationTestCase(flowName: string, screens: FlowScreenDefinition[]): string {
  return `test('should navigate through flow screens ${flowName} @flow @flow:${flowName}', async ({ page }) => {
    // Navigate to flow
    await page.goto(\`/lightning/r/Flow/${flowName}/view\`);
    
    // Navigate through each screen
    ${screens.map((screen, index) => {
      const screenName = screen.screenElement || `Screen${index + 1}`;
      const isLast = index === screens.length - 1;
      return `// Screen ${index + 1}: ${screenName}
    await expect(page.locator('text=${screenName}')).toBeVisible();
    ${screen.fields && screen.fields.length > 0 ? `// Fill screen fields
    ${screen.fields.map(field => {
      const fieldName = field.name || field.label || 'Field';
      return `await page.fill('[data-field="${fieldName}"]', 'Test Value');`;
    }).join('\n    ')}` : '// No fields on this screen'}
    ${!isLast ? `// Click Next to proceed to next screen
    await page.click('button:has-text("Next")');` : `// Click Finish on last screen
    await page.click('button:has-text("Finish")');`}`;
    }).join('\n    ')}
    
    // Verify flow completed successfully
    await expect(page.locator('text=Flow completed')).toBeVisible();
  });`;
}

function generateFlowDecisionPathTestCase(flowName: string, decisionPaths: FlowDecisionPathDefinition[]): string {
  return `test('should test flow decision paths ${flowName} @flow @flow:${flowName}', async ({ page, testData: _testData }) => {
    // Navigate to flow
    await page.goto(\`/lightning/r/Flow/${flowName}/view\`);
    
    // Test each decision path
    ${decisionPaths.map((path, index) => {
      const decisionElement = path.decisionElement || `Decision${index + 1}`;
      const criteria = path.criteria ? JSON.stringify(path.criteria) : 'Default path';
      return `// Decision Path ${index + 1}: ${decisionElement}
    // Set up test data to trigger this decision path
    ${path.criteria ? `// Criteria: ${criteria}` : '// Default path'}
    // Verify flow follows expected path based on decision outcome
    ${path.outcomes && path.outcomes.length > 0 ? path.outcomes.map((outcome, outcomeIndex) => {
      const outcomeType = outcome.outcomeType || 'Default';
      const outcomeLabel = outcome.label || outcomeType;
      return `// Test ${outcomeType} outcome: ${outcomeLabel}
    // Set conditions to trigger ${outcomeType} path
    // Verify flow follows ${outcomeLabel} path`;
    }).join('\n    ') : '// Verify flow follows expected path'}
    `;
    }).join('\n    ')}
    
    // Verify flow completed successfully
    await expect(page.locator('text=Flow completed')).toBeVisible();
  });`;
}

function generateFlowErrorHandlingTestCase(flowName: string): string {
  return `test('should handle flow errors ${flowName} @flow @flow:${flowName}', async ({ page }) => {
    // Navigate to flow
    await page.goto(\`/lightning/r/Flow/${flowName}/view\`);
    
    // Test error scenarios
    // Scenario 1: Invalid input values
    await page.fill('[data-field="InvalidField"]', 'Invalid Value');
    await page.click('button:has-text("Next")');
    // Verify error message is displayed
    await expect(page.locator('text=Error')).toBeVisible();
    
    // Scenario 2: Required field missing
    // Leave required fields empty
    await page.click('button:has-text("Next")');
    // Verify validation error
    await expect(page.locator('text=Required field')).toBeVisible();
    
    // Scenario 3: API/DML errors
    // Trigger flow with data that causes API errors
    // Verify error handling and error messages
    
    // Verify error recovery (if applicable)
    // Flow should handle errors gracefully
  });`;
}

export function generateFlowTestGroup(flowDef: FlowDefinition): TestGroupDefinition {
  const tests = convertFlowToTests(flowDef);
  const flowName = String(flowDef.fullName || flowDef.name || 'Unknown');
  
  return {
    groupName: `Flow Tests - ${flowName}`,
    testType: 'Flow',
    tests,
    tags: generateTestTags('Flow', { flowName }),
  };
}

