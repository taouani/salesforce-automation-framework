/**
 * Tests for Apex parsing error handling
 */

import { describe, it, expect } from 'vitest';
import {
  ApexParseError,
  ApexClassParseError,
  ApexTriggerParseError,
  SOQLParseError,
  DMLParseError,
} from '../../src/utils/apex-errors.js';

describe('Apex Error Types', () => {
  it('should create ApexParseError with file path', () => {
    const error = new ApexParseError('/path/to/file.cls');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApexParseError');
    expect(error.message).toContain('Failed to parse Apex file');
    expect(error.filePath).toBe('/path/to/file.cls');
  });

  it('should create ApexClassParseError with file path', () => {
    const error = new ApexClassParseError('/path/to/file.cls');
    expect(error).toBeInstanceOf(ApexParseError);
    expect(error.name).toBe('ApexClassParseError');
    expect(error.message).toContain('Failed to parse Apex class file');
    expect(error.filePath).toBe('/path/to/file.cls');
  });

  it('should create ApexTriggerParseError with file path', () => {
    const error = new ApexTriggerParseError('/path/to/file.trigger');
    expect(error).toBeInstanceOf(ApexParseError);
    expect(error.name).toBe('ApexTriggerParseError');
    expect(error.message).toContain('Failed to parse Apex trigger file');
    expect(error.filePath).toBe('/path/to/file.trigger');
  });

  it('should create SOQLParseError with message', () => {
    const error = new SOQLParseError('Invalid SOQL syntax', '/path/to/file.cls');
    expect(error).toBeInstanceOf(ApexParseError);
    expect(error.name).toBe('SOQLParseError');
    expect(error.message).toContain('Failed to parse SOQL query');
    expect(error.filePath).toBe('/path/to/file.cls');
  });

  it('should create DMLParseError with message', () => {
    const error = new DMLParseError('Invalid DML syntax', '/path/to/file.cls');
    expect(error).toBeInstanceOf(ApexParseError);
    expect(error.name).toBe('DMLParseError');
    expect(error.message).toContain('Failed to parse DML operation');
    expect(error.filePath).toBe('/path/to/file.cls');
  });

  it('should include cause error if provided', () => {
    const cause = new Error('Original error');
    const error = new ApexParseError('/path/to/file.cls', cause);
    expect(error.cause).toBe(cause);
  });
});

