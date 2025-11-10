/**
 * Component markup parser for Aura .cmp files using cheerio
 */

import * as cheerio from 'cheerio';
import { readFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import { AuraMarkupParseError, AuraStructureError } from '../utils/aura-errors.js';
import type {
  ComponentMarkupDefinition,
  AttributeDefinition,
  HandlerDefinition,
  ComponentReferenceDefinition,
  BindingDefinition,
  ConditionalRenderingDefinition,
  EventDefinition,
  HTMLElementDefinition,
  ComponentAccessLevel,
} from '../types/aura-parsed.js';


/**
 * Extracts attribute definitions from .cmp file
 */
function extractAttributes($: cheerio.CheerioAPI): AttributeDefinition[] {
  const attributes: AttributeDefinition[] = [];

  // Try different selector approaches for namespaced elements
  $('*').each((_, element: any) => {
    // Remove namespace prefix if present
    const tagName = (element.tagName?.toLowerCase() || element.name?.toLowerCase() || '').replace(/^aura:/, '');
    if (tagName !== 'attribute' && !tagName.includes('attribute')) {
      return;
    }
    const $attr = $(element);
    const name = $attr.attr('name') || '';
    const type = $attr.attr('type') || '';
    const access = ($attr.attr('access') || 'private') as ComponentAccessLevel;
    const defaultValue = $attr.attr('default');
    const required = $attr.attr('required') === 'true';
    const description = $attr.attr('description') || $attr.text().trim();

    if (name) {
      attributes.push({
        name,
        type,
        access,
        defaultValue: defaultValue !== undefined ? defaultValue : undefined,
        required,
        description: description || undefined,
      });
    }
  });

  return attributes;
}

/**
 * Extracts handler definitions from .cmp file
 */
function extractHandlers($: cheerio.CheerioAPI): HandlerDefinition[] {
  const handlers: HandlerDefinition[] = [];

  $('*').each((_, element: any) => {
    // Check both tagName and name properties, and handle namespace prefixes
    const tagName = (element.tagName?.toLowerCase() || element.name?.toLowerCase() || '').replace(/^aura:/, '');
    if (tagName !== 'handler' && !tagName.includes('handler')) {
      return;
    }
    const $handler = $(element);
    const name = $handler.attr('name') || '';
    const eventType = $handler.attr('event') || '';
    const action = $handler.attr('action') || '';
    const value = $handler.attr('value');

    // Handler needs at least name and action (eventType might be optional in some cases)
    if (name && action) {
      const handler: HandlerDefinition = {
        name,
        eventType: eventType || name, // Use name as fallback if eventType not specified
        action: action.replace(/[{}!]/g, '').trim(), // Remove {!c.} prefix
        parameters: value ? { value } : undefined,
      };

      handlers.push(handler);
    }
  });

  return handlers;
}

/**
 * Extracts component references from .cmp file
 */
function extractComponentReferences($: cheerio.CheerioAPI): ComponentReferenceDefinition[] {
  const references: ComponentReferenceDefinition[] = [];

  // Extract custom Aura components (<c:ComponentName>)
  $('[class*="c:"]').each((_, element: any) => {
    const tagName = element.tagName?.toLowerCase() || '';
    
    if (tagName.startsWith('c:')) {
      const componentName = tagName.replace('c:', '');
      const attributes: Record<string, string> = {};
      const bindings: BindingDefinition[] = [];

      // Extract attributes
      const attribs = (element as any).attribs || {};
      Object.keys(attribs).forEach((attr) => {
        const value = attribs[attr];
        attributes[attr] = value;

        // Check if attribute value is a binding
        if (value && (value.includes('{!') || value.includes('{!v.'))) {
          bindings.push({
            syntax: value,
            attributePath: value.replace(/[{}!]/g, '').trim(),
            location: attr,
          });
        }
      });

      references.push({
        componentName,
        namespace: 'c:',
        attributes,
        bindings,
        isCustomAuraComponent: true,
        isStandardLightningComponent: false,
      });
    }
  });

  // Extract standard Lightning components (<lightning:*, <ui:*)
  $('[class*="lightning:"]').each((_, element: any) => {
    const tagName = element.tagName?.toLowerCase() || '';
    
    if (tagName.startsWith('lightning:') || tagName.startsWith('ui:')) {
      const componentName = tagName;
      const attributes: Record<string, string> = {};
      const bindings: BindingDefinition[] = [];

      const attribs = (element as any).attribs || {};
      Object.keys(attribs).forEach((attr) => {
        const value = attribs[attr];
        attributes[attr] = value;

        if (value && (value.includes('{!') || value.includes('{!v.'))) {
          bindings.push({
            syntax: value,
            attributePath: value.replace(/[{}!]/g, '').trim(),
            location: attr,
          });
        }
      });

      references.push({
        componentName,
        namespace: tagName.split(':')[0] + ':',
        attributes,
        bindings,
        isCustomAuraComponent: false,
        isStandardLightningComponent: true,
      });
    }
  });

  // Also check for <c:ComponentName> pattern in tag names
  $('*').each((_, element: any) => {
    const tagName = element.tagName?.toLowerCase() || '';
    if (tagName.includes(':')) {
      const [namespace, compName] = tagName.split(':');
      if (namespace === 'c' && compName) {
        // Check if we already added this
        const exists = references.some(r => r.componentName === compName && r.namespace === 'c:');
        if (!exists) {
          const attributes: Record<string, string> = {};
          const attribs = (element as any).attribs || {};
          Object.keys(attribs).forEach((attr) => {
            attributes[attr] = attribs[attr];
          });

          references.push({
            componentName: compName,
            namespace: 'c:',
            attributes,
            bindings: [],
            isCustomAuraComponent: true,
            isStandardLightningComponent: false,
          });
        }
      }
    }
  });

  return references;
}

/**
 * Extracts data bindings from .cmp file
 */
function extractBindings($: cheerio.CheerioAPI): BindingDefinition[] {
  const bindings: BindingDefinition[] = [];
  const htmlContent = $.html();

  // Match {!v.attribute} or {!expression} patterns
  const bindingRegex = /\{!([^}]+)\}/g;
  let match;
  while ((match = bindingRegex.exec(htmlContent)) !== null) {
    const expression = match[1];
    const attributePath = expression.trim();
    
    bindings.push({
      syntax: match[0], // Full binding syntax {!v.attribute}
      attributePath,
      expression: attributePath,
    });
  }

  return bindings;
}

