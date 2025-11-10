/**
 * LWC parsing error types
 */

import { ScannerError } from './errors.js';

/**
 * Error thrown when JavaScript parsing fails
 */
export class JavaScriptParseError extends ScannerError {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to parse JavaScript file: ${filePath}`, filePath, cause);
    this.name = 'JavaScriptParseError';
  }
}

/**
 * Error thrown when HTML template parsing fails
 */
export class HTMLParseError extends ScannerError {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to parse HTML template file: ${filePath}`, filePath, cause);
    this.name = 'HTMLParseError';
  }
}

/**
 * Error thrown when CSS parsing fails
 */
export class CSSParseError extends ScannerError {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to parse CSS file: ${filePath}`, filePath, cause);
    this.name = 'CSSParseError';
  }
}

