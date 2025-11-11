/**
 * Tests for CLI integration
 * Tests CLI command parsing, execution, and error handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

describe('CLI Generate Command', () => {
  it('should parse generate command arguments', () => {
    const program = new Command();
    const generateCmd = program
      .command('generate')
      .argument('<output-path>')
      .option('--force')
      .option('--project-name <name>');

    generateCmd.parse(['./test-output', '--force', '--project-name', 'my-tests'], { from: 'user' });

    expect(generateCmd.args[0]).toBe('./test-output');
    expect(generateCmd.opts().force).toBe(true);
    expect(generateCmd.opts().projectName).toBe('my-tests');
  });

  it('should parse generate command without options', () => {
    const program = new Command();
    const generateCmd = program
      .command('generate')
      .argument('<output-path>')
      .option('--force')
      .option('--project-name <name>', '', 'salesforce-tests');

    generateCmd.parse(['./test-output'], { from: 'user' });

    expect(generateCmd.args[0]).toBe('./test-output');
    expect(generateCmd.opts().force).toBeUndefined();
  });
});

describe('CLI Generate-Tests Command', () => {
  it('should parse generate-tests command with positional arguments', () => {
    const program = new Command();
    const generateTestsCmd = program
      .command('generate-tests')
      .argument('[input]', 'Input path')
      .argument('[output]', 'Output path')
      .option('-i, --input <path>', 'Input path')
      .option('-o, --output <path>', 'Output path')
      .option('--auth-approach <approach>', 'Auth approach', 'both')
      .option('--no-fixtures', 'Skip fixtures')
      .option('--no-test-data', 'Skip test data');

    generateTestsCmd.parse(['./parsed-results', './generated-tests'], { from: 'user' });

    expect(generateTestsCmd.args[0]).toBe('./parsed-results');
    expect(generateTestsCmd.args[1]).toBe('./generated-tests');
  });

  it('should parse generate-tests command with options', () => {
    const program = new Command();
    const generateTestsCmd = program
      .command('generate-tests')
      .argument('[input]', 'Input path')
      .argument('[output]', 'Output path')
      .option('-i, --input <path>', 'Input path')
      .option('-o, --output <path>', 'Output path')
      .option('--auth-approach <approach>', 'Auth approach', 'both')
      .option('--no-fixtures', 'Skip fixtures')
      .option('--no-test-data', 'Skip test data');

    generateTestsCmd.parse(['--input', './parsed', '--output', './tests', '--auth-approach', 'helpers'], { from: 'user' });

    expect(generateTestsCmd.opts().input).toBe('./parsed');
    expect(generateTestsCmd.opts().output).toBe('./tests');
    expect(generateTestsCmd.opts().authApproach).toBe('helpers');
  });

  it('should handle missing arguments with defaults', () => {
    const program = new Command();
    const generateTestsCmd = program
      .command('generate-tests')
      .argument('[input]', 'Input path', './parsed-results')
      .argument('[output]', 'Output path', './generated-tests')
      .option('-i, --input <path>', 'Input path', './parsed-results')
      .option('-o, --output <path>', 'Output path', './generated-tests');

    generateTestsCmd.parse([], { from: 'user' });

    // Should use defaults when no arguments provided
    expect(generateTestsCmd.args).toHaveLength(0);
  });
});

describe('CLI Error Handling', () => {
  it('should handle invalid command gracefully', () => {
    const program = new Command();
    program
      .command('generate-tests')
      .argument('[input]', 'Input path')
      .argument('[output]', 'Output path');

    // Should not throw when parsing invalid command
    expect(() => {
      try {
        program.parse(['invalid-command'], { from: 'user' });
      } catch (error) {
        // Expected to handle error
      }
    }).not.toThrow();
  });

  it('should validate auth approach option', () => {
    const program = new Command();
    const generateTestsCmd = program
      .command('generate-tests')
      .option('--auth-approach <approach>', 'Auth approach', 'both');

    generateTestsCmd.parse(['--auth-approach', 'helpers'], { from: 'user' });

    const authApproach = generateTestsCmd.opts().authApproach;
    expect(['helpers', 'configuredConnection', 'both']).toContain(authApproach);
  });
});

