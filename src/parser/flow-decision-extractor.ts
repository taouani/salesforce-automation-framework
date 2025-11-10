/**
 * Flow decision path extraction
 */

import type {
  FlowDecisionPathDefinition,
  FlowDecisionOutcome,
  FlowExpressionDefinition,
} from '../types/flow-parsed.js';
import type { RawFlowElement, RawFlowRule, RawFlowCondition } from './flow-element-extractor.js';

/**
 * Normalizes array or single item to array
 */
function normalizeArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/**
 * Extracts expression from raw condition
 */
function extractExpression(condition: RawFlowCondition): FlowExpressionDefinition {
  const expressionText = condition.leftValueReference || '';
  const fieldReferences: string[] = [];

  if (condition.leftValueReference) {
    fieldReferences.push(condition.leftValueReference);
  }

  return {
    expressionText,
    type: 'condition',
    fieldReferences,
  };
}

/**
 * Extracts decision outcomes from decision element rules
 */
function extractDecisionOutcomes(
  decisionElement: RawFlowElement,
  rules: RawFlowRule[]
): FlowDecisionOutcome[] {
  const outcomes: FlowDecisionOutcome[] = [];

  rules.forEach((rule) => {
    const conditions = normalizeArray(rule.conditions);
    const criteria: FlowExpressionDefinition[] = conditions.map((cond) => extractExpression(cond));

    // Determine outcome type based on rule connector
    let outcomeType: 'True' | 'False' | 'Default' = 'True';
    if (rule.connector?.targetReference) {
      // This is a true path outcome
      outcomeType = 'True';
    } else if (decisionElement.defaultConnector?.targetReference) {
      // This is a default outcome
      outcomeType = 'Default';
    }

    outcomes.push({
      outcomeType,
      label: rule.label,
      criteria: criteria.length > 0 ? criteria[0] : undefined, // Use first condition as primary criteria
      targetElement: rule.connector?.targetReference || decisionElement.defaultConnector?.targetReference,
    });
  });

  // Add default outcome if exists
  if (decisionElement.defaultConnector?.targetReference && !outcomes.some((o) => o.outcomeType === 'Default')) {
    outcomes.push({
      outcomeType: 'Default',
      label: decisionElement.defaultConnectorLabel || 'default',
      targetElement: decisionElement.defaultConnector.targetReference,
    });
  }

  return outcomes;
}

/**
 * Extracts decision paths from a Flow definition
 */
export function extractDecisionPaths(
  decisionElements: RawFlowElement[]
): FlowDecisionPathDefinition[] {
  const decisionPaths: FlowDecisionPathDefinition[] = [];

  decisionElements.forEach((decision) => {
    if (!decision.name) return;

    const rules = normalizeArray(decision.rules);
    if (rules.length === 0) return;

    const outcomes = extractDecisionOutcomes(decision, rules);
    const conditions: FlowExpressionDefinition[] = [];

    // Extract all conditions from all rules
    rules.forEach((rule) => {
      const ruleConditions = normalizeArray(rule.conditions);
      ruleConditions.forEach((cond) => {
        conditions.push(extractExpression(cond));
      });
    });

    // Extract paths (connectors)
    const paths = [];
    if (decision.connector) {
      const connectors = normalizeArray(decision.connector);
      connectors.forEach((c) => {
        if (c.targetReference) {
          paths.push({
            connectorType: 'next',
            targetElement: c.targetReference,
            label: c.label,
          });
        }
      });
    }
    if (decision.defaultConnector?.targetReference) {
      paths.push({
        connectorType: 'default',
        targetElement: decision.defaultConnector.targetReference,
        label: decision.defaultConnectorLabel || decision.defaultConnector.label,
      });
    }

    // Extract condition logic from first rule (if available)
    const conditionLogic = rules[0]?.conditionLogic;

    decisionPaths.push({
      decisionElement: decision.name,
      outcomes,
      paths,
      criteria: conditions.length > 0 ? conditions[0] : undefined,
      conditionLogic,
    });
  });

  return decisionPaths;
}

