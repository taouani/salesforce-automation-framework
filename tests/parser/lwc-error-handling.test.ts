/**
 * Tests for LWC parsing error handling
 */

import { describe, it, expect } from 'vitest';
import {
  JavaScriptParseError,
  HTMLParseError,
  CSSParseError,
} from '../../src/utils/lwc-errors.js';

describe('LWC Error Types', () => {
  it('should create JavaScriptParseError with file path', () => {
    const error = new JavaScriptParseError('/path/to/file.js');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('JavaScriptParseError');
    expect(error.message).toContain('Failed to parse JavaScript file');
    expect(error.filePath).toBe('/path/to/file.js');
  });

  it('should create HTMLParseError with file path', () => {
    const error = new HTMLParseError('/path/to/file.html');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('HTMLParseError');
    expect(error.message).toContain('Failed to parse HTML template file');
    expect(error.filePath).toBe('/path/to/file.html');
  });

  it('should create CSSParseError with file path', () => {
    const error = new CSSParseError('/path/to/file.css');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('CSSParseError');
    expect(error.message).toContain('Failed to parse CSS file');
    expect(error.filePath).toBe('/path/to/file.css');
  });

  it('should include cause error if provided', () => {
    const cause = new Error('Original error');
    const error = new JavaScriptParseError('/path/to/file.js', cause);
    expect(error.cause).toBe(cause);
  });
});

