/**
 * Custom error types for Page Object Model generation
 */

import { GeneratorError } from './generator-errors.js';

/**
 * Base error class for page object generation errors
 */
export class PageObjectGenerationError extends GeneratorError {
  constructor(
    message: string,
    public readonly filePath?: string,
    public readonly cause?: Error
  ) {
    super(message, filePath, cause);
    this.name = 'PageObjectGenerationError';
  }
}

/**
 * Error thrown when locator generation fails
 */
export class LocatorGenerationError extends PageObjectGenerationError {
  constructor(
    message: string,
    public readonly fieldName?: string,
    public readonly locatorStrategy?: string,
    filePath?: string,
    cause?: Error
  ) {
    super(`Locator generation failed: ${message}`, filePath, cause);
    this.name = 'LocatorGenerationError';
  }
}

/**
 * Error thrown when template rendering fails
 */
export class PageObjectTemplateError extends PageObjectGenerationError {
  constructor(
    public readonly template: string,
    public readonly templateError?: string,
    cause?: Error
  ) {
    super(`Template rendering failed: ${template}`, undefined, cause);
    this.name = 'PageObjectTemplateError';
  }
}

/**
 * Error thrown when metadata is missing or invalid
 */
export class PageObjectMetadataError extends PageObjectGenerationError {
  constructor(
    message: string,
    public readonly metadataType?: string,
    public readonly metadataName?: string,
    filePath?: string,
    cause?: Error
  ) {
    super(`Metadata error: ${message}`, filePath, cause);
    this.name = 'PageObjectMetadataError';
  }
}

