/**
 * JSON report generator
 */

import type { MetadataRegistry } from '../registry/metadata-registry.js';

/**
 * Generates a JSON report
 */
export function generateJSONReport(registry: MetadataRegistry): string {
  const json = registry.toJSON();
  return JSON.stringify(json, null, 2);
}

