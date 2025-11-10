/**
 * Tests for main classifier
 */

import { describe, it, expect } from 'vitest';
import { classifyMetadata, createMetadataItem } from '../../src/classifier/index.js';

describe('classifyMetadata', () => {
  it('should classify metadata with type and purposes', () => {
    const classification = classifyMetadata(
      '/path/to/force-app/main/default/classes/TestClass.cls'
    );

    expect(classification.type).toBe('class');
    expect(classification.purposes).toContain('business-logic');
  });

  it('should support multiple purposes', () => {
    const classification = classifyMetadata(
      '/path/to/force-app/main/default/objects/Account/Account.object-meta.xml'
    );

    expect(classification.type).toBe('object');
    expect(classification.purposes.length).toBeGreaterThan(1);
  });
});

describe('createMetadataItem', () => {
  it('should create a complete MetadataItem', () => {
    const item = createMetadataItem(
      '/path/to/force-app/main/default/classes/TestClass.cls'
    );

    expect(item.path).toBe('/path/to/force-app/main/default/classes/TestClass.cls');
    expect(item.type).toBe('class');
    expect(item.purposes).toContain('business-logic');
    expect(item.fileName).toBe('TestClass.cls');
    expect(item.directory).toBe('classes');
    expect(item.extension).toBe('.cls');
  });
});

