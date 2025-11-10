/**
 * Flow subflow extraction
 */

import type {
  FlowSubflowDefinition,
  FlowSubflowInputDefinition,
  FlowSubflowOutputDefinition,
} from '../types/flow-parsed.js';
import type { RawFlowElement, RawFlowInputParameter } from './flow-element-extractor.js';

/**
 * Normalizes array or single item to array
 */
function normalizeArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/**
 * Extracts subflow inputs from input parameters
 */
function extractSubflowInputs(
  inputParameters: RawFlowInputParameter[]
): FlowSubflowInputDefinition[] {
  const inputs: FlowSubflowInputDefinition[] = [];

  inputParameters.forEach((param) => {
    if (param.name) {
      inputs.push({
        parameterName: param.name,
        variableName: typeof param.value === 'object' && param.value !== null
          ? (param.value as any).elementReference
          : undefined,
        value: typeof param.value === 'object' && param.value !== null
          ? (param.value as any).stringValue || (param.value as any).numberValue || (param.value as any).booleanValue
          : param.value,
      });
    }
  });

  return inputs;
}

/**
 * Extracts subflows from Flow elements
 */
export function extractFlowSubflows(
  elements: RawFlowElement[],
  flowName: string
): FlowSubflowDefinition[] {
  const subflows: FlowSubflowDefinition[] = [];

  elements.forEach((element) => {
    if (element.type === 'Subflow' || element.flowName) {
      const subflowName = element.flowName || element.name || '';
      if (!subflowName) return;

      const inputParameters = normalizeArray(element.inputParameters);
      const inputs = extractSubflowInputs(inputParameters);

      // Extract outputs (if available in element properties)
      const outputs: FlowSubflowOutputDefinition[] = [];
      if (element.outputParameters) {
        const outputParams = normalizeArray(element.outputParameters as any);
        outputParams.forEach((param: any) => {
          if (param.name) {
            outputs.push({
              parameterName: param.name,
              variableName: param.variableName,
            });
          }
        });
      }

      subflows.push({
        subflowName,
        apiName: element.name || subflowName,
        inputs,
        outputs,
        location: `${flowName}:${element.name || 'unknown'}`,
        callContext: {
          elementName: element.name,
          elementLabel: element.label,
        },
      });
    }
  });

  return subflows;
}

