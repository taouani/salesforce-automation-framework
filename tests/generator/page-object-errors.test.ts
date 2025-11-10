/**
 * Tests for Page Object Model generation error types
 */

import { describe, it, expect } from 'vitest';
import {
  PageObjectGenerationError,
  LocatorGenerationError,
  PageObjectTemplateError,
  PageObjectMetadataError,
} from '../../src/utils/page-object-errors.js';

describe('Page Object Model Generation Error Types', () => {
  describe('PageObjectGenerationError', () => {
    it('should create a valid PageObjectGenerationError', () => {
      const error = new PageObjectGenerationError('Test error', '/path/to/file');
      
      expect(error).toBeInstanceOf(PageObjectGenerationError);
      expect(error.message).toBe('Test error');
      expect(error.filePath).toBe('/path/to/file');
      expect(error.name).toBe('PageObjectGenerationError');
    });

    it('should accept a cause error', () => {
      const cause = new Error('Original error');
      const error = new PageObjectGenerationError('Test error', '/path/to/file', cause);
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('LocatorGenerationError', () => {
    it('should create a valid LocatorGenerationError', () => {
      const error = new LocatorGenerationError(
        'Failed to generate locator',
        'AccountName',
        'getByLabel',
        '/path/to/file'
      );
      
      expect(error).toBeInstanceOf(LocatorGenerationError);
      expect(error).toBeInstanceOf(PageObjectGenerationError);
      expect(error.message).toContain('Locator generation failed');
      expect(error.fieldName).toBe('AccountName');
      expect(error.locatorStrategy).toBe('getByLabel');
      expect(error.name).toBe('LocatorGenerationError');
    });
  });

  describe('PageObjectTemplateError', () => {
    it('should create a valid PageObjectTemplateError', () => {
      const error = new PageObjectTemplateError('template.hbs', 'Variable not found');
      
      expect(error).toBeInstanceOf(PageObjectTemplateError);
      expect(error).toBeInstanceOf(PageObjectGenerationError);
      expect(error.message).toContain('Template rendering failed');
      expect(error.template).toBe('template.hbs');
      expect(error.templateError).toBe('Variable not found');
      expect(error.name).toBe('PageObjectTemplateError');
    });
  });

  describe('PageObjectMetadataError', () => {
    it('should create a valid PageObjectMetadataError', () => {
      const error = new PageObjectMetadataError(
        'Missing metadata',
        'Object',
        'Account',
        '/path/to/file'
      );
      
      expect(error).toBeInstanceOf(PageObjectMetadataError);
      expect(error).toBeInstanceOf(PageObjectGenerationError);
      expect(error.message).toContain('Metadata error');
      expect(error.metadataType).toBe('Object');
      expect(error.metadataName).toBe('Account');
      expect(error.name).toBe('PageObjectMetadataError');
    });
  });
});

