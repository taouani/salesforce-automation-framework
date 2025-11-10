/**
 * Tests for type classifier
 */

import { describe, it, expect } from 'vitest';
import { classifyType } from '../../src/classifier/type-classifier.js';

describe('classifyType', () => {
  it('should classify by directory name', () => {
    expect(
      classifyType('/path/to/force-app/main/default/classes/TestClass.cls')
    ).toBe('class');
    expect(
      classifyType('/path/to/force-app/main/default/objects/Account/Account.object-meta.xml')
    ).toBe('object');
    expect(
      classifyType('/path/to/force-app/main/default/lwc/testComponent/testComponent.js')
    ).toBe('lwc');
  });

  it('should classify by file extension when directory is unknown', () => {
    expect(classifyType('/unknown/path/file.cls')).toBe('class');
    expect(classifyType('/unknown/path/file.trigger')).toBe('trigger');
  });

  it('should return custom for unknown types', () => {
    expect(classifyType('/unknown/path/file.unknown')).toBe('custom');
  });
});

