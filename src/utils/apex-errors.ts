/**
 * Apex parsing error types
 */

import { ScannerError } from './errors.js';

/**
 * Error thrown when Apex parsing fails
 */
export class ApexParseError extends ScannerError {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to parse Apex file: ${filePath}`, filePath, cause);
    this.name = 'ApexParseError';
  }
}

/**
 * Error thrown when Apex class parsing fails
 */
export class ApexClassParseError extends ApexParseError {
  constructor(filePath: string, cause?: Error) {
    super(filePath, cause);
    this.name = 'ApexClassParseError';
    this.message = `Failed to parse Apex class file: ${filePath}`;
  }
}

/**
 * Error thrown when Apex trigger parsing fails
 */
export class ApexTriggerParseError extends ApexParseError {
  constructor(filePath: string, cause?: Error) {
    super(filePath, cause);
    this.name = 'ApexTriggerParseError';
    this.message = `Failed to parse Apex trigger file: ${filePath}`;
  }
}

/**
 * Error thrown when SOQL parsing fails
 */
export class SOQLParseError extends ApexParseError {
  constructor(message: string, filePath?: string, cause?: Error) {
    super(filePath || '', cause);
    this.name = 'SOQLParseError';
    this.message = `Failed to parse SOQL query: ${message}`;
  }
}

/**
 * Error thrown when DML parsing fails
 */
export class DMLParseError extends ApexParseError {
  constructor(message: string, filePath?: string, cause?: Error) {
    super(filePath || '', cause);
    this.name = 'DMLParseError';
    this.message = `Failed to parse DML operation: ${message}`;
  }
}

