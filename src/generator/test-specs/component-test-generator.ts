/**
 * Component Test Generator
 * Generates component test cases for LWC and Aura components
 */

import type { ComponentTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { LWCComponentDefinition } from '../../types/lwc-parsed.js';
import type { AuraComponentDefinition } from '../../types/aura-parsed.js';

export function convertLWCToTests(componentDef: LWCComponentDefinition): ComponentTestDefinition[] {
  const componentName = String(componentDef.name || 'Unknown');
  return [{
    name: `test-component-${componentName.toLowerCase()}`,
    type: 'Component',
    componentName,
    componentType: 'LWC',
    testScenario: 'rendering',
    testCase: generateLWCComponentTestCase(componentName),
  }];
}

export function convertAuraToTests(componentDef: AuraComponentDefinition): ComponentTestDefinition[] {
  const componentName = String(componentDef.name || 'Unknown');
  return [{
    name: `test-component-${componentName.toLowerCase()}`,
    type: 'Component',
    componentName,
    componentType: 'Aura',
    testScenario: 'rendering',
    testCase: generateAuraComponentTestCase(componentName),
  }];
}

function generateLWCComponentTestCase(componentName: string): string {
  return `test('should render LWC component ${componentName}', async ({ page }) => {
    // Navigate to page with component
    await page.goto('/lightning/page/home');
    
    // Verify component is rendered
    await expect(page.locator('c-${componentName.toLowerCase()}')).toBeVisible();
  });`;
}

function generateAuraComponentTestCase(componentName: string): string {
  return `test('should render Aura component ${componentName}', async ({ page }) => {
    // Navigate to page with component
    await page.goto('/lightning/page/home');
    
    // Verify component is rendered
    await expect(page.locator('[data-aura-class="${componentName}"]')).toBeVisible();
  });`;
}

export function generateComponentTestGroup(
  componentName: string,
  componentType: 'LWC' | 'Aura'
): TestGroupDefinition {
  return {
    groupName: `Component Tests - ${componentName}`,
    testType: 'Component',
    tests: [{
      name: `test-component-${componentName.toLowerCase()}`,
      type: 'Component',
      componentName,
      componentType,
      testScenario: 'rendering',
      testCase: `test('should render ${componentType} component ${componentName}', async ({ page }) => {
        await page.goto('/lightning/page/home');
        await expect(page.locator('text=${componentName}')).toBeVisible();
      });`,
    }],
  };
}