/**
 * Extracts conditional rendering directives from .cmp file
 */
function extractConditionalRendering($: cheerio.CheerioAPI): ConditionalRenderingDefinition[] {
  const conditionals: ConditionalRenderingDefinition[] = [];

  // Extract aura:if and aura:iteration directives
  $('*').each((_, element: any) => {
    // Remove namespace prefix if present
    const tagName = (element.tagName?.toLowerCase() || element.name?.toLowerCase() || '').replace(/^aura:/, '');
    const $el = $(element);
    
    if (tagName === 'if' || tagName.includes('if')) {
      const isTrue = $el.attr('isTrue');
      if (isTrue) {
        conditionals.push({
          type: 'if',
          condition: isTrue.replace(/[{}!]/g, '').trim(),
        });
      }
    } else if (tagName === 'iteration' || tagName.includes('iteration')) {
      const items = $el.attr('items');
      const varName = $el.attr('var') || $el.attr('varName');
      const indexVar = $el.attr('indexVar');

      if (items) {
        conditionals.push({
          type: 'iteration',
          iterationItems: items.replace(/[{}!]/g, '').trim(),
          iterationVariable: varName || indexVar || undefined,
        });
      }
    }
  });

  return conditionals;
}

/**
 * Extracts event definitions from .cmp file
 */
function extractEvents($: cheerio.CheerioAPI): EventDefinition[] {
  const events: EventDefinition[] = [];

  $('*').each((_, element: any) => {
    // Remove namespace prefix if present
    const tagName = (element.tagName?.toLowerCase() || element.name?.toLowerCase() || '').replace(/^aura:/, '');
    if (tagName !== 'registerevent' && !tagName.includes('registerevent')) {
      return;
    }
    const $event = $(element);
    const name = $event.attr('name') || '';
    const type = $event.attr('type') || '';

    if (name) {
      events.push({
        name,
        type,
        registrationLocation: 'markup',
      });
    }
  });

  return events;
}

/**
 * Extracts standard HTML elements from .cmp file
 */
