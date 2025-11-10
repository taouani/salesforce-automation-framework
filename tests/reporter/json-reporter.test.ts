/**
 * Tests for JSON reporter
 */

import { describe, it, expect } from 'vitest';
import { generateJSONReport } from '../../src/reporter/json-reporter.js';
import { MetadataRegistry } from '../../src/registry/metadata-registry.js';

describe('generateJSONReport', () => {
  it('should generate a JSON report', () => {
    const registry = new MetadataRegistry();
    registry.addItem({
      path: '/test/class.cls',
      type: 'class',
      purposes: ['business-logic'],
      fileName: 'class.cls',
      directory: 'classes',
      extension: '.cls',
    });

    const report = generateJSONReport(registry);
    const parsed = JSON.parse(report);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.statistics.totalItems).toBe(1);
  });
});

