/**
 * Template engine wrapper for code generation
 */

import Handlebars from 'handlebars';
import { logger } from '../utils/logger.js';
import { TemplateRenderError } from '../utils/generator-errors.js';

/**
 * Renders a template with provided data
 */
export function renderTemplate(template: string, data: Record<string, unknown>): string {
  try {
    logger.debug({ templateLength: template.length }, 'Rendering template');
    const compiled = Handlebars.compile(template);
    const rendered = compiled(data);
    logger.debug({ renderedLength: rendered.length }, 'Template rendered successfully');
    return rendered;
  } catch (error) {
    logger.error({ template, error }, 'Failed to render template');
    throw new TemplateRenderError(template, error instanceof Error ? error : undefined);
  }
}

/**
 * Registers a Handlebars helper function
 */
export function registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
  Handlebars.registerHelper(name, helper);
}