function extractHTMLElements($: cheerio.CheerioAPI): HTMLElementDefinition[] {
  const htmlElements: HTMLElementDefinition[] = [];

  // Standard HTML tags (not Aura-specific)
  const standardHTMLTags = ['div', 'span', 'p', 'input', 'button', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'label', 'select', 'textarea', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  standardHTMLTags.forEach((tag) => {
    $(tag).each((_, element: any) => {
      const attributes: Record<string, string> = {};
      const dataAttributes: Record<string, string> = {};
      const ariaAttributes: Record<string, string> = {};

      const attribs = (element as any).attribs || {};
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

      const htmlEl: HTMLElementDefinition = {
        tagName: tag,
        attributes,
      };

      if (Object.keys(dataAttributes).length > 0) {
        htmlEl.dataAttributes = dataAttributes;
      }
      if (Object.keys(ariaAttributes).length > 0) {
        htmlEl.ariaAttributes = ariaAttributes;
      }

      htmlElements.push(htmlEl);
    });
  });

  return htmlElements;
}

/**
 * Extracts Lightning Design System classes from .cmp file
 */
function extractSLDSClasses($: cheerio.CheerioAPI): string[] {
  const classes: string[] = [];
  const htmlContent = $.html();

  // Match slds-* classes
  const sldsRegex = /slds-[\w-]+/g;
  let match;
  while ((match = sldsRegex.exec(htmlContent)) !== null) {
    if (!classes.includes(match[0])) {
      classes.push(match[0]);
    }
  }

  return classes;
}

/**
 * Parses a .cmp markup file and extracts component structure
 */
export async function parseAuraMarkup(filePath: string): Promise<ComponentMarkupDefinition> {
  try {
    logger.debug({ filePath }, 'Parsing Aura markup file');
    const markup = await readFile(filePath, 'utf-8');
    
    // Check for aura:component root element before parsing
    if (!markup.includes('<aura:component') && !markup.includes('aura:component')) {
      throw new AuraStructureError('Missing aura:component root element', filePath);
    }

    // Load with xmlMode and handle namespaces
    const $ = cheerio.load(markup, { 
      xmlMode: true,
    } as any);

    // Find root element - try different approaches
    let $root = $('*').filter((_, el: any) => {
      const tagName = el.tagName?.toLowerCase() || '';
      return tagName === 'component' || tagName.includes('component');
    });

    // If that doesn't work, try finding by checking the first element
    if ($root.length === 0) {
      const firstEl = $('*').first();
      if (firstEl.length > 0) {
        const tagName = (firstEl[0] as any)?.tagName?.toLowerCase() || '';
        if (tagName === 'component' || tagName.includes('component')) {
          $root = firstEl;
        }
      }
    }

    // Last resort: check if markup contains aura:component
    if ($root.length === 0) {
      // Try to find any element and check its name
      const allElements = $('*');
      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i] as any;
        const name = el.name || el.tagName?.toLowerCase() || '';
        if (name === 'component' || (name.includes('component') && markup.includes('aura:component'))) {
          $root = $(el);
          break;
        }
      }
    }

    if ($root.length === 0) {
      throw new AuraStructureError('Missing aura:component root element', filePath);
    }

    // Extract component-level attributes
    // Get attributes from the root element
    const rootAttribs = ($root[0] as any)?.attribs || {};
    const implementsAttr = rootAttribs.implements || rootAttribs['implements'] || '';
    const implementsList = implementsAttr ? implementsAttr.split(',').map((i: string) => i.trim()) : [];
    const accessLevel = (rootAttribs.access || rootAttribs['access'] || 'public') as ComponentAccessLevel;
    const controller = rootAttribs.controller || rootAttribs['controller'];
    const description = rootAttribs.description || rootAttribs['description'];

    // Extract all component details
    const attributes = extractAttributes($ as any);
    const handlers = extractHandlers($ as any);
    const componentReferences = extractComponentReferences($ as any);
    const bindings = extractBindings($ as any);
    const conditionalRendering = extractConditionalRendering($ as any);
    const events = extractEvents($ as any);
    const htmlElements = extractHTMLElements($ as any);
    const sldsClasses = extractSLDSClasses($ as any);

    const result: ComponentMarkupDefinition = {
      attributes,
      handlers,
      implements: implementsList,
      accessLevel,
      componentReferences,
      bindings,
      conditionalRendering,
      events,
      htmlElements: htmlElements.length > 0 ? htmlElements : undefined,
      sldsClasses: sldsClasses.length > 0 ? sldsClasses : undefined,
      controller,
      description,
    };

    logger.debug({ 
      filePath, 
      attributes: attributes.length, 
      handlers: handlers.length, 
      componentReferences: componentReferences.length,
      bindings: bindings.length,
    }, 'Aura markup file parsed successfully');
    
    return result;
  } catch (error) {
    if (error instanceof AuraStructureError || error instanceof AuraMarkupParseError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ filePath, error: errorMessage }, 'Failed to parse Aura markup file');
    throw new AuraMarkupParseError(filePath, error instanceof Error ? error : undefined);
  }
}

