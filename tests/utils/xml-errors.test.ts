/**
 * Tests for XML error types
 */

import { describe, it, expect } from 'vitest';
import { XMLParseError, XMLStructureError } from '../../src/utils/xml-errors.js';

describe('XMLParseError', () => {
  it('should create an XMLParseError with file path', () => {
    const error = new XMLParseError('/path/to/file.xml');
    expect(error.message).toContain('Failed to parse XML file');
    expect(error.filePath).toBe('/path/to/file.xml');
    expect(error.name).toBe('XMLParseError');
  });

  it('should create an XMLParseError with cause', () => {
    const cause = new Error('Original error');
    const error = new XMLParseError('/path/to/file.xml', cause);
    expect(error.cause).toBe(cause);
  });
});

describe('XMLStructureError', () => {
  it('should create an XMLStructureError', () => {
    const error = new XMLStructureError('Missing required field', '/path/to/file.xml');
    expect(error.message).toContain('Invalid XML structure');
    expect(error.filePath).toBe('/path/to/file.xml');
    expect(error.name).toBe('XMLStructureError');
  });
});

