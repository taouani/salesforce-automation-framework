/**
 * Flow Test Generator
 *
 * Emits Playwright tests for Salesforce Flows. The screen-navigation test
 * walks each parsed screen, fills declared fields by their label (the most
 * stable Salesforce screen-flow selector), clicks Next/Finish, and asserts
 * the flow completes. Decision-path and error-handling tests provide a
 * skeleton with USER-CODE blocks so authors can wire up rule-tripping data
 * without losing their work on regeneration.
 */

import type { FlowTestDefinition, TestGroupDefinition } from '../../types/test-generation.js';
import type {
  FlowDefinition,
  FlowScreenDefinition,
  FlowDecisionPathDefinition,
} from '../../types/flow-parsed.js';
import { generateTestTags } from '../../utils/test-tag-generator.js';

export function convertFlowToTests(flowDef: FlowDefinition): FlowTestDefinition[] {
  const flowName = String(flowDef.fullName || flowDef.name || 'Unknown');
  const tests: FlowTestDefinition[] = [];

  tests.push({
    name: `test-flow-${flowName.toLowerCase()}-execution`,
    type: 'Flow',
    flowName,
    testScenario: 'execution',
    flowInputs: {},
    testCase: generateFlowExecutionTestCase(flowName),
    tags: generateTestTags('Flow', { flowName }),
  });

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

function flowUrl(flowName: string): string {
  return `/flow/${flowName}`;
}

function generateFlowExecutionTestCase(flowName: string): string {
  // The flow URL pattern depends on how the flow is launched (direct /flow/X
  // vs embedded in a Lightning page). The USER-CODE block lets authors swap
  // in the right entry point for their org without losing it on regen.
  return `test('should launch flow ${flowName} @flow @flow:${flowName}', async ({ page }) => {
    // <SF-SCANNER:USER-CODE id="flow-${flowName.toLowerCase()}-launch">
    // Default: direct flow runner URL. Replace with your own entry point if
    // the flow is launched from a list view button or auto-launched.
    await page.goto(\`${flowUrl(flowName)}\`);
    // </SF-SCANNER:USER-CODE>

    // Either the flow renders its first screen (any heading is fine) or it
    // completes immediately if it's autolaunched with no screens.
    const heading = page.getByRole('heading').first();
    const completion = page.getByText(/Flow completed|Your flow finished/i).first();
    await expect(heading.or(completion)).toBeVisible({ timeout: 15000 });
  });`;
}

function generateFlowScreenNavigationTestCase(
  flowName: string,
  screens: FlowScreenDefinition[],
): string {
  const flowSlug = flowName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const screenSteps = screens
    .map((screen, index) => {
      const screenName = screen.screenElement || `Screen${index + 1}`;
      const isLast = index === screens.length - 1;
      const buttonName = isLast ? 'Finish' : 'Next';
      const fields = (screen.fields ?? []).filter(Boolean);

      const fieldFills = fields.length
        ? fields
            .map((field) => {
              const label = (field.label || field.name || '').replace(/'/g, "\\'");
              const sample = sampleValueForFlowField(field);
              return `    await page.getByLabel('${label}').fill(${sample});`;
            })
            .join('\n')
        : `    // (no fields parsed on this screen)`;

      return `    // Screen ${index + 1}: ${screenName.replace(/'/g, "\\'")}
${fieldFills}
    // <SF-SCANNER:USER-CODE id="flow-${flowSlug}-screen-${index + 1}-extra">
    // </SF-SCANNER:USER-CODE>
    await page.getByRole('button', { name: /^${buttonName}$/i }).first().click();`;
    })
    .join('\n\n');

  return `test('should navigate flow screens for ${flowName} @flow @flow:${flowName}', async ({ page }) => {
    // <SF-SCANNER:USER-CODE id="flow-${flowSlug}-launch">
    await page.goto(\`${flowUrl(flowName)}\`);
    // </SF-SCANNER:USER-CODE>

${screenSteps}

    await expect(page.getByText(/Flow completed|Your flow finished/i).first()).toBeVisible({ timeout: 15000 });
  });`;
}

function generateFlowDecisionPathTestCase(
  flowName: string,
  decisionPaths: FlowDecisionPathDefinition[],
): string {
  const flowSlug = flowName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const decisions = decisionPaths
    .map((path, index) => {
      const decisionElement = path.decisionElement || `Decision${index + 1}`;
      const safeId = `${flowSlug}-decision-${index + 1}`;
      return `    // Decision ${index + 1}: ${decisionElement.replace(/'/g, "\\'")}
    // <SF-SCANNER:USER-CODE id="${safeId}">
    // Provide field-fills that route through this decision branch, then
    // assert the resulting screen/route is visible.
    // </SF-SCANNER:USER-CODE>`;
    })
    .join('\n\n');

  return `test('should exercise flow decision paths for ${flowName} @flow @flow:${flowName}', async ({ page }) => {
    // <SF-SCANNER:USER-CODE id="flow-${flowSlug}-decision-launch">
    await page.goto(\`${flowUrl(flowName)}\`);
    // </SF-SCANNER:USER-CODE>

${decisions}

    await expect(page.getByText(/Flow completed|Your flow finished/i).first()).toBeVisible({ timeout: 15000 });
  });`;
}

function generateFlowErrorHandlingTestCase(flowName: string): string {
  const flowSlug = flowName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `test('should surface errors gracefully for ${flowName} @flow @flow:${flowName}', async ({ page }) => {
    // <SF-SCANNER:USER-CODE id="flow-${flowSlug}-error-launch">
    // Replace with the flow entry point and the field-fills that should
    // trigger a validation failure or DML error.
    await page.goto(\`${flowUrl(flowName)}\`);
    // </SF-SCANNER:USER-CODE>

    // Salesforce screen flows render errors either in an inline alert or
    // via a fault path. Either pattern is acceptable.
    const errorAlert = page.getByRole('alert').first();
    const errorText = page.getByText(/error|failed|please correct/i).first();
    await expect(errorAlert.or(errorText)).toBeVisible({ timeout: 15000 });
  });`;
}

/**
 * Picks a plausible default value for a flow screen field based on its
 * declared type. Returns a string literal expression suitable for embedding
 * in generated TypeScript (so callers concatenate it raw).
 */
function sampleValueForFlowField(field: { dataType?: string; type?: string }): string {
  const t = String(field.dataType || field.type || '').toLowerCase();
  if (t.includes('email')) return `'test@example.com'`;
  if (t.includes('url')) return `'https://example.com'`;
  if (t.includes('phone')) return `'415-555-0100'`;
  if (t.includes('number') || t.includes('currency')) return `'42'`;
  if (t.includes('date')) return `'2026-01-01'`;
  if (t.includes('checkbox') || t.includes('boolean')) return `'true'`;
  return `'Test Value'`;
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
