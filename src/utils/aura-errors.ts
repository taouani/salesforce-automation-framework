/**
 * Aura parsing error types
 */

import { ScannerError } from './errors.js';

/**
 * Error thrown when Aura parsing fails
 */
export class AuraParseError extends ScannerError {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to parse Aura file: ${filePath}`, filePath, cause);
    this.name = 'AuraParseError';
  }
}

/**
 * Error thrown when Aura markup/XML structure is invalid
 */
export class AuraStructureError extends AuraParseError {
  constructor(message: string, filePath?: string, cause?: Error) {
    super(filePath || '', cause);
    this.name = 'AuraStructureError';
    this.message = `Invalid Aura structure: ${message}${filePath ? ` (${filePath})` : ''}`;
  }
}

/**
 * Error thrown when Aura JavaScript parsing fails
 */
export class AuraJavaScriptParseError extends AuraParseError {
  constructor(filePath: string, cause?: Error) {
    super(filePath, cause);
    this.name = 'AuraJavaScriptParseError';
    this.message = `Failed to parse Aura JavaScript file: ${filePath}`;
  }
}

/**
 * Error thrown when Aura markup parsing fails
 */
export class AuraMarkupParseError extends AuraParseError {
  constructor(filePath: string, cause?: Error) {
    super(filePath, cause);
    this.name = 'AuraMarkupParseError';
    this.message = `Failed to parse Aura markup file: ${filePath}`;
  }
}

/**
 * Error thrown when Aura CSS parsing fails
 */
export class AuraCSSParseError extends AuraParseError {
  constructor(filePath: string, cause?: Error) {
    super(filePath, cause);
    this.name = 'AuraCSSParseError';
    this.message = `Failed to parse Aura CSS file: ${filePath}`;
  }
}

