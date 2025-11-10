/**
 * Flow formulas and expressions extraction
 */

import type {
  FlowFormulaDefinition,
  FlowExpressionDefinition,
  FlowAssignmentDefinition,
} from '../types/flow-parsed.js';
import type { RawFlowElement } from './flow-element-extractor.js';

/**
 * Normalizes array or single item to array
 */
function normalizeArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/**
 * Extracts field references from formula text
 */
function extractFieldReferences(formulaText: string): string[] {
  const fieldReferences: string[] = [];
  // Match field references like {!variable.field} or {!$Record.field}
  const fieldRefRegex = /\{!([^}]+)\}/g;
  let match;
  while ((match = fieldRefRegex.exec(formulaText)) !== null) {
    fieldReferences.push(match[1]);
  }
  return fieldReferences;
}

/**
 * Extracts function calls from formula text
 */
function extractFunctionCalls(formulaText: string): string[] {
  const functionCalls: string[] = [];
  // Match function calls like FUNCTION_NAME(...)
  const functionRegex = /\b([A-Z_][A-Z0-9_]*)\s*\(/gi;
  let match;
  while ((match = functionRegex.exec(formulaText)) !== null) {
    functionCalls.push(match[1]);
  }
  return functionCalls;
}

/**
 * Extracts formulas from Flow elements
 */
export function extractFlowFormulas(elements: RawFlowElement[]): FlowFormulaDefinition[] {
  const formulas: FlowFormulaDefinition[] = [];

  elements.forEach((element) => {
    if (element.formulaExpression) {
      const formulaText = String(element.formulaExpression);
      const fieldReferences = extractFieldReferences(formulaText);
      const functionCalls = extractFunctionCalls(formulaText);

      formulas.push({
        formulaText,
        fieldReferences,
        functionCalls,
        syntax: 'flow',
      });
    }
  });

  return formulas;
}

/**
 * Extracts expressions from Flow elements
 */
export function extractFlowExpressions(elements: RawFlowElement[]): FlowExpressionDefinition[] {
  const expressions: FlowExpressionDefinition[] = [];

  elements.forEach((element) => {
    // Extract from decision conditions
    if (element.rules) {
      const rules = normalizeArray(element.rules);
      rules.forEach((rule) => {
        if (rule.conditions) {
          const conditions = normalizeArray(rule.conditions);
          conditions.forEach((cond) => {
            if (cond.leftValueReference) {
              const expressionText = cond.leftValueReference;
              const fieldReferences = extractFieldReferences(expressionText);

              expressions.push({
                expressionText,
                type: 'condition',
                fieldReferences,
              });
            }
          });
        }
      });
    }

    // Extract from assignment expressions
    if (element.assignmentItems) {
      const assignments = normalizeArray(element.assignmentItems);
      assignments.forEach((assignment) => {
        if (assignment.value) {
          const valueStr = String(assignment.value);
          const fieldReferences = extractFieldReferences(valueStr);

          expressions.push({
            expressionText: valueStr,
            type: 'assignment',
            fieldReferences,
          });
        }
      });
    }
  });

  return expressions;
}

/**
 * Extracts assignments from Flow elements
 */
export function extractFlowAssignments(elements: RawFlowElement[]): FlowAssignmentDefinition[] {
  const assignments: FlowAssignmentDefinition[] = [];

  elements.forEach((element) => {
    if (element.assignmentItems) {
      const assignmentItems = normalizeArray(element.assignmentItems);
      assignmentItems.forEach((item) => {
        if (item.assignToReference) {
          const variableName = item.assignToReference;
          let expression: FlowExpressionDefinition | undefined;
          let fieldReference: string | undefined;

          if (item.value) {
            const valueStr = String(item.value);
            const fieldReferences = extractFieldReferences(valueStr);

            expression = {
              expressionText: valueStr,
              type: 'assignment',
              fieldReferences,
            };

            if (fieldReferences.length > 0) {
              fieldReference = fieldReferences[0];
            }
          }

          assignments.push({
            variableName,
            expression,
            fieldReference,
          });
        }
      });
    }
  });

  return assignments;
}

