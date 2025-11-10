/**
 * Parser for Salesforce record type XML files
 */

import { parseXMLFile } from './xml-parser.js';
import type { RecordType } from '../types/xml-parsed.js';
import { logger } from '../utils/logger.js';
import { XMLStructureError } from '../utils/xml-errors.js';

/**
 * Raw record type XML structure from recordType-meta.xml
 */
interface RawRecordTypeXML {
  RecordType?: {
    fullName?: string;
    label?: string;
    description?: string;
    active?: boolean | string;
    businessProcess?: string;
    picklistValues?: RawPicklistValueXML | RawPicklistValueXML[];
    [key: string]: unknown;
  };
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
 * Normalizes array - converts single item to array
 */
function normalizeArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/**
 * Parses a record type XML file
 */
export async function parseRecordTypeXML(filePath: string): Promise<RecordType> {
  try {
    const rawXML = await parseXMLFile<RawRecordTypeXML>(filePath);
    const recordType = rawXML.RecordType;

    if (!recordType) {
      throw new XMLStructureError('Missing RecordType element', filePath);
    }

    if (!recordType.fullName) {
      // Extract from filename if missing
      const fileName = filePath.split('/').pop() || '';
      const fullName = fileName.replace(/\.recordType-meta\.xml$/, '');
      if (!fullName) {
        throw new XMLStructureError('Missing fullName in RecordType', filePath);
      }
      recordType.fullName = fullName;
    }

    const rt: RecordType = {
      fullName: recordType.fullName,
      label: recordType.label || '',
      description: recordType.description,
      active: toBoolean(recordType.active),
      businessProcess: recordType.businessProcess,
    };

    // Parse picklist values
    if (recordType.picklistValues) {
      const picklistValues = normalizeArray(recordType.picklistValues);
      rt.picklistValues = picklistValues.map((pv) => {
        const values = normalizeArray(pv.values);
        return {
          picklist: pv.picklist || '',
          values: values.map((v) => String(v)),
        };
      });
    }

    logger.debug({ filePath, recordTypeName: rt.fullName }, 'Record type XML parsed successfully');

    return rt;
  } catch (error) {
    logger.warn({ filePath, error }, 'Failed to parse record type XML');
    throw error;
  }
}

