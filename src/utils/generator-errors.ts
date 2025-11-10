/**
 * Custom error types for code generator
 */

import { ScannerError } from './errors.js';

/**
 * Base error class for generator errors
 */
export class GeneratorError extends ScannerError {
  constructor(
    message: string,
    public readonly filePath?: string,
    public readonly cause?: Error
  ) {
    super(message, filePath, cause);
    this.name = 'GeneratorError';
  }
}

/**
 * Error thrown when a file cannot be written
 */
export class FileWriteError extends GeneratorError {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to write file: ${filePath}`, filePath, cause);
    this.name = 'FileWriteError';
  }
}

/**
 * Error thrown when template rendering fails
 */
export class TemplateRenderError extends GeneratorError {
  constructor(template: string, cause?: Error) {
    super(`Failed to render template: ${template}`, undefined, cause);
    this.name = 'TemplateRenderError';
  }
}

