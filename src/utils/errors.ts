/**
 * Custom error types for the scanner
 */

/**
 * Base error class for scanner errors
 */
export class ScannerError extends Error {
  constructor(
    message: string,
    public readonly filePath?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ScannerError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a file cannot be read
 */
export class FileReadError extends ScannerError {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to read file: ${filePath}`, filePath, cause);
    this.name = 'FileReadError';
  }
}

/**
 * Error thrown when a directory cannot be accessed
 */
export class DirectoryAccessError extends ScannerError {
  constructor(directoryPath: string, cause?: Error) {
    super(`Failed to access directory: ${directoryPath}`, directoryPath, cause);
    this.name = 'DirectoryAccessError';
  }
}

/**
 * Error thrown when path validation fails
 */
export class PathValidationError extends ScannerError {
  constructor(message: string, path?: string) {
    super(message, path);
    this.name = 'PathValidationError';
  }
}

/**
 * Error collection for tracking multiple errors during scanning
 */
export class ErrorCollection {
  private errors: ScannerError[] = [];

  add(error: ScannerError): void {
    this.errors.push(error);
  }

  getAll(): ScannerError[] {
    return [...this.errors];
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  clear(): void {
    this.errors = [];
  }

  getCount(): number {
    return this.errors.length;
  }
}

