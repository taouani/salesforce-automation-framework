/**
 * Tests for path validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { access } from 'fs/promises';
import { validatePath, getPath, TEST_DEFAULT_PATH } from '../../src/scanner/path-validator.js';
import { PathValidationError } from '../../src/utils/errors.js';

vi.mock('fs/promises');

describe('validatePath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate an existing path', async () => {
    vi.mocked(access).mockResolvedValue(undefined);

    await expect(validatePath('/valid/path')).resolves.not.toThrow();
  });

  it('should throw PathValidationError for empty path', async () => {
    await expect(validatePath('')).rejects.toThrow(PathValidationError);
  });

  it('should throw PathValidationError for non-existent path', async () => {
    const error = new Error('ENOENT');
    vi.mocked(access).mockRejectedValue(error);

    await expect(validatePath('/invalid/path')).rejects.toThrow(
      PathValidationError
    );
  });
});

describe('getPath', () => {
  it('should return provided path', () => {
    expect(getPath('/custom/path')).toBe('/custom/path');
  });

  it('should return test default path when useTestDefault is true', () => {
    expect(getPath(undefined, true)).toBe(TEST_DEFAULT_PATH);
  });

  it('should throw PathValidationError when no path provided and useTestDefault is false', () => {
    expect(() => getPath(undefined, false)).toThrow(PathValidationError);
  });
});

