/**
 * Tests for Markdown reporter
 */

import { describe, it, expect } from 'vitest';
import { generateMarkdownReport } from '../../src/reporter/markdown-reporter.js';
import { MetadataRegistry } from '../../src/registry/metadata-registry.js';

describe('generateMarkdownReport', () => {
  it('should generate a Markdown report', () => {
    const registry = new MetadataRegistry();
    registry.addItem({
      path: '/test/class.cls',
      type: 'class',
      purposes: ['business-logic'],
      fileName: 'class.cls',
      directory: 'classes',
      extension: '.cls',
    });

    const report = generateMarkdownReport(registry);
    expect(report).toContain('# Salesforce Metadata Inventory Report');
    expect(report).toContain('Total Metadata Items');
    expect(report).toContain('| Type | Count |');
  });
});

