/**
 * Custom error types for test generation
 */

import { GeneratorError } from './generator-errors.js';

/**
 * Base error class for test generation errors
 */
export class TestGenerationError extends GeneratorError {
  constructor(
    message: string,
    public readonly filePath?: string,
    public readonly cause?: Error
  ) {
    super(message, filePath, cause);
    this.name = 'TestGenerationError';
  }
}

/**
 * Error thrown when test data generation fails
 */
export class TestDataGenerationError extends TestGenerationError {
  constructor(
    message: string,
    public readonly apiType?: 'REST' | 'Tooling',
    public readonly cause?: Error
  ) {
    super(`Test data generation failed: ${message}`, undefined, cause);
    this.name = 'TestDataGenerationError';
  }
}

/**
 * Error thrown when template rendering fails for test generation
 */
export class TestTemplateError extends TestGenerationError {
  constructor(template: string, cause?: Error) {
    super(`Failed to render test template: ${template}`, undefined, cause);
    this.name = 'TestTemplateError';
  }
}

/**
 * Error thrown when metadata is missing or invalid for test generation
 */
export class TestMetadataError extends TestGenerationError {
  constructor(
    message: string,
    public readonly metadataType?: string,
    public readonly cause?: Error
  ) {
    super(`Test generation metadata error: ${message}`, undefined, cause);
    this.name = 'TestMetadataError';
  }
}

