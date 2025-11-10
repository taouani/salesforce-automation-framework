/**
 * Base XML parser utility using fast-xml-parser
 */

import { XMLParser } from 'fast-xml-parser';
import { readFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import { XMLParseError } from '../utils/xml-errors.js';

/**
 * Configuration for fast-xml-parser
 */
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
  ignoreNameSpace: true, // Ignore namespaces to handle Salesforce XML
  removeNSPrefix: true, // Remove namespace prefixes
  parseTrueNumberOnly: false,
  arrayMode: false,
  alwaysCreateTextNode: false,
  isArray: (_name: string, jPath: string) => {
    // Common Salesforce XML arrays
    const arrayFields = [
      'fields',
      'validationRules',
      'recordTypes',
      'objectPermissions',
      'fieldPermissions',
      'classAccesses',
      'pageAccesses',
      'userPermissions',
      'applicationVisibilities',
      'tabVisibilities',
      'customPermissions',
      'actionOverrides',
      'picklistValues',
    ];
    // Check if the path ends with the array field name
    return arrayFields.some((field) => jPath.endsWith(`.${field}`) || jPath.endsWith(`[${field}]`));
  },
};

const parser = new XMLParser(parserOptions);

/**
 * Parses an XML file and returns the parsed object
 */
export async function parseXMLFile<T = unknown>(filePath: string): Promise<T> {
  try {
    logger.debug({ filePath }, 'Parsing XML file');
    const xmlContent = await readFile(filePath, 'utf-8');
    const parsed = parser.parse(xmlContent) as T;
    logger.debug({ filePath }, 'XML file parsed successfully');
    return parsed;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn({ filePath, error: errorMessage }, 'Failed to parse XML file');
    throw new XMLParseError(filePath, error instanceof Error ? error : undefined);
  }
}

/**
 * Parses XML content string and returns the parsed object
 */
export function parseXMLContent<T = unknown>(xmlContent: string): T {
  try {
    const parsed = parser.parse(xmlContent) as T;
    return parsed;
  } catch (error) {
    throw new XMLParseError('XML content', error instanceof Error ? error : undefined);
  }
}

