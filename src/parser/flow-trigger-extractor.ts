/**
 * Flow entry points and triggers extraction
 */

import type {
  FlowTriggerDefinition,
  FlowTriggerType,
  FlowTriggerEvent,
} from '../types/flow-parsed.js';

/**
 * Raw Flow XML structure for triggers
 */
interface RawFlowTrigger {
  recordTriggerType?: string;
  recordTriggerObject?: string;
  triggerType?: string;
  processType?: string;
  startElementReference?: string;
  schedule?: unknown;
  scheduledPaths?: unknown;
  platformEventSource?: unknown;
  [key: string]: unknown;
}

/**
 * Determines trigger type from Flow XML
 */
function determineTriggerType(rawFlow: RawFlowTrigger): FlowTriggerType {
  const triggerType = rawFlow.triggerType?.toLowerCase();
  const processType = rawFlow.processType?.toLowerCase();

  if (triggerType === 'recordtriggeredflow' || triggerType === 'recordtriggered') {
    return 'RecordTriggered';
  }
  if (processType === 'scheduledflow' || rawFlow.schedule) {
    return 'Scheduled';
  }
  if (rawFlow.platformEventSource) {
    return 'PlatformEvent';
  }
  return 'Autolaunched';
}

/**
 * Determines trigger events from Flow XML
 */
function determineTriggerEvents(rawFlow: RawFlowTrigger): FlowTriggerEvent[] {
  const events: FlowTriggerEvent[] = [];
  const recordTriggerType = rawFlow.recordTriggerType?.toLowerCase();

  if (recordTriggerType) {
    if (recordTriggerType.includes('before') || recordTriggerType === 'before') {
      events.push('BeforeSave');
    }
    if (recordTriggerType.includes('after') || recordTriggerType === 'after') {
      events.push('AfterSave');
    }
    if (recordTriggerType.includes('delete')) {
      events.push('AfterDelete');
    }
    if (recordTriggerType.includes('undelete')) {
      events.push('AfterUndelete');
    }
  }

  return events.length > 0 ? events : [];
}

/**
 * Extracts trigger conditions from Flow XML
 */
function extractTriggerConditions(rawFlow: RawFlowTrigger): unknown[] {
  const conditions: unknown[] = [];

  // Extract record trigger conditions
  if (rawFlow.recordTriggerObject) {
    conditions.push({
      type: 'record',
      object: rawFlow.recordTriggerObject,
      criteria: rawFlow.recordTriggerType,
    });
  }

  // Extract scheduled trigger conditions
  if (rawFlow.schedule) {
    const schedule = rawFlow.schedule as any;
    conditions.push({
      type: 'scheduled',
      schedule: schedule,
    });
  }

  // Extract platform event conditions
  if (rawFlow.platformEventSource) {
    const platformEvent = rawFlow.platformEventSource as any;
    conditions.push({
      type: 'platformEvent',
      eventType: platformEvent.eventType,
    });
  }

  return conditions;
}

/**
 * Extracts flow triggers from Flow XML
 */
export function extractFlowTriggers(rawFlow: RawFlowTrigger): FlowTriggerDefinition[] {
  const triggers: FlowTriggerDefinition[] = [];

  const triggerType = determineTriggerType(rawFlow);
  const events = determineTriggerEvents(rawFlow);
  const conditions = extractTriggerConditions(rawFlow);

  // Only create trigger if there's meaningful trigger information
  if (
    triggerType !== 'Autolaunched' ||
    rawFlow.recordTriggerObject ||
    rawFlow.schedule ||
    rawFlow.platformEventSource
  ) {
    triggers.push({
      triggerType,
      object: rawFlow.recordTriggerObject,
      events: events.length > 0 ? events : undefined,
      conditions: conditions.length > 0 ? (conditions as any) : undefined,
      entryPoint: rawFlow.startElementReference,
      cronExpression: rawFlow.schedule ? JSON.stringify(rawFlow.schedule) : undefined,
      eventType: (rawFlow.platformEventSource as any)?.eventType,
    });
  }

  return triggers;
}

