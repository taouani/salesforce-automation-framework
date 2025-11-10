/**
 * Tests for Aura parsing error handling
 */

import { describe, it, expect } from 'vitest';
import {
  AuraParseError,
  AuraStructureError,
  AuraJavaScriptParseError,
  AuraMarkupParseError,
  AuraCSSParseError,
} from '../../src/utils/aura-errors.js';
import { ErrorCollection } from '../../src/utils/errors.js';

describe('Aura Error Types', () => {
  it('should create AuraParseError with file path', () => {
    const error = new AuraParseError('/path/to/file.cmp');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AuraParseError');
    expect(error.message).toContain('Failed to parse Aura file');
    expect(error.filePath).toBe('/path/to/file.cmp');
  });

  it('should create AuraStructureError with message', () => {
    const error = new AuraStructureError('Missing aura:component element', '/path/to/file.cmp');
    expect(error).toBeInstanceOf(AuraParseError);
    expect(error.name).toBe('AuraStructureError');
    expect(error.message).toContain('Invalid Aura structure');
    expect(error.filePath).toBe('/path/to/file.cmp');
  });

  it('should create AuraJavaScriptParseError', () => {
    const error = new AuraJavaScriptParseError('/path/to/fileController.js');
    expect(error).toBeInstanceOf(AuraParseError);
    expect(error.name).toBe('AuraJavaScriptParseError');
    expect(error.message).toContain('Failed to parse Aura JavaScript file');
    expect(error.filePath).toBe('/path/to/fileController.js');
  });

  it('should create AuraMarkupParseError', () => {
    const error = new AuraMarkupParseError('/path/to/file.cmp');
    expect(error).toBeInstanceOf(AuraParseError);
    expect(error.name).toBe('AuraMarkupParseError');
    expect(error.message).toContain('Failed to parse Aura markup file');
    expect(error.filePath).toBe('/path/to/file.cmp');
  });

  it('should create AuraCSSParseError', () => {
    const error = new AuraCSSParseError('/path/to/file.css');
    expect(error).toBeInstanceOf(AuraParseError);
    expect(error.name).toBe('AuraCSSParseError');
    expect(error.message).toContain('Failed to parse Aura CSS file');
    expect(error.filePath).toBe('/path/to/file.css');
  });

  it('should include cause error if provided', () => {
    const cause = new Error('Original error');
    const error = new AuraParseError('/path/to/file.cmp', cause);
    expect(error.cause).toBe(cause);
  });

  it('should work with ErrorCollection', () => {
    const collection = new ErrorCollection();
    const error1 = new AuraParseError('/path/to/file1.cmp');
    const error2 = new AuraStructureError('Invalid structure', '/path/to/file2.cmp');
    
    collection.add(error1);
    collection.add(error2);
    
    expect(collection.hasErrors()).toBe(true);
    expect(collection.getCount()).toBe(2);
    expect(collection.getAll()).toHaveLength(2);
  });
});

