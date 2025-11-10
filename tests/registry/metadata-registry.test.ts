/**
 * Tests for metadata registry
 */

import { describe, it, expect } from 'vitest';
import { MetadataRegistry } from '../../src/registry/metadata-registry.js';
import type { MetadataItem } from '../../src/types/metadata.js';

describe('MetadataRegistry', () => {
  let registry: MetadataRegistry;

  beforeEach(() => {
    registry = new MetadataRegistry();
  });

  it('should add items to registry', () => {
    const item: MetadataItem = {
      path: '/test/path.cls',
      type: 'class',
      purposes: ['business-logic'],
      fileName: 'test.cls',
      directory: 'classes',
      extension: '.cls',
    };

    registry.addItem(item);
    expect(registry.getItems()).toHaveLength(1);
  });

  it('should filter items by type', () => {
    registry.addItem({
      path: '/test/class.cls',
      type: 'class',
      purposes: ['business-logic'],
      fileName: 'class.cls',
      directory: 'classes',
      extension: '.cls',
    });
    registry.addItem({
      path: '/test/object.xml',
      type: 'object',
      purposes: ['data-model'],
      fileName: 'object.xml',
      directory: 'objects',
      extension: '.xml',
    });

    const classes = registry.getItemsByType('class');
    expect(classes).toHaveLength(1);
    expect(classes[0].type).toBe('class');
  });

  it('should filter items by purpose', () => {
    registry.addItem({
      path: '/test/class.cls',
      type: 'class',
      purposes: ['business-logic'],
      fileName: 'class.cls',
      directory: 'classes',
      extension: '.cls',
    });
    registry.addItem({
      path: '/test/object.xml',
      type: 'object',
      purposes: ['data-model'],
      fileName: 'object.xml',
      directory: 'objects',
      extension: '.xml',
    });

    const businessLogic = registry.getItemsByPurpose('business-logic');
    expect(businessLogic).toHaveLength(1);
  });

  it('should calculate statistics', () => {
    registry.addItem({
      path: '/test/class.cls',
      type: 'class',
      purposes: ['business-logic'],
      fileName: 'class.cls',
      directory: 'classes',
      extension: '.cls',
    });

    const stats = registry.getStatistics();
    expect(stats.totalItems).toBe(1);
    expect(stats.countsByType.class).toBe(1);
    expect(stats.countsByPurpose['business-logic']).toBe(1);
  });

  it('should convert to JSON', () => {
    registry.addItem({
      path: '/test/class.cls',
      type: 'class',
      purposes: ['business-logic'],
      fileName: 'class.cls',
      directory: 'classes',
      extension: '.cls',
    });

    const json = registry.toJSON();
    expect(json.items).toHaveLength(1);
    expect(json.statistics.totalItems).toBe(1);
    expect(json.generatedAt).toBeDefined();
    expect(json.version).toBe('1.0.0');
  });
});

