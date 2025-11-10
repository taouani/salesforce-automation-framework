/**
 * Tests for template engine and code generation utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderTemplate } from '../../src/generator/template-engine.js';
import { formatCode } from '../../src/generator/code-formatter.js';
import { writeGeneratedFile, createDirectory } from '../../src/generator/file-generator.js';
import { GeneratorError, FileWriteError } from '../../src/utils/generator-errors.js';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

describe('Template Engine', () => {
  it('should render template with variables', () => {
    const template = 'Hello {{name}}!';
    const data = { name: 'World' };
    const result = renderTemplate(template, data);
    expect(result).toBe('Hello World!');
  });

  it('should handle template with multiple variables', () => {
    const template = '{{greeting}} {{name}}, welcome to {{project}}!';
    const data = { greeting: 'Hello', name: 'John', project: 'Salesforce' };
    const result = renderTemplate(template, data);
    expect(result).toBe('Hello John, welcome to Salesforce!');
  });

  it('should handle template with no variables', () => {
    const template = 'Static content';
    const result = renderTemplate(template, {});
    expect(result).toBe('Static content');
  });
});

describe('Code Formatter', () => {
  it('should format TypeScript code', async () => {
    const code = 'const x=1;const y=2;';
    const formatted = await formatCode(code, 'typescript');
    expect(formatted).toContain('const x = 1;');
    expect(formatted).toContain('const y = 2;');
  });

  it('should handle already formatted code', async () => {
    const code = 'const x = 1;\nconst y = 2;';
    const formatted = await formatCode(code, 'typescript');
    expect(formatted).toBeDefined();
  });

  it('should handle formatting errors gracefully', async () => {
    const invalidCode = 'const x = ;';
    await expect(formatCode(invalidCode, 'typescript')).resolves.toBeDefined();
  });
});

describe('File Generator', () => {
  const testDir = join(process.cwd(), 'test-temp');

  beforeEach(async () => {
    // Clean up test directory
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  afterEach(async () => {
    // Clean up test directory
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should create directory recursively', async () => {
    const dirPath = join(testDir, 'nested', 'deep');
    await createDirectory(dirPath);
    expect(existsSync(dirPath)).toBe(true);
  });

  it('should write file with content', async () => {
    const filePath = join(testDir, 'test-file.ts');
    const content = 'export const test = 1;';
    await writeGeneratedFile(filePath, content);
    expect(existsSync(filePath)).toBe(true);
  });

  it('should throw FileWriteError on invalid path', async () => {
    const filePath = '/invalid/path/test-file.ts';
    const content = 'test';
    await expect(writeGeneratedFile(filePath, content)).rejects.toThrow(FileWriteError);
  });
});

