/**
 * CSS parser for Aura components (reuses LWC CSS parser)
 */

import { parseCSSFile as parseLWCCSSFile } from './css-parser.js';
import type { CSSDefinition } from '../types/aura-parsed.js';

/**
 * Parses a CSS file for Aura components
 * Reuses the LWC CSS parser since CSS parsing is the same for both
 */
export async function parseAuraCSSFile(filePath: string): Promise<CSSDefinition> {
  // Reuse LWC CSS parser - CSS structure is the same for Aura and LWC
  return await parseLWCCSSFile(filePath);
}

