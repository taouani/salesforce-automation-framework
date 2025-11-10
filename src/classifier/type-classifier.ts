/**
 * Classifies metadata by type based on directory names and file extensions
 */

import type { MetadataType } from '../types/metadata.js';
import { extractMetadataFromPath } from '../scanner/file-scanner.js';

/**
 * Mapping of directory names to metadata types
 */
const DIRECTORY_TYPE_MAP: Record<string, MetadataType> = {
  objects: 'object',
  classes: 'class',
  triggers: 'trigger',
  lwc: 'lwc',
  'LWC in folders': 'lwc',
  aura: 'aura',
  flows: 'flow',
  profiles: 'profile',
  permissionsets: 'permissionset',
  permissionsetgroups: 'permissionsetgroup',
  custompermissions: 'custompermission',
  layouts: 'layout',
  pages: 'page',
  labels: 'label',
  flexipages: 'flexipage',
};

/**
 * Mapping of file extensions to metadata types
 */
const EXTENSION_TYPE_MAP: Record<string, MetadataType> = {
  '.cls': 'class',
  '.trigger': 'trigger',
  '.js': 'lwc',
  '.html': 'lwc',
  '.css': 'lwc',
  '.cmp': 'aura',
  '.app': 'aura',
  '.xml': 'object', // Default, will be refined by directory
};

/**
 * Classifies metadata type from file path
 */
export function classifyType(filePath: string): MetadataType {
  const { directory, extension } = extractMetadataFromPath(filePath);

  // First try directory-based classification
  const normalizedDir = directory.toLowerCase();
  if (DIRECTORY_TYPE_MAP[normalizedDir]) {
    return DIRECTORY_TYPE_MAP[normalizedDir];
  }

  // Fall back to extension-based classification
  if (EXTENSION_TYPE_MAP[extension]) {
    return EXTENSION_TYPE_MAP[extension];
  }

  // Default to custom for unknown types
  return 'custom';
}

