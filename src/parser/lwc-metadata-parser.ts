/**
 * Metadata parser for LWC component .js-meta.xml files
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { XMLParser } from 'fast-xml-parser';
import { logger } from '../utils/logger.js';
import type { ComponentMetadata } from '../types/lwc-parsed.js';

/**
 * Parses .js-meta.xml file to extract component metadata
 */
export async function parseComponentMetadata(componentDir: string, componentName: string): Promise<Partial<ComponentMetadata>> {
  const metaFilePath = join(componentDir, `${componentName}.js-meta.xml`);
  
  if (!existsSync(metaFilePath)) {
    logger.debug({ componentDir, componentName }, 'No .js-meta.xml file found, using defaults');
    return {};
  }

  try {
    logger.debug({ metaFilePath }, 'Parsing component metadata file');
    const xmlContent = await readFile(metaFilePath, 'utf-8');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      removeNSPrefix: true,
    });
    
    const parsed = parser.parse(xmlContent);
    const meta = parsed.LightningComponentBundle || parsed;

    const metadata: Partial<ComponentMetadata> = {};

    // Extract API version
    if (meta.apiVersion) {
      metadata.apiVersion = meta.apiVersion;
    }

    // Extract target configuration
    if (meta.targets) {
      const targets = Array.isArray(meta.targets) ? meta.targets : [meta.targets];
      metadata.targetConfig = targets.map((t: any) => {
        if (typeof t === 'string') return t;
        if (t.target) return t.target;
        return String(t);
      });
    }

    // Extract description
    if (meta.description) {
      metadata.description = meta.description;
    }

    logger.debug({ componentDir, componentName, metadata }, 'Component metadata parsed successfully');
    return metadata;
  } catch (error) {
    logger.warn({ metaFilePath, error }, 'Failed to parse component metadata file');
    return {};
  }
}

