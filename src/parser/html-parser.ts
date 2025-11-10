/**
 * HTML template parser for LWC components using cheerio
 */

import * as cheerio from 'cheerio';
import { readFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import { HTMLParseError } from '../utils/lwc-errors.js';
import type {
  HTMLTemplateDefinition,
  ElementDefinition,
} from '../types/lwc-parsed.js';

/**
 * Parses an HTML template file and extracts component structure
 */
export async function parseHTMLTemplate(filePath: string): Promise<HTMLTemplateDefinition> {
  try {
    logger.debug({ filePath }, 'Parsing HTML template file');
    const html = await readFile(filePath, 'utf-8');
    const $ = cheerio.load(html);

    const result: HTMLTemplateDefinition = {
      elements: [],
      bindings: [],
      directives: [],
      eventHandlers: [],
      templateReferences: [],
    };

    // Extract all elements
    $('*').each((_, element) => {
      if (!('tagName' in element) || !element.tagName) {
        return; // Skip text nodes
      }
      
      const tagName = element.tagName.toLowerCase();
      
      // Determine element type
      const isLightningComponent = tagName.startsWith('lightning-');
      const isLWCComponent = tagName.startsWith('c-');
      const isStandardHTML = !isLightningComponent && !isLWCComponent;

      // Extract attributes
      const attributes: Record<string, string> = {};
      const dataAttributes: Record<string, string> = {};
      const ariaAttributes: Record<string, string> = {};

      const attribs = 'attribs' in element ? element.attribs : {};
      Object.keys(attribs).forEach((attr) => {
        const value = attribs[attr];
        if (attr.startsWith('data-')) {
          dataAttributes[attr] = value;
        } else if (attr.startsWith('aria-')) {
          ariaAttributes[attr] = value;
        } else {
          attributes[attr] = value;
        }
      });

      const elementDef: ElementDefinition = {
        tagName,
        attributes,
        isLightningComponent,
        isLWCComponent,
        isStandardHTML,
      };

      if (Object.keys(dataAttributes).length > 0) {
        elementDef.dataAttributes = dataAttributes;
      }
      if (Object.keys(ariaAttributes).length > 0) {
        elementDef.ariaAttributes = ariaAttributes;
      }

      result.elements.push(elementDef);

      // Extract event handlers
      Object.keys(attributes).forEach((attr) => {
        if (attr.startsWith('on') && attr.length > 2) {
          const eventType = attr.substring(2).toLowerCase(); // onclick -> click
          const handler = attributes[attr];
          result.eventHandlers.push({
            name: eventType,
            type: 'custom',
            handler: handler.replace(/[{}]/g, '').trim(), // Remove { } from handler
          });
        }
      });
    });

    // Extract data bindings from text content and attributes
    const htmlContent = $.html();
    const bindingRegex = /\{([^}]+)\}/g;
    let match;
    while ((match = bindingRegex.exec(htmlContent)) !== null) {
      result.bindings.push({
        expression: match[1],
        target: 'text', // Could be improved to detect attribute vs text
      });
    }

    // Extract directives
    $('[if\\:true], [if\\:false], [lwc\\:if]').each((_, element) => {
      const $el = $(element);
      const ifTrue = $el.attr('if:true');
      const ifFalse = $el.attr('if:false');
      const lwcIf = $el.attr('lwc:if');

      if (ifTrue) {
        result.directives.push({
          type: 'if',
          condition: ifTrue,
        });
      } else if (ifFalse) {
        result.directives.push({
          type: 'if',
          condition: ifFalse,
        });
      } else if (lwcIf) {
        result.directives.push({
          type: 'if',
          condition: lwcIf,
        });
      }
    });

    $('[for\\:each], [for\\:item]').each((_, element) => {
      const $el = $(element);
      const forEach = $el.attr('for:each');
      const forItem = $el.attr('for:item');

      if (forEach && forItem) {
        result.directives.push({
          type: 'for',
          iterator: forEach,
          item: forItem,
        });
      }
    });

    // Extract template references (lwc:dom="manual")
    $('[lwc\\:dom="manual"]').each(() => {
      // Look for querySelector patterns in the component (would need JS parsing for full extraction)
      result.templateReferences?.push('manual-dom');
    });

    logger.debug({ filePath, elements: result.elements.length, bindings: result.bindings.length }, 'HTML template parsed successfully');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn({ filePath, error: errorMessage }, 'Failed to parse HTML template file');
    throw new HTMLParseError(filePath, error instanceof Error ? error : undefined);
  }
}

