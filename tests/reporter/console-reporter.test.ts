/**
 * Tests for console reporter
 */

import { describe, it, expect } from 'vitest';
import { generateConsoleReport } from '../../src/reporter/console-reporter.js';
import { MetadataRegistry } from '../../src/registry/metadata-registry.js';

describe('generateConsoleReport', () => {
  it('should generate a console report', () => {
    const registry = new MetadataRegistry();
    registry.addItem({
      path: '/test/class.cls',
      type: 'class',
      purposes: ['business-logic'],
      fileName: 'class.cls',
      directory: 'classes',
      extension: '.cls',
    });

    const report = generateConsoleReport(registry);
    expect(report).toContain('Salesforce Metadata Inventory Report');
    expect(report).toContain('Total Metadata Items: 1');
    expect(report).toContain('class');
  });
});

