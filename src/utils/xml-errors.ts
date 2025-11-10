/**
 * XML parsing error types
 */

import { ScannerError } from './errors.js';

/**
 * Error thrown when XML parsing fails
 */
export class XMLParseError extends ScannerError {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to parse XML file: ${filePath}`, filePath, cause);
    this.name = 'XMLParseError';
  }
}

/**
 * Error thrown when XML structure is invalid or unexpected
 */
export class XMLStructureError extends ScannerError {
  constructor(message: string, filePath?: string) {
    super(`Invalid XML structure: ${message}`, filePath);
    this.name = 'XMLStructureError';
  }
}

