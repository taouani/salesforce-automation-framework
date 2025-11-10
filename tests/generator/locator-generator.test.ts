/**
 * Tests for locator generation
 */

import { describe, it, expect } from 'vitest';
import {
  generateFieldLocator,
  generateButtonLocator,
  generateLightningComponentLocator,
  generateTextLocator,
  generateCSSLocator,
  generateLocatorName,
} from '../../src/generator/locator-generator.js';
import { LocatorStrategy } from '../../src/types/page-object.js';

describe('Locator Generator', () => {
  describe('generateFieldLocator', () => {
    it('should generate a field locator using getByLabel', () => {
      const locator = generateFieldLocator('Name', 'Account Name', 'String');

      expect(locator.strategy).toBe(LocatorStrategy.GET_BY_LABEL);
      expect(locator.selector).toBe('Account Name');
      expect(locator.fieldName).toBe('Name');
      expect(locator.fieldLabel).toBe('Account Name');
      expect(locator.fieldType).toBe('String');
    });

    it('should include field options', () => {
      const locator = generateFieldLocator('Name', 'Account Name', 'String', {
        isRequired: true,
        isReadOnly: false,
      });

      expect(locator.isRequired).toBe(true);
      expect(locator.isReadOnly).toBe(false);
    });
  });

  describe('generateButtonLocator', () => {
    it('should generate a button locator using getByRole', () => {
      const locator = generateButtonLocator('Save', 'saveButton');

      expect(locator.strategy).toBe(LocatorStrategy.GET_BY_ROLE);
      expect(locator.name).toBe('saveButton');
      expect(locator.selector).toContain('button');
    });
  });

  describe('generateLightningComponentLocator', () => {
    it('should generate a locator for standard Lightning component', () => {
      const locator = generateLightningComponentLocator('Button', 'Standard');

      expect(locator.componentType).toBe('Standard');
      expect(locator.strategy).toBe(LocatorStrategy.CSS);
      expect(locator.selector).toContain('lightning-button');
    });

    it('should generate a locator for LWC component', () => {
      const locator = generateLightningComponentLocator('CustomComponent', 'LWC');

      expect(locator.componentType).toBe('LWC');
      expect(locator.strategy).toBe(LocatorStrategy.CSS);
      expect(locator.selector).toContain('c-custom-component');
    });

    it('should prefer data-testid if available', () => {
      const locator = generateLightningComponentLocator('CustomComponent', 'LWC', {
        dataTestId: 'test-id-123',
      });

      expect(locator.strategy).toBe(LocatorStrategy.GET_BY_TEST_ID);
      expect(locator.selector).toBe('test-id-123');
    });
  });

  describe('generateTextLocator', () => {
    it('should generate a text locator using getByText', () => {
      const locator = generateTextLocator('Click here', 'clickHereLink');

      expect(locator.strategy).toBe(LocatorStrategy.GET_BY_TEXT);
      expect(locator.selector).toBe('Click here');
      expect(locator.name).toBe('clickHereLink');
    });
  });

  describe('generateCSSLocator', () => {
    it('should generate a CSS locator', () => {
      const locator = generateCSSLocator('.slds-button', 'sldsButton', 'SLDS button');

      expect(locator.strategy).toBe(LocatorStrategy.CSS);
      expect(locator.selector).toBe('.slds-button');
      expect(locator.name).toBe('sldsButton');
    });
  });

  describe('generateLocatorName', () => {
    it('should convert field name to camelCase', () => {
      expect(generateLocatorName('Account Name')).toBe('accountName');
      expect(generateLocatorName('Custom_Field__c')).toBe('customFieldC');
      expect(generateLocatorName('Save Button')).toBe('saveButton');
    });
  });
});

