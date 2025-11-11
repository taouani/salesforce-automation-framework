/**
 * Component Test Generator
 * Generates component test cases for LWC and Aura components
 */

import type { ComponentTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type { LWCComponentDefinition } from '../../types/lwc-parsed.js';
import type { AuraComponentDefinition } from '../../types/aura-parsed.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';

export function convertLWCToTests(componentDef: LWCComponentDefinition): ComponentTestDefinition[] {
  const componentName = String(componentDef.name || 'Unknown');
  const tests: ComponentTestDefinition[] = [];
  
  // Rendering test (existing)
  tests.push({
    name: `test-component-${componentName.toLowerCase()}-rendering`,
    type: 'Component',
    componentName,
    componentType: 'LWC',
    testScenario: 'rendering',
    testCase: generateLWCComponentTestCase(componentName),
    tags: generateTestTags('Component', { componentName, componentType: 'LWC' }),
  });
  
  // Error state test
  tests.push({
    name: `test-component-${componentName.toLowerCase()}-error-state`,
    type: 'Component',
    componentName,
    componentType: 'LWC',
    testScenario: 'interaction',
    testCase: generateLWCComponentErrorStateTestCase(componentName),
    tags: generateTestTags('Component', { componentName, componentType: 'LWC' }),
  });
  
  return tests;
}

export function convertAuraToTests(componentDef: AuraComponentDefinition): ComponentTestDefinition[] {
  const componentName = String(componentDef.metadata?.name || 'Unknown');
  const tests: ComponentTestDefinition[] = [];
  
  // Rendering test (existing)
  tests.push({
    name: `test-component-${componentName.toLowerCase()}-rendering`,
    type: 'Component',
    componentName,
    componentType: 'Aura',
    testScenario: 'rendering',
    testCase: generateAuraComponentTestCase(componentName),
    tags: generateTestTags('Component', { componentName, componentType: 'Aura' }),
  });
  
  // Error state test
  tests.push({
    name: `test-component-${componentName.toLowerCase()}-error-state`,
    type: 'Component',
    componentName,
    componentType: 'Aura',
    testScenario: 'interaction',
    testCase: generateAuraComponentErrorStateTestCase(componentName),
    tags: generateTestTags('Component', { componentName, componentType: 'Aura' }),
  });
  
  return tests;
}

function generateLWCComponentTestCase(componentName: string): string {
  return `test('should render LWC component ${componentName} @component @component:lwc:${componentName}', async ({ page }) => {
    // Navigate to page with component
    await page.goto('/lightning/page/home');
    
    // Verify component is rendered
    await expect(page.locator('c-${componentName.toLowerCase()}')).toBeVisible();
  });`;
}

function generateAuraComponentTestCase(componentName: string): string {
  return `test('should render Aura component ${componentName} @component @component:aura:${componentName}', async ({ page }) => {
    // Navigate to page with component
    await page.goto('/lightning/page/home');
    
    // Verify component is rendered
    await expect(page.locator('[data-aura-class="${componentName}"]')).toBeVisible();
  });`;
}

function generateLWCComponentErrorStateTestCase(componentName: string): string {
  return `test('should handle error state in LWC component ${componentName} @component @component:lwc:${componentName}', async ({ page }) => {
    // Navigate to page with component
    await page.goto('/lightning/page/home');
    
    // Verify component is rendered
    const component = page.locator('c-${componentName.toLowerCase()}');
    await expect(component).toBeVisible();
    
    // Trigger error scenario (e.g., invalid input, API failure)
    // Scenario 1: Invalid property value
    await component.evaluate((el: any) => {
      // Set invalid property to trigger error
      if (el.setProperty) {
        el.setProperty('invalidProperty', 'Invalid Value');
      }
    });
    
    // Verify error message is displayed
    await expect(page.locator('text=Error')).toBeVisible();
    
    // Scenario 2: API call failure
    // Trigger action that causes API error
    // Verify error handling and error message display
    
    // Scenario 3: Validation error
    // Trigger validation error
    // Verify validation error message is displayed
    
    // Verify error recovery (if applicable)
    // Component should handle errors gracefully
  });`;
}

function generateAuraComponentErrorStateTestCase(componentName: string): string {
  return `test('should handle error state in Aura component ${componentName} @component @component:aura:${componentName}', async ({ page }) => {
    // Navigate to page with component
    await page.goto('/lightning/page/home');
    
    // Verify component is rendered
    const component = page.locator('[data-aura-class="${componentName}"]');
    await expect(component).toBeVisible();
    
    // Trigger error scenario (e.g., invalid attribute, controller error)
    // Scenario 1: Invalid attribute value
    await component.evaluate((el: any) => {
      // Set invalid attribute to trigger error
      if (el.set) {
        el.set('v.invalidAttribute', 'Invalid Value');
      }
    });
    
    // Verify error message is displayed
    await expect(page.locator('text=Error')).toBeVisible();
    
    // Scenario 2: Controller action error
    // Trigger action that causes controller error
    // Verify error handling and error message display
    
    // Scenario 3: Validation error
    // Trigger validation error
    // Verify validation error message is displayed
    
    // Verify error recovery (if applicable)
    // Component should handle errors gracefully
  });`;
}

export function generateComponentTestGroup(
  componentName: string,
  componentType: 'LWC' | 'Aura'
): TestGroupDefinition {
  const tags = generateTestTags('Component', { componentName, componentType });
  return {
    groupName: `Component Tests - ${componentName}`,
    testType: 'Component',
    tags,
    tests: [
      {
        name: `test-component-${componentName.toLowerCase()}-rendering`,
        type: 'Component',
        componentName,
        componentType,
        testScenario: 'rendering',
        tags,
        testCase: `test('should render ${componentType} component ${componentName} @component @component:${componentType.toLowerCase()}:${componentName}', async ({ page }) => {
          await page.goto('/lightning/page/home');
          await expect(page.locator('text=${componentName}')).toBeVisible();
        });`,
      },
      {
        name: `test-component-${componentName.toLowerCase()}-error-state`,
        type: 'Component',
        componentName,
        componentType,
        testScenario: 'interaction',
        tags,
        testCase: componentType === 'LWC'
          ? generateLWCComponentErrorStateTestCase(componentName)
          : generateAuraComponentErrorStateTestCase(componentName),
      },
    ],
  };
}

