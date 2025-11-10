/**
 * Tests for file scanner
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scanDirectory, processFilesInParallel, extractMetadataFromPath } from '../../src/scanner/file-scanner.js';
import { FileReadError } from '../../src/utils/errors.js';
import fg from 'fast-glob';

vi.mock('fast-glob');

describe('scanDirectory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should scan directory and return files', async () => {
    const mockFiles = [
      '/path/to/file1.cls',
      '/path/to/file2.xml',
      '/path/to/file3.js',
    ];
    vi.mocked(fg).mockResolvedValue(mockFiles);

    const result = await scanDirectory({ path: '/test/path' });

    expect(result.files).toEqual(mockFiles);
    expect(result.warnings).toHaveLength(0);
  });

  it('should handle scan errors gracefully', async () => {
    const error = new Error('Scan failed');
    vi.mocked(fg).mockRejectedValue(error);

    await expect(scanDirectory({ path: '/test/path' })).rejects.toThrow(
      FileReadError
    );
  });
});

describe('processFilesInParallel', () => {
  it('should process files in parallel with concurrency limit', async () => {
    const files = [1, 2, 3, 4, 5];
    const processor = vi.fn((file: number) => Promise.resolve(file * 2));

    const results = await processFilesInParallel(files, processor, 2);

    expect(results).toEqual([2, 4, 6, 8, 10]);
    expect(processor).toHaveBeenCalledTimes(5);
  });

  it('should handle errors without stopping entire process', async () => {
    const files = [1, 2, 3];
    const processor = vi.fn((file: number) => {
      if (file === 2) {
        throw new Error('Processing failed');
      }
      return Promise.resolve(file * 2);
    });

    const results = await processFilesInParallel(files, processor, 2);

    expect(results).toEqual([2, 6]);
  });
});

describe('extractMetadataFromPath', () => {
  it('should extract metadata from file path', () => {
    const result = extractMetadataFromPath(
      '/path/to/force-app/main/default/classes/TestClass.cls'
    );

    expect(result.fileName).toBe('TestClass.cls');
    expect(result.directory).toBe('classes');
    expect(result.extension).toBe('.cls');
  });

  it('should handle paths without extension', () => {
    const result = extractMetadataFromPath('/path/to/file');

    expect(result.fileName).toBe('file');
    expect(result.extension).toBe('');
  });
});

