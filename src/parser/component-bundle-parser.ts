/**
 * Component bundle parser - parses LWC components as bundles (.js, .html, .css together)
 */

import { basename, join } from 'path';
import { existsSync } from 'fs';
import { logger } from '../utils/logger.js';
import { parseJavaScriptFile } from './javascript-parser.js';
import { parseHTMLTemplate } from './html-parser.js';
import { parseCSSFile } from './css-parser.js';
import { parseComponentMetadata } from './lwc-metadata-parser.js';
import type { LWCComponentDefinition, ComponentMetadata } from '../types/lwc-parsed.js';

/**
 * Parses a component bundle (directory containing .js, .html, .css files)
 */
export async function parseComponentBundle(componentDir: string): Promise<LWCComponentDefinition> {
  try {
    logger.debug({ componentDir }, 'Parsing component bundle');

    // Extract component name from directory structure
    // lwc/ComponentName/ -> ComponentName
    const componentName = basename(componentDir);
    
    // Parse metadata from .js-meta.xml if present
    const metaData = await parseComponentMetadata(componentDir, componentName);
    
    const metadata: ComponentMetadata = {
      name: componentName,
      ...metaData,
    };

    const result: LWCComponentDefinition = {
      metadata,
      dependencies: [],
    };

    // Parse JavaScript file
    const jsFile = join(componentDir, `${componentName}.js`);
    if (existsSync(jsFile)) {
      result.javascript = await parseJavaScriptFile(jsFile);
      
      // Extract dependencies from imports
      if (result.javascript.imports && Array.isArray(result.javascript.imports)) {
        result.dependencies = result.javascript.imports
          .filter(imp => imp.isLWCImport)
          .map(imp => imp.source.replace('c/', ''));
      }
    }

    // Parse HTML template file
    const htmlFile = join(componentDir, `${componentName}.html`);
    if (existsSync(htmlFile)) {
      result.html = await parseHTMLTemplate(htmlFile);
      
      // Extract LWC component dependencies from HTML
      if (result.html.elements) {
        const lwcDeps = result.html.elements
          .filter(el => el.isLWCComponent)
          .map(el => el.tagName.replace('c-', ''));
        
        // Merge with existing dependencies
        const existingDeps = result.dependencies || [];
        result.dependencies = [...new Set([...existingDeps, ...lwcDeps])];
      }
    }

    // Parse CSS file (optional)
    const cssFile = join(componentDir, `${componentName}.css`);
    if (existsSync(cssFile)) {
      result.css = await parseCSSFile(cssFile);
    }

    logger.debug({ componentDir, componentName, hasJS: !!result.javascript, hasHTML: !!result.html, hasCSS: !!result.css }, 'Component bundle parsed successfully');
    return result;
  } catch (error) {
    logger.error({ componentDir, error }, 'Failed to parse component bundle');
    throw error;
  }
}

/**
 * Discovers component bundles in a directory
 */
export function discoverComponentBundles(_lwcDir: string): string[] {
  // This would be integrated with file scanner
  // For now, returns empty array - will be implemented with scanner integration
  return [];
}

