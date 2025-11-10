/**
 * Tests for CLI
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';

// Mock the modules
vi.mock('../../src/scanner/file-scanner.js');
vi.mock('../../src/scanner/path-validator.js');
vi.mock('../../src/classifier/index.js');
vi.mock('../../src/registry/metadata-registry.js');
vi.mock('../../src/registry/persistence.js');
vi.mock('../../src/reporter/index.js');
vi.mock('../../src/utils/logger.js');

describe('CLI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse CLI arguments', () => {
    const program = new Command();
    program.argument('<path>', 'Path to Salesforce metadata directory');
    program.option('-f, --format <formats...>', 'Output format(s)');

    program.parse(['node', 'cli', '/test/path', '--format', 'json']);

    expect(program.args[0]).toBe('/test/path');
    expect(program.opts().format).toEqual(['json']);
  });

  it('should accept multiple output formats', () => {
    const program = new Command();
    program.argument('<path>', 'Path');
    program.option('-f, --format <formats...>', 'Output format(s)');

    program.parse([
      'node',
      'cli',
      '/test/path',
      '--format',
      'console',
      'json',
      'markdown',
    ]);

    expect(program.opts().format).toEqual(['console', 'json', 'markdown']);
  });
});

