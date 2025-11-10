/**
 * Type definitions for parsed XML metadata structures
 */

/**
 * Object definition parsed from XML
 */
export interface ObjectDefinition {
  fullName: string;
  label?: string;
  pluralLabel?: string;
  description?: string;
  sharingModel?: string;
  deploymentStatus?: string;
  fields: FieldDefinition[];
  validationRules: ValidationRule[];
  recordTypes: RecordType[];
  relationships: Relationship[];
  [key: string]: unknown; // Allow additional properties from XML
}

/**
 * Field definition parsed from XML
 */
export interface FieldDefinition {
  fullName: string;
  type: string;
  label?: string;
  description?: string;
  required?: boolean;
  unique?: boolean;
  externalId?: boolean;
  trackHistory?: boolean;
  trackFeedHistory?: boolean;
  helpText?: string;
  defaultValue?: string | number | boolean;
  formula?: string;
  length?: number;
  precision?: number;
  scale?: number;
  referenceTo?: string | string[];
  relationshipName?: string;
  relationshipLabel?: string;
  cascadeDelete?: boolean;
  restrictedDelete?: boolean;
  reparentableMasterDetail?: boolean;
  [key: string]: unknown; // Allow additional properties from XML
}

/**
 * Validation rule parsed from XML
 */
export interface ValidationRule {
  fullName: string;
  active: boolean;
  description?: string;
  errorConditionFormula: string;
  errorDisplayField?: string;
  errorMessage: string;
  parsedFormula?: ParsedFormula; // Optional parsed structure
}

/**
 * Parsed formula structure (basic parsing attempt)
 */
export interface ParsedFormula {
  type: 'field' | 'function' | 'operator' | 'literal' | 'unknown';
  value: string;
  children?: ParsedFormula[];
}

/**
 * Record type definition parsed from XML
 */
export interface RecordType {
  fullName: string;
  label: string;
  description?: string;
  active: boolean;
  businessProcess?: string;
  picklistValues?: RecordTypePicklistValue[];
}

/**
 * Picklist value assignment for record type
 */
export interface RecordTypePicklistValue {
  picklist: string;
  values: string[];
}

/**
 * Relationship between objects
 */
export interface Relationship {
  fieldName: string;
  type: 'MasterDetail' | 'Lookup';
  relatedObject: string;
  relationshipName?: string;
  cascadeDelete?: boolean;
  restrictedDelete?: boolean;
  reparentableMasterDetail?: boolean;
}

