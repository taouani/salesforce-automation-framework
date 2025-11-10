/**
 * CSS file parser for LWC components using postcss
 */

import postcss from 'postcss';
import { readFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import { CSSParseError } from '../utils/lwc-errors.js';
import type {
  CSSDefinition,
  SelectorDefinition,
  MediaQueryDefinition,
  KeyframeDefinition,
} from '../types/lwc-parsed.js';

/**
 * Properties that affect element visibility/interaction for test generation
 */
const TEST_RELEVANT_PROPERTIES = ['display', 'visibility', 'opacity', 'pointer-events'];

/**
 * Parses a CSS file and extracts styling structure
 */
export async function parseCSSFile(filePath: string): Promise<CSSDefinition> {
  try {
    logger.debug({ filePath }, 'Parsing CSS file');
    const css = await readFile(filePath, 'utf-8');
    const root = postcss.parse(css);

    const result: CSSDefinition = {
      customProperties: {},
      selectors: [],
      mediaQueries: [],
      keyframes: [],
      stylingForTestGeneration: {},
    };

    root.walk((node) => {
      // Extract CSS custom properties (variables)
      if (node.type === 'decl' && node.prop.startsWith('--')) {
        result.customProperties[node.prop] = node.value;
      }

      // Extract keyframe animations
      if (node.type === 'atrule' && node.name === 'keyframes') {
        const keyframe: KeyframeDefinition = {
          name: node.params,
          keyframes: {},
        };
        
        node.walkRules((rule) => {
          const selector = rule.selector;
          const properties: Record<string, string> = {};
          rule.walkDecls((decl) => {
            properties[decl.prop] = decl.value;
          });
          keyframe.keyframes[selector] = properties;
        });
        
        result.keyframes.push(keyframe);
      }

      // Extract media queries
      if (node.type === 'atrule' && node.name === 'media') {
        const mediaQuery: MediaQueryDefinition = {
          condition: node.params,
          selectors: [],
        };

        node.walkRules((rule) => {
          const selector = extractSelectorFromRule(rule);
          if (selector) {
            mediaQuery.selectors.push(selector);
          }
        });

        result.mediaQueries.push(mediaQuery);
      }

      // Extract regular selectors
      if (node.type === 'rule') {
        const selector = extractSelectorFromRule(node);
        if (selector) {
          result.selectors.push(selector);
        }
      }
    });

    // Extract styling information for test generation
    result.selectors.forEach((sel) => {
      Object.keys(sel.properties).forEach((prop) => {
        if (TEST_RELEVANT_PROPERTIES.includes(prop)) {
          result.stylingForTestGeneration![`${sel.selector}:${prop}`] = sel.properties[prop];
        }
      });
    });

    logger.debug({ filePath, selectors: result.selectors.length, customProperties: Object.keys(result.customProperties).length }, 'CSS file parsed successfully');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn({ filePath, error: errorMessage }, 'Failed to parse CSS file');
    throw new CSSParseError(filePath, error instanceof Error ? error : undefined);
  }
}

/**
 * Extracts selector definition from PostCSS rule
 */
function extractSelectorFromRule(rule: postcss.Rule): SelectorDefinition | null {
  const selector = rule.selector;
  const properties: Record<string, string> = {};
  const pseudoClasses: string[] = [];
  const pseudoElements: string[] = [];

  // Extract pseudo-classes and pseudo-elements
  const pseudoMatch = selector.match(/:([a-z-]+)|::([a-z-]+)/g);
  if (pseudoMatch) {
    pseudoMatch.forEach((pseudo) => {
      if (pseudo.startsWith('::')) {
        pseudoElements.push(pseudo.substring(2));
      } else {
        pseudoClasses.push(pseudo.substring(1));
      }
    });
  }

  // Extract properties
  rule.walkDecls((decl) => {
    properties[decl.prop] = decl.value;
  });

  return {
    selector,
    properties,
    pseudoClasses: pseudoClasses.length > 0 ? pseudoClasses : undefined,
    pseudoElements: pseudoElements.length > 0 ? pseudoElements : undefined,
  };
}

