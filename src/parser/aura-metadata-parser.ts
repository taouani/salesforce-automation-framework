/**
 * Metadata parser for Aura component .cmp-meta.xml and .app-meta.xml files
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { logger } from '../utils/logger.js';
import { AuraParseError } from '../utils/aura-errors.js';
import type { ComponentMetadata, ApplicationMetadata } from '../types/aura-parsed.js';

/**
 * Parses .cmp-meta.xml file to extract component metadata
 */
export async function parseAuraComponentMetadata(filePath: string): Promise<Partial<ComponentMetadata>> {
  if (!existsSync(filePath)) {
    logger.debug({ filePath }, 'No metadata file found, using defaults');
    return {};
  }

  try {
    logger.debug({ filePath }, 'Parsing Aura component metadata file');
    const xmlContent = await readFile(filePath, 'utf-8');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      removeNSPrefix: true,
      parseTagValue: false, // Preserve text values as strings
    });
    
    const parsed = parser.parse(xmlContent);
    const meta = parsed.AuraDefinitionBundle || parsed;

    const metadata: Partial<ComponentMetadata> = {};

    // Extract API version (can be string or number)
    if (meta.apiVersion !== undefined) {
      metadata.apiVersion = String(meta.apiVersion);
    }

    // Extract description
    if (meta.description !== undefined) {
      metadata.description = String(meta.description);
    }

    logger.debug({ filePath, metadata }, 'Aura component metadata parsed successfully');
    return metadata;
  } catch (error) {
    logger.warn({ filePath, error }, 'Failed to parse Aura component metadata file');
    throw new AuraParseError(filePath, error instanceof Error ? error : undefined);
  }
}

/**
 * Parses .app-meta.xml file to extract application metadata
 */
export async function parseAuraApplicationMetadata(filePath: string): Promise<Partial<ApplicationMetadata>> {
  if (!existsSync(filePath)) {
    logger.debug({ filePath }, 'No metadata file found, using defaults');
    return {};
  }

  try {
    logger.debug({ filePath }, 'Parsing Aura application metadata file');
    const xmlContent = await readFile(filePath, 'utf-8');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      removeNSPrefix: true,
      parseTagValue: false, // Preserve text values as strings
    });
    
    const parsed = parser.parse(xmlContent);
    const meta = parsed.AuraDefinitionBundle || parsed;

    const metadata: Partial<ApplicationMetadata> = {};

    // Extract API version (can be string or number)
    if (meta.apiVersion !== undefined) {
      metadata.apiVersion = String(meta.apiVersion);
    }

    // Extract description
    if (meta.description !== undefined) {
      metadata.description = String(meta.description);
    }

    logger.debug({ filePath, metadata }, 'Aura application metadata parsed successfully');
    return metadata;
  } catch (error) {
    logger.warn({ filePath, error }, 'Failed to parse Aura application metadata file');
    throw new AuraParseError(filePath, error instanceof Error ? error : undefined);
  }
}

