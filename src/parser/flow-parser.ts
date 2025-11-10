/**
 * Flow XML file parser infrastructure
 */

import { parseXMLFile } from './xml-parser.js';
import { logger } from '../utils/logger.js';
import { FlowParseError, FlowStructureError } from '../utils/flow-errors.js';
import type {
  FlowDefinition,
  FlowType,
  FlowStatus,
} from '../types/flow-parsed.js';

/**
 * Raw Flow XML structure
 */
interface RawFlowXML {
  Flow?: {
    fullName?: string;
    apiName?: string;
    label?: string;
    description?: string;
    status?: string;
    processType?: string; // Flow type indicator
    triggerType?: string; // For record-triggered flows
    startElementReference?: string;
    apiVersion?: string;
    actionCalls?: RawFlowElement | RawFlowElement[];
    assignments?: RawFlowElement | RawFlowElement[];
    decisions?: RawFlowElement | RawFlowElement[];
    loops?: RawFlowElement | RawFlowElement[];
    screens?: RawFlowElement | RawFlowElement[];
    waits?: RawFlowElement | RawFlowElement[];
    recordLookups?: RawFlowElement | RawFlowElement[];
    recordCreates?: RawFlowElement | RawFlowElement[];
    recordUpdates?: RawFlowElement | RawFlowElement[];
    recordDeletes?: RawFlowElement | RawFlowElement[];
    formulas?: RawFlowElement | RawFlowElement[];
    subflows?: RawFlowElement | RawFlowElement[];
    variables?: RawFlowVariable | RawFlowVariable[];
    constants?: RawFlowVariable | RawFlowVariable[];
    recordTriggerType?: string;
    recordTriggerObject?: string;
    schedule?: unknown;
    scheduledPaths?: unknown;
    platformEventSource?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Raw Flow element structure
 */
interface RawFlowElement {
  name?: string;
  label?: string;
  locationX?: number | string;
  locationY?: number | string;
  connector?: RawFlowConnector | RawFlowConnector[];
  [key: string]: unknown;
}

/**
 * Raw Flow connector structure
 */
interface RawFlowConnector {
  targetReference?: string;
  label?: string;
  [key: string]: unknown;
}

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
 * Extracts flow name from file path
 */
function extractFlowNameFromPath(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  return fileName.replace(/\.flow-meta\.xml$/, '');
}

/**
 * Determines flow type from XML structure
 */
function determineFlowType(rawFlow: RawFlowXML['Flow']): FlowType {
  if (!rawFlow) {
    return 'Autolaunched'; // Default
  }

  // Check processType
  const processType = rawFlow.processType?.toLowerCase();
  if (processType === 'autolaunchedflow' || processType === 'autolaunched') {
    return 'Autolaunched';
  }
  if (processType === 'screenflow' || processType === 'screen') {
    return 'Screen';
  }
  if (processType === 'flow' || processType === 'workflow') {
    // Check for record-triggered flows (has recordTriggerType or recordTriggerObject)
    if (rawFlow.recordTriggerType || rawFlow.recordTriggerObject) {
      return 'RecordTriggered';
    }
    // Check triggerType for record-triggered flows
    const triggerType = rawFlow.triggerType?.toLowerCase();
    if (triggerType === 'recordtriggeredflow' || triggerType === 'recordtriggered') {
      return 'RecordTriggered';
    }
    // Check for scheduled flows (has schedule element)
    if (rawFlow.schedule || rawFlow.scheduledPaths) {
      return 'Scheduled';
    }
    // Check for platform event flows (has platformEventSource element)
    if (rawFlow.platformEventSource) {
      return 'PlatformEventTriggered';
    }
    // Check for screen elements to identify Screen flows
    if (rawFlow.screens && (Array.isArray(rawFlow.screens) ? rawFlow.screens.length > 0 : true)) {
      return 'Screen';
    }
    return 'Autolaunched';
  }

  // Fallback: Check for indicators of flow type
  if (rawFlow.recordTriggerType || rawFlow.recordTriggerObject) {
    return 'RecordTriggered';
  }
  if (rawFlow.schedule || rawFlow.scheduledPaths) {
    return 'Scheduled';
  }
  if (rawFlow.platformEventSource) {
    return 'PlatformEventTriggered';
  }
  if (rawFlow.screens && (Array.isArray(rawFlow.screens) ? rawFlow.screens.length > 0 : true)) {
    return 'Screen';
  }

  return 'Autolaunched'; // Default
}

/**
 * Determines flow status from XML
 */
function determineFlowStatus(rawFlow: RawFlowXML['Flow']): FlowStatus {
  if (!rawFlow) {
    return 'Draft';
  }

  const status = rawFlow.status?.toLowerCase();
  if (status === 'active') return 'Active';
  if (status === 'obsolete') return 'Obsolete';
  return 'Draft'; // Default
}

/**
 * Parses a Flow XML file and extracts complete Flow structure
 */
export async function parseFlowXML(filePath: string): Promise<FlowDefinition> {
  try {
    const rawXML = await parseXMLFile<RawFlowXML>(filePath);
    const rawFlow = rawXML.Flow;

    if (!rawFlow) {
      throw new FlowStructureError('Missing Flow element', filePath);
    }

    // Extract flow name
    const flowName = rawFlow.fullName || rawFlow.apiName || extractFlowNameFromPath(filePath);
    if (!flowName) {
      throw new FlowStructureError('Could not determine flow name', filePath);
    }

    // Determine flow type and status
    const flowType = determineFlowType(rawFlow);
    const flowStatus = determineFlowStatus(rawFlow);

    // Import element extractor
    const { extractFlowElements } = await import('./flow-element-extractor.js');
    const { extractFlowVariables } = await import('./flow-variable-extractor.js');
    const { extractDecisionPaths } = await import('./flow-decision-extractor.js');
    const { extractFlowTriggers } = await import('./flow-trigger-extractor.js');
    const { extractFlowFormulas, extractFlowAssignments } = await import('./flow-formula-extractor.js');
    const { extractFlowSubflows } = await import('./flow-subflow-extractor.js');
    const { extractFlowErrorHandling } = await import('./flow-error-handling-extractor.js');
    const { extractFlowScreens } = await import('./flow-screen-extractor.js');

    // Extract elements and variables
    const elements = extractFlowElements(rawFlow);
    const variables = extractFlowVariables(rawFlow);

    // Separate inputs and outputs
    const inputs = variables.filter((v) => v.isInput);
    const outputs = variables.filter((v) => v.isOutput);

    // Extract decision paths
    const decisions = normalizeArray(rawFlow.decisions);
    const decisionPaths = extractDecisionPaths(decisions);

    // Extract triggers
    const triggers = extractFlowTriggers(rawFlow);

    // Extract formulas and expressions
    const formulas = extractFlowFormulas(elements);
    const assignments = extractFlowAssignments(elements);

    // Extract subflows
    const subflows = extractFlowSubflows(elements, flowName);

    // Extract error handling
    const errorHandling = extractFlowErrorHandling(elements);

    // Extract screens
    const screens = extractFlowScreens(elements);

    // Extract basic flow information
    const flowDef: FlowDefinition = {
      name: flowName,
      apiName: rawFlow.apiName || flowName,
      type: flowType,
      status: flowStatus,
      label: rawFlow.label,
      description: rawFlow.description,
      elements,
      variables,
      inputs,
      outputs,
      decisionPaths,
      triggers,
      formulas,
      assignments,
      subflows,
      errorHandling,
      screens,
    };

    logger.debug({ filePath, flowName: flowDef.name, flowType, elementCount: elements.length }, 'Flow XML parsed successfully');

    return flowDef;
  } catch (error) {
    logger.warn({ filePath, error }, 'Failed to parse Flow XML');
    if (error instanceof FlowStructureError || error instanceof FlowParseError) {
      throw error;
    }
    throw new FlowParseError(filePath, error instanceof Error ? error : undefined);
  }
}

