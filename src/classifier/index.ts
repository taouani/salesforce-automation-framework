/**
 * Main classifier module
 */

import type { MetadataItem, Classification } from '../types/metadata.js';
import { classifyType } from './type-classifier.js';
import { classifyPurposes } from './purpose-classifier.js';
import { extractMetadataFromPath } from '../scanner/file-scanner.js';

/**
 * Classifies a metadata item from its file path
 */
export function classifyMetadata(filePath: string): Classification {
  const type = classifyType(filePath);
  const purposes = classifyPurposes(type);

  return {
    type,
    purposes,
  };
}

/**
 * Creates a MetadataItem from a file path
 */
export function createMetadataItem(filePath: string): MetadataItem {
  const classification = classifyMetadata(filePath);
  const { fileName, directory, extension } = extractMetadataFromPath(filePath);

  return {
    path: filePath,
    type: classification.type,
    purposes: classification.purposes,
    fileName,
    directory,
    extension,
  };
}

