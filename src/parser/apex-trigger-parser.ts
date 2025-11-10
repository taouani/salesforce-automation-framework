/**
 * Apex trigger file parser using regex-based extraction
 */

import { readFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import { ApexTriggerParseError } from '../utils/apex-errors.js';
import type {
  ApexTriggerDefinition,
  TriggerEventType,
} from '../types/apex-parsed.js';
import { extractDMLOperations } from './dml-parser.js';

/**
 * Parses an Apex trigger file and extracts trigger structure
 */
export async function parseApexTriggerFile(filePath: string): Promise<ApexTriggerDefinition> {
  try {
    const code = await readFile(filePath, 'utf-8');
    return parseApexTriggerCode(code, filePath);
  } catch (error) {
    logger.warn({ filePath, error }, 'Failed to parse Apex trigger file');
    if (error instanceof Error) {
      throw new ApexTriggerParseError(filePath, error);
    }
    throw new ApexTriggerParseError(filePath);
  }
}

/**
 * Parses Apex trigger code and extracts trigger structure (allows code to be passed directly)
 */
export function parseApexTriggerCode(code: string, filePath: string): ApexTriggerDefinition {
  // Extract trigger name from file path if not found in code
  const fileName = filePath.split('/').pop()?.replace(/\.trigger$/, '') || '';
  
  // Extract trigger definition
  const triggerDef = extractTriggerDefinition(code, fileName);
  
  return triggerDef;
}

/**
 * Extracts trigger definition from Apex code
 */
function extractTriggerDefinition(code: string, fallbackName: string): ApexTriggerDefinition {
  // Extract trigger declaration: trigger TriggerName on ObjectName (events) { ... }
  const triggerMatch = code.match(
    /trigger\s+(\w+)\s+on\s+(\w+)\s*\(([^)]+)\)\s*\{/i
  );
  
  if (!triggerMatch) {
    // More tolerant: try simpler pattern
    const simpleMatch = code.match(/trigger\s+(\w+)\s+on\s+(\w+)/i);
    if (simpleMatch) {
      // Return minimal definition if we can't parse fully
      return {
        name: simpleMatch[1] || fallbackName,
        objects: [simpleMatch[2] || 'Unknown'],
        events: [],
        usesTriggerNew: /\bTrigger\.new\b/.test(code),
        usesTriggerOld: /\bTrigger\.old\b/.test(code),
        usesTriggerNewMap: /\bTrigger\.newMap\b/.test(code),
        usesTriggerOldMap: /\bTrigger\.oldMap\b/.test(code),
      };
    }
    throw new Error(`Could not find trigger declaration in code`);
  }
  
  const triggerName = triggerMatch[1] || fallbackName;
  const objectName = triggerMatch[2];
  const eventsStr = triggerMatch[3];
  
  // Extract events
  const events = extractTriggerEvents(eventsStr);
  
  // Extract trigger body content
  const triggerBodyMatch = code.match(/trigger\s+\w+\s+on\s+\w+\s*\([^)]+\)\s*\{([\s\S]*)\}$/);
  const triggerBody = triggerBodyMatch ? triggerBodyMatch[1] : '';
  
  // Check for trigger context variables
  const usesTriggerNew = /\bTrigger\.new\b/.test(triggerBody);
  const usesTriggerOld = /\bTrigger\.old\b/.test(triggerBody);
  const usesTriggerNewMap = /\bTrigger\.newMap\b/.test(triggerBody);
  const usesTriggerOldMap = /\bTrigger\.oldMap\b/.test(triggerBody);
  
  // Extract DML operations from trigger body
  const dmlOperations = extractDMLOperations(triggerBody);
  
  return {
    name: triggerName,
    objects: [objectName],
    events,
    usesTriggerNew,
    usesTriggerOld,
    usesTriggerNewMap,
    usesTriggerOldMap,
    dmlOperations: dmlOperations.length > 0 ? dmlOperations : undefined,
  };
}

/**
 * Extracts trigger events from events string
 */
function extractTriggerEvents(eventsStr: string): TriggerEventType[] {
  const events: TriggerEventType[] = [];
  const eventTypes: TriggerEventType[] = [
    'before insert',
    'after insert',
    'before update',
    'after update',
    'before delete',
    'after delete',
    'after undelete',
  ];
  
  const normalizedStr = eventsStr.toLowerCase().replace(/\s+/g, ' ');
  
  for (const eventType of eventTypes) {
    if (normalizedStr.includes(eventType)) {
      events.push(eventType);
    }
  }
  
  return events;
}

