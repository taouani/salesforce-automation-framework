/**
 * DML operation parser for extracting DML operations from Apex code
 */

import { logger } from '../utils/logger.js';
import { DMLParseError } from '../utils/apex-errors.js';
import type { DMLOperationDefinition, DMLOperationType, DMLOptionsDefinition } from '../types/apex-parsed.js';

/**
 * Extracts DML operations from Apex code
 */
export function extractDMLOperations(code: string, context?: string): DMLOperationDefinition[] {
  const operations: DMLOperationDefinition[] = [];
  
  try {
    // Match insert operations: insert record; or Database.insert(records, allOrNothing);
    operations.push(...extractDMLOperation(code, 'insert', context));
    
    // Match update operations: update record; or Database.update(records, allOrNothing);
    operations.push(...extractDMLOperation(code, 'update', context));
    
    // Match upsert operations: upsert record; or Database.upsert(records, externalIdField, allOrNothing);
    operations.push(...extractDMLOperation(code, 'upsert', context));
    
    // Match delete operations: delete record; or Database.delete(records, allOrNothing);
    operations.push(...extractDMLOperation(code, 'delete', context));
    
    // Match undelete operations: undelete record; or Database.undelete(records, allOrNothing);
    operations.push(...extractDMLOperation(code, 'undelete', context));
    
    return operations;
  } catch (error) {
    logger.warn({ error }, 'Failed to extract DML operations');
    throw new DMLParseError('Failed to extract DML operations', undefined, error instanceof Error ? error : undefined);
  }
}

/**
 * Extracts a specific DML operation type from code
 */
function extractDMLOperation(
  code: string,
  operationType: DMLOperationType,
  context?: string
): DMLOperationDefinition[] {
  const operations: DMLOperationDefinition[] = [];
  
  // Match simple DML: insert/update/upsert/delete/undelete variable;
  const simpleDMLRegex = new RegExp(
    `\\b${operationType}\\s+([^;]+);`,
    'gi'
  );
  let match;
  
  while ((match = simpleDMLRegex.exec(code)) !== null) {
    const variable = match[1].trim();
    const objects = extractObjectsFromVariable(variable);
    
    operations.push({
      operationType,
      objects: objects.length > 0 ? objects : undefined,
      isBulk: /\bList\b|\b\[\]\b/.test(variable),
      isDatabaseMethod: false,
      context,
    });
  }
  
  // Match Database methods: Database.insert/update/upsert/delete/undelete(records, options);
  const databaseDMLRegex = new RegExp(
    `Database\\.${operationType}\\s*\\(([^)]+)\\)`,
    'gi'
  );
  
  while ((match = databaseDMLRegex.exec(code)) !== null) {
    const params = match[1].split(',').map((p) => p.trim());
    const recordsParam = params[0];
    const objects = extractObjectsFromVariable(recordsParam);
    
    // Extract options for Database methods
    const options: DMLOptionsDefinition = {};
    if (params.length > 1) {
      // Check for allOrNothing (boolean)
      const allOrNothingMatch = params[1].match(/(true|false)/i);
      if (allOrNothingMatch) {
        options.allOrNothing = allOrNothingMatch[1].toLowerCase() === 'true';
      }
      
      // For upsert, second param might be externalIdField
      if (operationType === 'upsert' && params.length > 1) {
        const externalIdMatch = params[1].match(/['"]([^'"]+)['"]/);
        if (externalIdMatch) {
          options.externalIdField = externalIdMatch[1];
        }
      }
    }
    
    operations.push({
      operationType,
      objects: objects.length > 0 ? objects : undefined,
      isBulk: /\bList\b|\b\[\]\b/.test(recordsParam),
      isDatabaseMethod: true,
      options: Object.keys(options).length > 0 ? options : undefined,
      context,
    });
  }
  
  return operations;
}

/**
 * Extracts object names from a variable expression
 * This is a heuristic approach - tries to identify SObject types
 */
function extractObjectsFromVariable(variable: string): string[] {
  const objects: string[] = [];
  
  // Try to extract type from variable declaration patterns
  // Pattern: List<ObjectName> or ObjectName variable
  const typeMatch = variable.match(/(?:List\s*<|Set\s*<|Map\s*<\s*\w+\s*,\s*)?(\w+)(?:\s*>)?/);
  if (typeMatch && typeMatch[1]) {
    const typeName = typeMatch[1];
    // Filter out common non-object types
    if (
      !['String', 'Integer', 'Boolean', 'Decimal', 'Date', 'DateTime', 'Id', 'Object'].includes(typeName)
    ) {
      objects.push(typeName);
    }
  }
  
  // Try to extract from new ObjectName() patterns
  const newMatch = variable.match(/new\s+(\w+)\s*\(/i);
  if (newMatch && newMatch[1]) {
    const typeName = newMatch[1];
    if (!objects.includes(typeName)) {
      objects.push(typeName);
    }
  }
  
  return objects;
}

