/**
 * Flow element extraction
 */

import type {
  FlowElementDefinition,
  FlowElementConnector,
  FlowExpressionDefinition,
} from '../types/flow-parsed.js';

/**
 * Raw Flow element structure
 */
export interface RawFlowElement {
  name?: string;
  label?: string;
  locationX?: number | string;
  locationY?: number | string;
  connector?: RawFlowConnector | RawFlowConnector[];
  defaultConnector?: RawFlowConnector;
  defaultConnectorLabel?: string;
  rules?: RawFlowRule | RawFlowRule[];
  assignmentItems?: RawFlowAssignmentItem | RawFlowAssignmentItem[];
  inputParameters?: RawFlowInputParameter | RawFlowInputParameter[];
  inputAssignments?: RawFlowInputAssignment | RawFlowInputAssignment[];
  object?: string;
  storeOutputAutomatically?: boolean | string;
  getFirstRecordOnly?: boolean | string;
  filterLogic?: string;
  filterConditions?: RawFlowCondition | RawFlowCondition[];
  sortOptions?: unknown;
  queriedFields?: string | string[];
  actionName?: string;
  actionType?: string;
  collectionReference?: string;
  iterationOrder?: string;
  fields?: unknown;
  navigation?: unknown;
  showFooter?: boolean | string;
  showHeader?: boolean | string;
  waitEvents?: unknown;
  formulaExpression?: string;
  flowName?: string;
  type?: string;
  faultConnector?: any;
  faultMessage?: unknown;
  errorMessage?: unknown;
  errorHandling?: unknown;
  retryLogic?: unknown;
  validationRules?: unknown;
  outputParameters?: unknown;
  [key: string]: unknown;
}

/**
 * Raw Flow connector structure
 */
export interface RawFlowConnector {
  targetReference?: string;
  label?: string;
  [key: string]: unknown;
}

/**
 * Raw Flow rule structure (for decisions)
 */
export interface RawFlowRule {
  name?: string;
  label?: string;
  conditionLogic?: string;
  conditions?: RawFlowCondition | RawFlowCondition[];
  connector?: RawFlowConnector;
  [key: string]: unknown;
}

/**
 * Raw Flow condition structure
 */
export interface RawFlowCondition {
  leftValueReference?: string;
  operator?: string;
  rightValue?: unknown;
  [key: string]: unknown;
}

/**
 * Raw Flow assignment item structure
 */
export interface RawFlowAssignmentItem {
  assignToReference?: string;
  operator?: string;
  value?: unknown;
  [key: string]: unknown;
}

/**
 * Raw Flow input parameter structure
 */
export interface RawFlowInputParameter {
  name?: string;
  value?: unknown;
  [key: string]: unknown;
}

/**
 * Raw Flow input assignment structure
 */
