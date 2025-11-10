/**
 * Aura application parser for .app files
 */

import * as cheerio from 'cheerio';
import { readFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import { AuraMarkupParseError, AuraStructureError } from '../utils/aura-errors.js';
import type {
  ApplicationDefinition,
  ApplicationExtendsDefinition,
  ApplicationDependencyDefinition,
  ApplicationMetadata,
} from '../types/aura-parsed.js';
import { parseAuraApplicationMetadata } from './aura-metadata-parser.js';
import { join } from 'path';

/**
 * Parses an Aura application .app file
 */
export async function parseAuraApplication(
  appFilePath: string,
  appDir: string,
  appName: string
): Promise<ApplicationDefinition> {
  try {
    logger.debug({ appFilePath }, 'Parsing Aura application file');
    const markup = await readFile(appFilePath, 'utf-8');
    
    // Check for aura:application root element
    if (!markup.includes('<aura:application') && !markup.includes('aura:application')) {
      throw new AuraStructureError('Missing aura:application root element', appFilePath);
    }

    const $ = cheerio.load(markup, { 
      xmlMode: true,
      xml: {
        normalizeWhitespace: false,
      },
    } as any);

    // Find root element
    let $root = $('*').filter((_, el: any) => {
      const tagName = el.tagName?.toLowerCase() || el.name?.toLowerCase() || '';
      return tagName === 'application' || tagName.includes('application');
    });

    if ($root.length === 0) {
      const firstEl = $('*').first();
      if (firstEl.length > 0) {
        const tagName = (firstEl[0] as any)?.tagName?.toLowerCase() || '';
        if (tagName === 'application' || tagName.includes('application')) {
          $root = firstEl;
        }
      }
    }

    if ($root.length === 0) {
      throw new AuraStructureError('Missing aura:application root element', appFilePath);
    }

    // Extract application-level attributes
    const rootAttribs = ($root[0] as any)?.attribs || {};
    const extendsAttr = rootAttribs.extends || rootAttribs['extends'] || '';

    // Extract extends definition
    const extendsDef: ApplicationExtendsDefinition | undefined = extendsAttr
      ? {
          extends: extendsAttr,
        }
      : undefined;

    // Extract component dependencies (aura:dependency)
    const componentDependencies: ApplicationDependencyDefinition[] = [];
    $('*').each((_, element: any) => {
      const tagName = (element.tagName?.toLowerCase() || element.name?.toLowerCase() || '').replace(/^aura:/, '');
      if (tagName === 'dependency' || tagName.includes('dependency')) {
        const $dep = $(element);
        const resource = $dep.attr('resource') || '';
        if (resource) {
          // Extract component name from resource (c:ComponentName -> ComponentName)
          const componentName = resource.replace(/^c:/, '').replace(/^.*:/, '');
          componentDependencies.push({
            componentName,
            resource,
          });
        }
      }
    });

    // Parse metadata if available
    const metaFilePath = join(appDir, `${appName}.app-meta.xml`);
    const metadata: ApplicationMetadata = {
      name: appName,
      ...(await parseAuraApplicationMetadata(metaFilePath)),
    };

    const result: ApplicationDefinition = {
      metadata,
      type: 'Application',
      extends: extendsDef,
      componentDependencies: componentDependencies.length > 0 ? componentDependencies : undefined,
    };

    logger.debug({ 
      appFilePath, 
      appName,
      extends: extendsDef?.extends,
      dependencies: componentDependencies.length,
    }, 'Aura application parsed successfully');
    
    return result;
  } catch (error) {
    if (error instanceof AuraStructureError || error instanceof AuraMarkupParseError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ appFilePath, error: errorMessage }, 'Failed to parse Aura application file');
    throw new AuraMarkupParseError(appFilePath, error instanceof Error ? error : undefined);
  }
}

