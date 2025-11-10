/**
 * Type definitions for the metadata registry
 */

import type { MetadataItem, ScanStatistics } from './metadata.js';

/**
 * In-memory registry of metadata items
 */
export interface MetadataRegistry {
  items: MetadataItem[];
  statistics: ScanStatistics;
  addItem(item: MetadataItem): void;
  getItemsByType(type: string): MetadataItem[];
  getItemsByPurpose(purpose: string): MetadataItem[];
  getStatistics(): ScanStatistics;
  toJSON(): RegistryJSON;
}

/**
 * JSON representation of the registry for persistence
 */
export interface RegistryJSON {
  items: MetadataItem[];
  statistics: ScanStatistics;
  generatedAt: string;
  version: string;
}

