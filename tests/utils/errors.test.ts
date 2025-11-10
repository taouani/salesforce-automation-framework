/**
 * Tests for error handling utilities
 */

import { describe, it, expect } from 'vitest';
import {
  ScannerError,
  FileReadError,
  DirectoryAccessError,
  PathValidationError,
  ErrorCollection,
} from '../../src/utils/errors.js';

describe('ScannerError', () => {
  it('should create a ScannerError with message', () => {
    const error = new ScannerError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('ScannerError');
  });

  it('should create a ScannerError with file path', () => {
    const error = new ScannerError('Test error', '/path/to/file');
    expect(error.filePath).toBe('/path/to/file');
  });

  it('should create a ScannerError with cause', () => {
    const cause = new Error('Original error');
    const error = new ScannerError('Test error', undefined, cause);
    expect(error.cause).toBe(cause);
  });
});

describe('FileReadError', () => {
  it('should create a FileReadError', () => {
    const error = new FileReadError('/path/to/file');
    expect(error.message).toContain('Failed to read file');
    expect(error.filePath).toBe('/path/to/file');
    expect(error.name).toBe('FileReadError');
  });

  it('should include cause error', () => {
    const cause = new Error('Permission denied');
    const error = new FileReadError('/path/to/file', cause);
    expect(error.cause).toBe(cause);
  });
});

describe('DirectoryAccessError', () => {
  it('should create a DirectoryAccessError', () => {
    const error = new DirectoryAccessError('/path/to/dir');
    expect(error.message).toContain('Failed to access directory');
    expect(error.filePath).toBe('/path/to/dir');
    expect(error.name).toBe('DirectoryAccessError');
  });
});

describe('PathValidationError', () => {
  it('should create a PathValidationError', () => {
    const error = new PathValidationError('Invalid path', '/invalid/path');
    expect(error.message).toBe('Invalid path');
    expect(error.filePath).toBe('/invalid/path');
    expect(error.name).toBe('PathValidationError');
  });
});

describe('ErrorCollection', () => {
  it('should add and retrieve errors', () => {
    const collection = new ErrorCollection();
    const error1 = new ScannerError('Error 1');
    const error2 = new ScannerError('Error 2');

    collection.add(error1);
    collection.add(error2);

    expect(collection.getCount()).toBe(2);
    expect(collection.getAll()).toHaveLength(2);
    expect(collection.hasErrors()).toBe(true);
  });

  it('should report no errors when empty', () => {
    const collection = new ErrorCollection();
    expect(collection.hasErrors()).toBe(false);
    expect(collection.getCount()).toBe(0);
  });

  it('should clear all errors', () => {
    const collection = new ErrorCollection();
    collection.add(new ScannerError('Error 1'));
    collection.clear();

    expect(collection.hasErrors()).toBe(false);
    expect(collection.getCount()).toBe(0);
  });
});

