/**
 * Parser for Salesforce validation rule XML files
 */

import { parseXMLFile } from './xml-parser.js';
import type { ValidationRule } from '../types/xml-parsed.js';
import { logger } from '../utils/logger.js';
import { XMLStructureError } from '../utils/xml-errors.js';

/**
 * Raw validation rule XML structure from validationRule-meta.xml
 */
interface RawValidationRuleXML {
  ValidationRule?: {
    fullName?: string;
    active?: boolean | string;
    description?: string;
    errorConditionFormula?: string;
    errorDisplayField?: string;
    errorMessage?: string;
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
 * Attempts basic parsing of validation rule formula
 */
function parseFormula(formula: string): ValidationRule['parsedFormula'] | undefined {
  // Basic parsing attempt - extract field references and functions
  try {
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
 * Parses a validation rule XML file
 */
export async function parseValidationRuleXML(filePath: string): Promise<ValidationRule> {
  try {
    const rawXML = await parseXMLFile<RawValidationRuleXML>(filePath);
    const validationRule = rawXML.ValidationRule;

    if (!validationRule) {
      throw new XMLStructureError('Missing ValidationRule element', filePath);
    }

    if (!validationRule.fullName) {
      // Extract from filename if missing
      const fileName = filePath.split('/').pop() || '';
      const fullName = fileName.replace(/\.validationRule-meta\.xml$/, '');
      if (!fullName) {
        throw new XMLStructureError('Missing fullName in ValidationRule', filePath);
      }
      validationRule.fullName = fullName;
    }

    const rule: ValidationRule = {
      fullName: validationRule.fullName,
      active: toBoolean(validationRule.active),
      description: validationRule.description,
      errorConditionFormula: validationRule.errorConditionFormula || '',
      errorDisplayField: validationRule.errorDisplayField,
      errorMessage: validationRule.errorMessage || '',
    };

    // Attempt to parse formula if present
    if (rule.errorConditionFormula) {
      rule.parsedFormula = parseFormula(rule.errorConditionFormula);
    }

    logger.debug({ filePath, ruleName: rule.fullName }, 'Validation rule XML parsed successfully');

    return rule;
  } catch (error) {
    logger.warn({ filePath, error }, 'Failed to parse validation rule XML');
    throw error;
  }
}

