/**
 * Tests for CLI integration
 */

import { describe, it, expect } from 'vitest';
import { Command } from 'commander';

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

