/**
 * Aura component bundle parser - parses Aura components as bundles (all files together)
 */

import { basename, join } from 'path';
import { existsSync } from 'fs';
import { logger } from '../utils/logger.js';
import { parseAuraMarkup } from './aura-markup-parser.js';
import { parseControllerJavaScriptFile } from './aura-controller-parser.js';
import { parseHelperJavaScriptFile } from './aura-helper-parser.js';
import { parseRendererJavaScriptFile } from './aura-renderer-parser.js';
import { parseAuraCSSFile } from './aura-css-parser.js';
import { parseAuraComponentMetadata } from './aura-metadata-parser.js';
import type { AuraComponentDefinition, ComponentMetadata } from '../types/aura-parsed.js';

/**
 * Parses an Aura component bundle (directory containing all component files)
 */
export async function parseAuraComponentBundle(componentDir: string): Promise<AuraComponentDefinition> {
  try {
    logger.debug({ componentDir }, 'Parsing Aura component bundle');

    // Extract component name from directory structure
    // aura/ComponentName/ -> ComponentName
    const componentName = basename(componentDir);
    
    // Parse metadata from .cmp-meta.xml if present
    const metaFilePath = join(componentDir, `${componentName}.cmp-meta.xml`);
    const metaData = await parseAuraComponentMetadata(metaFilePath).catch(() => ({}));
    
    const metadata: ComponentMetadata = {
      name: componentName,
      ...metaData,
    };

    const result: AuraComponentDefinition = {
      metadata,
      type: 'Component',
      dependencies: [],
    };

    // Parse .cmp markup file (required)
    const cmpFile = join(componentDir, `${componentName}.cmp`);
    if (existsSync(cmpFile)) {
      result.markup = await parseAuraMarkup(cmpFile);
      
      // Extract component dependencies from markup
      if (result.markup.componentReferences) {
        const auraDeps = result.markup.componentReferences
          .filter(ref => ref.isCustomAuraComponent)
          .map(ref => ref.componentName);
        
        result.dependencies = [...new Set([...(result.dependencies || []), ...auraDeps])];
      }
    } else {
      logger.warn({ componentDir, componentName }, 'No .cmp file found for component bundle');
    }

    // Parse Controller.js file (optional)
    const controllerFile = join(componentDir, `${componentName}Controller.js`);
    if (existsSync(controllerFile)) {
      result.controller = await parseControllerJavaScriptFile(controllerFile);
    }

    // Parse Helper.js file (optional)
    const helperFile = join(componentDir, `${componentName}Helper.js`);
    if (existsSync(helperFile)) {
      result.helper = await parseHelperJavaScriptFile(helperFile);
    }

    // Parse Renderer.js file (optional)
    const rendererFile = join(componentDir, `${componentName}Renderer.js`);
    if (existsSync(rendererFile)) {
      result.renderer = await parseRendererJavaScriptFile(rendererFile);
    }

    // Parse CSS file (optional)
    const cssFile = join(componentDir, `${componentName}.css`);
    if (existsSync(cssFile)) {
      result.css = await parseAuraCSSFile(cssFile);
    }

    logger.debug({ 
      componentDir, 
      componentName, 
      hasMarkup: !!result.markup,
      hasController: !!result.controller, 
      hasHelper: !!result.helper,
      hasRenderer: !!result.renderer,
      hasCSS: !!result.css,
    }, 'Aura component bundle parsed successfully');
    
    return result;
  } catch (error) {
    logger.error({ componentDir, error }, 'Failed to parse Aura component bundle');
    throw error;
  }
}

/**
 * Discovers Aura component bundles in a directory
 */
export function discoverAuraComponentBundles(_auraDir: string): string[] {
  // This will be integrated with file scanner
  // For now, returns empty array - will be implemented with scanner integration
  return [];
}

