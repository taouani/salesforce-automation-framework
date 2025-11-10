/**
 * Tests for metadata type definitions
 */

import { describe, it, expect } from 'vitest';
import type {
  MetadataItem,
  MetadataType,
  MetadataPurpose,
  Classification,
  ScanStatistics,
} from '../../src/types/metadata.js';

describe('MetadataItem interface', () => {
  it('should create a valid MetadataItem', () => {
    const item: MetadataItem = {
      path: 'force-app/main/default/classes/TestClass.cls',
      type: 'class',
      purposes: ['business-logic'],
      fileName: 'TestClass.cls',
      directory: 'classes',
      extension: '.cls',
    };

    expect(item.path).toBe('force-app/main/default/classes/TestClass.cls');
    expect(item.type).toBe('class');
    expect(item.purposes).toEqual(['business-logic']);
  });

  it('should support multiple purposes', () => {
    const item: MetadataItem = {
      path: 'force-app/main/default/objects/Account/Account.object-meta.xml',
      type: 'object',
      purposes: ['data-model', 'configuration'],
      fileName: 'Account.object-meta.xml',
      directory: 'objects',
      extension: '.xml',
    };

    expect(item.purposes.length).toBe(2);
    expect(item.purposes).toContain('data-model');
    expect(item.purposes).toContain('configuration');
  });
});

describe('Classification interface', () => {
  it('should create a valid Classification', () => {
    const classification: Classification = {
      type: 'lwc',
      purposes: ['ui'],
    };

    expect(classification.type).toBe('lwc');
    expect(classification.purposes).toEqual(['ui']);
  });
});

describe('ScanStatistics interface', () => {
  it('should create valid ScanStatistics', () => {
    const stats: ScanStatistics = {
      totalItems: 10,
      countsByType: {
        class: 5,
        object: 3,
        lwc: 2,
        trigger: 0,
        aura: 0,
        flow: 0,
        profile: 0,
        permissionset: 0,
        permissionsetgroup: 0,
        custompermission: 0,
        layout: 0,
        page: 0,
        label: 0,
        flexipage: 0,
        custom: 0,
      },
      countsByPurpose: {
        'data-model': 3,
        ui: 2,
        'business-logic': 5,
        permissions: 0,
        configuration: 0,
      },
      errors: 0,
      warnings: 1,
    };

    expect(stats.totalItems).toBe(10);
    expect(stats.countsByType.class).toBe(5);
    expect(stats.errors).toBe(0);
    expect(stats.warnings).toBe(1);
  });
});

