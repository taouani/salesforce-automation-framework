/**
 * Type definitions for Salesforce metadata structures
 */

/**
 * Classification by metadata type
 */
export type MetadataType =
  | 'object'
  | 'class'
  | 'trigger'
  | 'lwc'
  | 'aura'
  | 'flow'
  | 'profile'
  | 'permissionset'
  | 'permissionsetgroup'
  | 'custompermission'
  | 'layout'
  | 'page'
  | 'label'
  | 'flexipage'
  | 'custom';

/**
 * Classification by purpose
 */
export type MetadataPurpose =
  | 'data-model'
  | 'ui'
  | 'business-logic'
  | 'permissions'
  | 'configuration';

/**
 * Classification information for a metadata item
 */
export interface Classification {
  type: MetadataType;
  purposes: MetadataPurpose[];
}

/**
 * A single metadata item discovered in the repository
 */
export interface MetadataItem {
  path: string;
  type: MetadataType;
  purposes: MetadataPurpose[];
  fileName: string;
  directory: string;
  extension: string;
}

/**
 * Statistics about the scanned metadata
 */
export interface ScanStatistics {
  totalItems: number;
  countsByType: Record<MetadataType, number>;
  countsByPurpose: Record<MetadataPurpose, number>;
  errors: number;
  warnings: number;
}

/**
 * Result of a metadata scan
 */
export interface ScanResult {
  items: MetadataItem[];
  statistics: ScanStatistics;
  errors: ScanError[];
  warnings: ScanWarning[];
}

/**
 * Error encountered during scanning
 */
export interface ScanError {
  filePath: string;
  message: string;
  error?: Error;
}

/**
 * Warning encountered during scanning
 */
export interface ScanWarning {
  filePath: string;
  message: string;
}

