/**
 * Parser for Salesforce object definition XML files
 */

import { parseXMLFile } from './xml-parser.js';
import type {
  ObjectDefinition,
  FieldDefinition,
  ValidationRule,
  RecordType,
  Relationship,
} from '../types/xml-parsed.js';
import { logger } from '../utils/logger.js';
import { XMLStructureError } from '../utils/xml-errors.js';

/**
 * Raw XML structure from Salesforce object-meta.xml
 */
interface RawObjectXML {
  CustomObject?: {
    fullName?: string;
    label?: string;
    pluralLabel?: string;
    description?: string;
    sharingModel?: string;
    deploymentStatus?: string;
    fields?: RawFieldXML | RawFieldXML[];
    validationRules?: RawValidationRuleXML | RawValidationRuleXML[];
    recordTypes?: RawRecordTypeXML | RawRecordTypeXML[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Raw field XML structure
 */
interface RawFieldXML {
  fullName?: string;
  type?: string;
  label?: string;
  description?: string;
  required?: boolean | string;
  unique?: boolean | string;
  externalId?: boolean | string;
  trackHistory?: boolean | string;
  trackFeedHistory?: boolean | string;
  helpText?: string;
  defaultValue?: string | number | boolean;
  formula?: string;
  length?: number | string;
  precision?: number | string;
  scale?: number | string;
  referenceTo?: string | string[];
  relationshipName?: string;
  relationshipLabel?: string;
  cascadeDelete?: boolean | string;
  restrictedDelete?: boolean | string;
  reparentableMasterDetail?: boolean | string;
  [key: string]: unknown;
}

/**
 * Raw validation rule XML structure
 */
interface RawValidationRuleXML {
  fullName?: string;
  active?: boolean | string;
  description?: string;
  errorConditionFormula?: string;
  errorDisplayField?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

/**
 * Raw record type XML structure
 */
interface RawRecordTypeXML {
  fullName?: string;
  label?: string;
  description?: string;
  active?: boolean | string;
  businessProcess?: string;
  picklistValues?: RawPicklistValueXML | RawPicklistValueXML[];
  [key: string]: unknown;
}

/**
 * Raw picklist value XML structure
 */
interface RawPicklistValueXML {
  picklist?: string;
  values?: string | string[];
  [key: string]: unknown;
}

/**
 * Converts boolean/string to boolean
 */
function toBoolean(value: boolean | string | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

/**
 * Converts number/string to number
 */
function toNumber(value: number | string | undefined): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Normalizes array - converts single item to array
 */
function normalizeArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/**
 * Parses a field definition from raw XML
 */
function parseField(rawField: RawFieldXML): FieldDefinition {
  const field: FieldDefinition = {
    fullName: rawField.fullName || '',
    type: rawField.type || '',
    label: rawField.label,
    description: rawField.description,
    required: toBoolean(rawField.required),
    unique: toBoolean(rawField.unique),
    externalId: toBoolean(rawField.externalId),
    trackHistory: toBoolean(rawField.trackHistory),
    trackFeedHistory: toBoolean(rawField.trackFeedHistory),
    helpText: rawField.helpText,
    defaultValue: rawField.defaultValue,
    formula: rawField.formula,
    length: toNumber(rawField.length),
    precision: toNumber(rawField.precision),
    scale: toNumber(rawField.scale),
    referenceTo: rawField.referenceTo,
    relationshipName: rawField.relationshipName,
    relationshipLabel: rawField.relationshipLabel,
    cascadeDelete: toBoolean(rawField.cascadeDelete),
    restrictedDelete: toBoolean(rawField.restrictedDelete),
    reparentableMasterDetail: toBoolean(rawField.reparentableMasterDetail),
  };

  // Copy any additional properties
  for (const [key, value] of Object.entries(rawField)) {
    if (!(key in field)) {
      field[key] = value;
    }
  }

  return field;
}

/**
 * Attempts basic parsing of validation rule formula
 */
function parseFormula(formula: string): ValidationRule['parsedFormula'] | undefined {
  // Basic parsing attempt - extract field references and functions
  // This is a simplified parser, can be enhanced later
  try {
    // Look for common patterns
    const fieldPattern = /[A-Za-z_][A-Za-z0-9_]*__c|[A-Za-z_][A-Za-z0-9_]*/g;
    const fields = formula.match(fieldPattern) || [];

    if (fields.length > 0 && fields[0]) {
      return {
        type: 'field',
        value: fields[0],
        children: fields.slice(1).map((f) => ({ type: 'field', value: f })),
      };
    }
  } catch {
    // If parsing fails, return undefined
  }
  return undefined;
}

/**
 * Parses a validation rule from raw XML
 */
function parseValidationRule(rawRule: RawValidationRuleXML): ValidationRule {
  const rule: ValidationRule = {
    fullName: rawRule.fullName || '',
    active: toBoolean(rawRule.active),
    description: rawRule.description,
    errorConditionFormula: rawRule.errorConditionFormula || '',
    errorDisplayField: rawRule.errorDisplayField,
    errorMessage: rawRule.errorMessage || '',
  };

  // Attempt to parse formula if present
  if (rule.errorConditionFormula) {
    rule.parsedFormula = parseFormula(rule.errorConditionFormula);
  }

  return rule;
}

/**
 * Parses a record type from raw XML
 */
function parseRecordType(rawRecordType: RawRecordTypeXML): RecordType {
  const recordType: RecordType = {
    fullName: rawRecordType.fullName || '',
    label: rawRecordType.label || '',
    description: rawRecordType.description,
    active: toBoolean(rawRecordType.active),
    businessProcess: rawRecordType.businessProcess,
  };

  // Parse picklist values
  if (rawRecordType.picklistValues) {
    const picklistValues = normalizeArray(rawRecordType.picklistValues);
    recordType.picklistValues = picklistValues.map((pv) => {
      const values = normalizeArray(pv.values);
      return {
        picklist: pv.picklist || '',
        values: values.map((v) => String(v)),
      };
    });
  }

  return recordType;
}

/**
 * Extracts relationships from fields
 */
function extractRelationships(fields: FieldDefinition[]): Relationship[] {
  const relationships: Relationship[] = [];

  for (const field of fields) {
    if (field.referenceTo && field.type === 'MasterDetail') {
      const relatedObjects = Array.isArray(field.referenceTo)
        ? field.referenceTo
        : [field.referenceTo];
      for (const relatedObject of relatedObjects) {
        relationships.push({
          fieldName: field.fullName,
          type: 'MasterDetail',
          relatedObject: String(relatedObject),
          relationshipName: field.relationshipName,
          cascadeDelete: field.cascadeDelete,
          restrictedDelete: field.restrictedDelete,
          reparentableMasterDetail: field.reparentableMasterDetail,
        });
      }
    } else if (field.referenceTo && field.type === 'Lookup') {
      const relatedObjects = Array.isArray(field.referenceTo)
        ? field.referenceTo
        : [field.referenceTo];
      for (const relatedObject of relatedObjects) {
        relationships.push({
          fieldName: field.fullName,
          type: 'Lookup',
          relatedObject: String(relatedObject),
          relationshipName: field.relationshipName,
        });
      }
    }
  }

  return relationships;
}

/**
 * Extracts fullName from file path (e.g., "path/to/objects/MyObject__c/MyObject__c.object-meta.xml" -> "MyObject__c")
 */
function extractFullNameFromPath(filePath: string): string {
  // Extract object name from path: objects/ObjectName/ObjectName.object-meta.xml
  const pathParts = filePath.split('/');
  const objectsIndex = pathParts.findIndex((part) => part === 'objects');
  if (objectsIndex >= 0 && objectsIndex < pathParts.length - 1) {
    // The object name is the folder name after 'objects'
    return pathParts[objectsIndex + 1];
  }
  // Fallback: extract from filename
  const fileName = pathParts[pathParts.length - 1] || '';
  return fileName.replace(/\.object-meta\.xml$/, '');
}

/**
 * Parses an object definition XML file
 */
export async function parseObjectXML(filePath: string): Promise<ObjectDefinition> {
  try {
    const rawXML = await parseXMLFile<RawObjectXML>(filePath);
    const customObject = rawXML.CustomObject;

    if (!customObject) {
      throw new XMLStructureError('Missing CustomObject element', filePath);
    }

    // fullName might not be in XML, extract from file path if missing
    const fullName = customObject.fullName || extractFullNameFromPath(filePath);
    
    if (!fullName) {
      throw new XMLStructureError('Could not determine fullName for CustomObject', filePath);
    }

    // Parse fields
    const rawFields = normalizeArray(customObject.fields);
    const fields = rawFields.map(parseField);

    // Parse validation rules
    const rawValidationRules = normalizeArray(customObject.validationRules);
    const validationRules = rawValidationRules.map(parseValidationRule);

    // Parse record types
    const rawRecordTypes = normalizeArray(customObject.recordTypes);
    const recordTypes = rawRecordTypes.map(parseRecordType);

    // Extract relationships from fields
    const relationships = extractRelationships(fields);

    // Build object definition
    const objectDef: ObjectDefinition = {
      fullName,
      label: customObject.label || undefined,
      pluralLabel: customObject.pluralLabel || undefined,
      description: customObject.description || undefined,
      sharingModel: customObject.sharingModel || undefined,
      deploymentStatus: customObject.deploymentStatus || undefined,
      fields,
      validationRules,
      recordTypes,
      relationships,
    };

    // Copy any additional properties
    for (const [key, value] of Object.entries(customObject)) {
      if (!(key in objectDef)) {
        objectDef[key] = value;
      }
    }

    logger.debug({ filePath, objectName: objectDef.fullName }, 'Object XML parsed successfully');

    return objectDef;
  } catch (error) {
    logger.warn({ filePath, error }, 'Failed to parse object XML');
    throw error;
  }
}

