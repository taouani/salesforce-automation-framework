/**
 * Tests for purpose classifier
 */

import { describe, it, expect } from 'vitest';
import { classifyPurposes } from '../../src/classifier/purpose-classifier.js';

describe('classifyPurposes', () => {
  it('should classify object as data-model and configuration', () => {
    const purposes = classifyPurposes('object');
    expect(purposes).toContain('data-model');
    expect(purposes).toContain('configuration');
  });

  it('should classify class as business-logic', () => {
    const purposes = classifyPurposes('class');
    expect(purposes).toEqual(['business-logic']);
  });

  it('should classify lwc as ui', () => {
    const purposes = classifyPurposes('lwc');
    expect(purposes).toEqual(['ui']);
  });

  it('should classify profile as permissions', () => {
    const purposes = classifyPurposes('profile');
    expect(purposes).toEqual(['permissions']);
  });

  it('should return configuration for custom type', () => {
    const purposes = classifyPurposes('custom');
    expect(purposes).toEqual(['configuration']);
  });
});