export interface RawFlowInputAssignment {
  field?: string;
  value?: unknown;
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
 * Extracts connectors from raw element
 */
function extractConnectors(rawElement: RawFlowElement): FlowElementConnector[] {
  const connectors: FlowElementConnector[] = [];

  // Regular connector
  const connector = normalizeArray(rawElement.connector);
  connector.forEach((c) => {
    if (c.targetReference) {
      connectors.push({
        connectorType: 'next',
        targetElement: c.targetReference,
        label: c.label,
      });
    }
  });

  // Default connector (for decisions)
  if (rawElement.defaultConnector?.targetReference) {
    connectors.push({
      connectorType: 'default',
      targetElement: rawElement.defaultConnector.targetReference,
      label: rawElement.defaultConnectorLabel || rawElement.defaultConnector.label,
    });
  }

  return connectors;
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
 * Extracts action call element
 */
export function extractActionCallElement(rawElement: RawFlowElement): FlowElementDefinition {
  return {
    type: 'Action',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      actionName: rawElement.actionName,
      actionType: rawElement.actionType,
      inputParameters: rawElement.inputParameters,
    },
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts assignment element
 */
export function extractAssignmentElement(rawElement: RawFlowElement): FlowElementDefinition {
  return {
    type: 'Assignment',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      assignmentItems: rawElement.assignmentItems,
    },
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts decision element
 */
export function extractDecisionElement(rawElement: RawFlowElement): FlowElementDefinition {
  const rules = normalizeArray(rawElement.rules);
  const conditions: FlowExpressionDefinition[] = [];

  rules.forEach((rule) => {
    const ruleConditions = normalizeArray(rule.conditions);
    ruleConditions.forEach((cond) => {
      conditions.push(extractExpression(cond));
    });
  });

  return {
    type: 'Decision',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      rules: rawElement.rules,
      conditionLogic: rawElement.conditionLogic,
    },
    conditions,
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts loop element
 */
export function extractLoopElement(rawElement: RawFlowElement): FlowElementDefinition {
  return {
    type: 'Loop',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      collectionReference: rawElement.collectionReference,
      iterationOrder: rawElement.iterationOrder,
    },
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts screen element
 */
export function extractScreenElement(rawElement: RawFlowElement): FlowElementDefinition {
  return {
    type: 'Screen',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      fields: rawElement.fields,
      navigation: rawElement.navigation,
      showFooter: rawElement.showFooter,
      showHeader: rawElement.showHeader,
    },
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts wait element
 */
export function extractWaitElement(rawElement: RawFlowElement): FlowElementDefinition {
  return {
    type: 'Wait',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      waitEvents: rawElement.waitEvents,
    },
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts record lookup element
 */
export function extractRecordLookupElement(rawElement: RawFlowElement): FlowElementDefinition {
  return {
    type: 'RecordLookup',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      object: rawElement.object,
      storeOutputAutomatically: rawElement.storeOutputAutomatically,
      getFirstRecordOnly: rawElement.getFirstRecordOnly,
      filterLogic: rawElement.filterLogic,
      filterConditions: rawElement.filterConditions,
      sortOptions: rawElement.sortOptions,
      queriedFields: rawElement.queriedFields,
    },
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts record create element
 */
export function extractRecordCreateElement(rawElement: RawFlowElement): FlowElementDefinition {
  return {
    type: 'RecordCreate',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      object: rawElement.object,
      inputAssignments: rawElement.inputAssignments,
    },
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts record update element
 */
export function extractRecordUpdateElement(rawElement: RawFlowElement): FlowElementDefinition {
  return {
    type: 'RecordUpdate',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      object: rawElement.object,
      inputAssignments: rawElement.inputAssignments,
      filterLogic: rawElement.filterLogic,
      filterConditions: rawElement.filterConditions,
    },
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts record delete element
 */
export function extractRecordDeleteElement(rawElement: RawFlowElement): FlowElementDefinition {
  return {
    type: 'RecordDelete',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      object: rawElement.object,
      filterLogic: rawElement.filterLogic,
      filterConditions: rawElement.filterConditions,
    },
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts formula element
 */
export function extractFormulaElement(rawElement: RawFlowElement): FlowElementDefinition {
  return {
    type: 'Formula',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      formulaExpression: rawElement.formulaExpression,
    },
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts subflow element
 */
export function extractSubflowElement(rawElement: RawFlowElement): FlowElementDefinition {
  return {
    type: 'Subflow',
    label: rawElement.label,
    apiName: rawElement.name || '',
    properties: {
      flowName: rawElement.flowName,
      inputParameters: rawElement.inputParameters,
    },
    connectors: extractConnectors(rawElement),
  };
}

/**
 * Extracts all elements from raw Flow XML
 */
export function extractFlowElements(rawFlow: { [key: string]: unknown }): FlowElementDefinition[] {
  const elements: FlowElementDefinition[] = [];

  if (!rawFlow) return elements;

  // Extract action calls
  const actionCalls = normalizeArray(rawFlow.actionCalls as RawFlowElement | RawFlowElement[] | undefined);
  actionCalls.forEach((ac) => {
    elements.push(extractActionCallElement(ac));
  });

  // Extract assignments
  const assignments = normalizeArray(rawFlow.assignments as RawFlowElement | RawFlowElement[] | undefined);
  assignments.forEach((a) => {
    elements.push(extractAssignmentElement(a));
  });

  // Extract decisions
  const decisions = normalizeArray(rawFlow.decisions as RawFlowElement | RawFlowElement[] | undefined);
  decisions.forEach((d) => {
    elements.push(extractDecisionElement(d));
  });

  // Extract loops
  const loops = normalizeArray(rawFlow.loops as RawFlowElement | RawFlowElement[] | undefined);
  loops.forEach((l) => {
    elements.push(extractLoopElement(l));
  });

  // Extract screens
  const screens = normalizeArray(rawFlow.screens as RawFlowElement | RawFlowElement[] | undefined);
  screens.forEach((s) => {
    elements.push(extractScreenElement(s));
  });

  // Extract waits
  const waits = normalizeArray(rawFlow.waits as RawFlowElement | RawFlowElement[] | undefined);
  waits.forEach((w) => {
    elements.push(extractWaitElement(w));
  });

  // Extract record lookups
  const recordLookups = normalizeArray(rawFlow.recordLookups as RawFlowElement | RawFlowElement[] | undefined);
  recordLookups.forEach((rl) => {
    elements.push(extractRecordLookupElement(rl));
  });

  // Extract record creates
  const recordCreates = normalizeArray(rawFlow.recordCreates as RawFlowElement | RawFlowElement[] | undefined);
  recordCreates.forEach((rc) => {
    elements.push(extractRecordCreateElement(rc));
  });

  // Extract record updates
  const recordUpdates = normalizeArray(rawFlow.recordUpdates as RawFlowElement | RawFlowElement[] | undefined);
  recordUpdates.forEach((ru) => {
    elements.push(extractRecordUpdateElement(ru));
  });

  // Extract record deletes
  const recordDeletes = normalizeArray(rawFlow.recordDeletes as RawFlowElement | RawFlowElement[] | undefined);
  recordDeletes.forEach((rd) => {
    elements.push(extractRecordDeleteElement(rd));
  });

  // Extract formulas
  const formulas = normalizeArray(rawFlow.formulas as RawFlowElement | RawFlowElement[] | undefined);
  formulas.forEach((f) => {
    elements.push(extractFormulaElement(f));
  });

  // Extract subflows
  const subflows = normalizeArray(rawFlow.subflows as RawFlowElement | RawFlowElement[] | undefined);
  subflows.forEach((sf) => {
    elements.push(extractSubflowElement(sf));
  });

  return elements;
}

