/**
 * Tests for test generation error types
 */

import { describe, it, expect } from 'vitest';
import {
  TestGenerationError,
  TestDataGenerationError,
  TestTemplateError,
  TestMetadataError,
} from '../../src/utils/test-generation-errors.js';

describe('Test Generation Error Types', () => {
  it('should create TestGenerationError', () => {
    const error = new TestGenerationError('Test error', 'test.ts');
    expect(error.message).toBe('Test error');
    expect(error.filePath).toBe('test.ts');
    expect(error.name).toBe('TestGenerationError');
  });

  it('should create TestDataGenerationError', () => {
    const error = new TestDataGenerationError('API error', 'REST');
    expect(error.message).toContain('Test data generation failed');
    expect(error.apiType).toBe('REST');
    expect(error.name).toBe('TestDataGenerationError');
  });

  it('should create TestTemplateError', () => {
    const error = new TestTemplateError('test-template.hbs');
    expect(error.message).toContain('Failed to render test template');
    expect(error.name).toBe('TestTemplateError');
  });

  it('should create TestMetadataError', () => {
    const error = new TestMetadataError('Missing metadata', 'object');
    expect(error.message).toContain('Test generation metadata error');
    expect(error.metadataType).toBe('object');
    expect(error.name).toBe('TestMetadataError');
  });

  it('should preserve cause error in TestGenerationError', () => {
    const cause = new Error('Original error');
    const error = new TestGenerationError('Wrapped error', 'test.ts', cause);
    expect(error.cause).toBe(cause);
  });

  it('should preserve cause error in TestDataGenerationError', () => {
    const cause = new Error('API connection failed');
    const error = new TestDataGenerationError('API error', 'REST', cause);
    expect(error.cause).toBe(cause);
  });
});

