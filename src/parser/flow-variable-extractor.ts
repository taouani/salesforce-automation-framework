/**
 * Flow variable extraction
 */

import type { FlowVariableDefinition } from '../types/flow-parsed.js';

/**
 * Raw Flow variable structure
 */
interface RawFlowVariable {
  name?: string;
  dataType?: string;
  isInput?: boolean | string;
  isOutput?: boolean | string;
  defaultValue?: unknown;
  description?: string;
  objectType?: string;
  isCollection?: boolean | string;
  [key: string]: unknown;
}

/**
 * Normalizes array or single item to array
 */
function normalizeArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/**
 * Converts boolean/string to boolean
 */
function toBoolean(value: boolean | string | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}

/**
 * Extracts variables from raw Flow XML
 */
export function extractFlowVariables(rawFlow: { [key: string]: unknown }): FlowVariableDefinition[] {
  const variables: FlowVariableDefinition[] = [];

  if (!rawFlow) return variables;

  const rawVariables = normalizeArray(rawFlow.variables as RawFlowVariable | RawFlowVariable[] | undefined);
  rawVariables.forEach((rv) => {
    if (rv.name) {
      variables.push({
        name: rv.name,
        type: (rv.dataType as any) || 'String',
        dataType: rv.dataType,
        isInput: toBoolean(rv.isInput),
        isOutput: toBoolean(rv.isOutput),
        defaultValue: rv.defaultValue,
        description: rv.description,
        scope: 'flow',
      });
    }
  });

  return variables;
}

