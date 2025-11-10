/**
 * Flow error handling extraction
 */

import type {
  FlowErrorHandlingDefinition,
  FlowFaultPathDefinition,
  FlowRetryLogicDefinition,
  FlowExpressionDefinition,
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
 * Extracts fault paths from Flow elements
 */
function extractFaultPaths(elements: RawFlowElement[]): FlowFaultPathDefinition[] {
  const faultPaths: FlowFaultPathDefinition[] = [];

  elements.forEach((element) => {
    // Check for fault connectors
    if (element.faultConnector) {
      const faultConn = element.faultConnector as any;
      faultPaths.push({
        faultConnector: 'fault',
        targetElement: faultConn.targetReference,
        errorMessage: (element.faultMessage || element.errorMessage) as string | undefined,
      });
    }

    // Check for error handling in element properties
    if (element.errorHandling) {
      const errorHandling = element.errorHandling as any;
      if (errorHandling.faultPath) {
        faultPaths.push({
          faultConnector: 'fault',
          targetElement: errorHandling.faultPath.targetReference,
          errorMessage: errorHandling.errorMessage,
        });
      }
    }
  });

  return faultPaths;
}

/**
 * Extracts error messages from Flow elements
 */
function extractErrorMessages(elements: RawFlowElement[]): string[] {
  const errorMessages: string[] = [];

  elements.forEach((element) => {
    if (element.faultMessage) {
      errorMessages.push(String(element.faultMessage));
    }
    if (element.errorMessage) {
      errorMessages.push(String(element.errorMessage));
    }
    if (element.errorHandling) {
      const errorHandling = element.errorHandling as any;
      if (errorHandling.errorMessage) {
        errorMessages.push(String(errorHandling.errorMessage));
      }
    }
  });

  return errorMessages;
}

/**
 * Extracts retry logic from Flow elements
 */
function extractRetryLogic(elements: RawFlowElement[]): FlowRetryLogicDefinition | undefined {
  let retryLogic: FlowRetryLogicDefinition | undefined;

  elements.forEach((element) => {
    if (element.retryLogic) {
      const retry = element.retryLogic as any;
      const retryConditions: FlowExpressionDefinition[] = [];

      if (retry.retryConditions) {
        const conditions = normalizeArray(retry.retryConditions);
        conditions.forEach((cond: any) => {
          retryConditions.push({
            expressionText: cond.expression || cond.condition || '',
            type: 'retry',
            fieldReferences: cond.fieldReferences || [],
          });
        });
      }

      retryLogic = {
        retryConditions: retryConditions.length > 0 ? retryConditions : undefined,
        retryAttempts: retry.retryAttempts || retry.maxRetries,
        retryIntervals: retry.retryIntervals || (retry.retryInterval ? [retry.retryInterval] : undefined),
      };
    }
  });

  return retryLogic;
}

/**
 * Extracts error handling from Flow elements
 */
export function extractFlowErrorHandling(
  elements: RawFlowElement[]
): FlowErrorHandlingDefinition | undefined {
  const faultPaths = extractFaultPaths(elements);
  const errorMessages = extractErrorMessages(elements);
  const retryLogic = extractRetryLogic(elements);

  // Only return error handling if there's meaningful data
  if (faultPaths.length === 0 && errorMessages.length === 0 && !retryLogic) {
    return undefined;
  }

  return {
    faultPaths: faultPaths.length > 0 ? faultPaths : undefined,
    errorMessages: errorMessages.length > 0 ? errorMessages : undefined,
    retryLogic,
  };
}

