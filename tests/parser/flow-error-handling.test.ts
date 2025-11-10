/**
 * Tests for Flow parsing error handling
 */

import { describe, it, expect } from 'vitest';
import {
  FlowParseError,
  FlowStructureError,
} from '../../src/utils/flow-errors.js';

describe('Flow Error Types', () => {
  it('should create FlowParseError with file path', () => {
    const error = new FlowParseError('/path/to/file.flow-meta.xml');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('FlowParseError');
    expect(error.message).toContain('Failed to parse Flow file');
    expect(error.filePath).toBe('/path/to/file.flow-meta.xml');
  });

  it('should create FlowStructureError with message', () => {
    const error = new FlowStructureError('Missing Flow element', '/path/to/file.flow-meta.xml');
    expect(error).toBeInstanceOf(FlowParseError);
    expect(error.name).toBe('FlowStructureError');
    expect(error.message).toContain('Invalid Flow XML structure');
    expect(error.filePath).toBe('/path/to/file.flow-meta.xml');
  });

  it('should include cause error if provided', () => {
    const cause = new Error('Original error');
    const error = new FlowParseError('/path/to/file.flow-meta.xml', cause);
    expect(error.cause).toBe(cause);
  });
});

