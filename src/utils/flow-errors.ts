/**
 * Flow parsing error types
 */

import { ScannerError } from './errors.js';

/**
 * Error thrown when Flow parsing fails
 */
export class FlowParseError extends ScannerError {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to parse Flow file: ${filePath}`, filePath, cause);
    this.name = 'FlowParseError';
  }
}

/**
 * Error thrown when Flow XML structure is invalid
 */
export class FlowStructureError extends FlowParseError {
  constructor(message: string, filePath?: string, cause?: Error) {
    super(filePath || '', cause);
    this.name = 'FlowStructureError';
    this.message = `Invalid Flow XML structure: ${message}`;
  }
}

