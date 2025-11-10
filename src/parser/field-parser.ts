/**
 * Parser for Salesforce field XML files
 */

import { parseXMLFile } from './xml-parser.js';
import type { FieldDefinition } from '../types/xml-parsed.js';
import { logger } from '../utils/logger.js';
import { XMLStructureError } from '../utils/xml-errors.js';

/**
 * Raw field XML structure from field-meta.xml
 */
interface RawFieldXML {
  CustomField?: {
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
    deleteConstraint?: string;
    [key: string]: unknown;
  };
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
 * Parses a field XML file
 */
export async function parseFieldXML(filePath: string): Promise<FieldDefinition> {
  try {
    const rawXML = await parseXMLFile<RawFieldXML>(filePath);
    const customField = rawXML.CustomField;

    if (!customField) {
      throw new XMLStructureError('Missing CustomField element', filePath);
    }

    if (!customField.fullName) {
      // Extract from filename if missing
      const fileName = filePath.split('/').pop() || '';
      const fullName = fileName.replace(/\.field-meta\.xml$/, '');
      if (!fullName) {
        throw new XMLStructureError('Missing fullName in CustomField', filePath);
      }
      customField.fullName = fullName;
    }

    const field: FieldDefinition = {
      fullName: customField.fullName,
      type: customField.type || '',
      label: customField.label,
      description: customField.description,
      required: toBoolean(customField.required),
      unique: toBoolean(customField.unique),
      externalId: toBoolean(customField.externalId),
      trackHistory: toBoolean(customField.trackHistory),
      trackFeedHistory: toBoolean(customField.trackFeedHistory),
      helpText: customField.helpText,
      defaultValue: customField.defaultValue,
      formula: customField.formula,
      length: toNumber(customField.length),
      precision: toNumber(customField.precision),
      scale: toNumber(customField.scale),
      referenceTo: customField.referenceTo,
      relationshipName: customField.relationshipName,
      relationshipLabel: customField.relationshipLabel,
      cascadeDelete: toBoolean(customField.cascadeDelete),
      restrictedDelete: toBoolean(customField.restrictedDelete),
      reparentableMasterDetail: toBoolean(customField.reparentableMasterDetail),
    };

    // Copy any additional properties
    for (const [key, value] of Object.entries(customField)) {
      if (!(key in field)) {
        field[key] = value;
      }
    }

    logger.debug({ filePath, fieldName: field.fullName }, 'Field XML parsed successfully');

    return field;
  } catch (error) {
    logger.warn({ filePath, error }, 'Failed to parse field XML');
    throw error;
  }
}

