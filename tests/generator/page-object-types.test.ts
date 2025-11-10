/**
 * Tests for Page Object Model type definitions
 */

import { describe, it, expect } from 'vitest';
import {
  LocatorStrategy,
} from '../../src/types/page-object.js';
import type {
  PageObjectDefinition,
  ObjectPageDefinition,
  LightningPageDefinition,
  ComponentPageDefinition,
  FlowScreenPageDefinition,
  LocatorDefinition,
  FieldLocatorDefinition,
  ComponentLocatorDefinition,
  MethodDefinition,
  NavigationMethodDefinition,
  FieldInteractionMethodDefinition,
  ValidationMethodDefinition,
  AssertionMethodDefinition,
  BaseObjectPageDefinition,
  BaseLightningPageDefinition,
  BaseComponentPageDefinition,
  BaseFlowScreenDefinition,
  PageObjectFactoryDefinition,
  FactoryMethodDefinition,
  BuilderPatternDefinition,
  TemplateDefinition,
  TemplateVariableDefinition,
  TemplateContextDefinition,
  GenerationConfig,
  LocatorStrategyConfig,
  MethodGenerationConfig,
  GenerationResult,
  GeneratedFileDefinition,
  GenerationError,
} from '../../src/types/page-object.js';

describe('Page Object Model Type Definitions', () => {
  describe('LocatorStrategy enum', () => {
    it('should have all required locator strategies', () => {
      expect(LocatorStrategy.GET_BY_ROLE).toBe('getByRole');
      expect(LocatorStrategy.GET_BY_LABEL).toBe('getByLabel');
      expect(LocatorStrategy.GET_BY_TEST_ID).toBe('getByTestId');
      expect(LocatorStrategy.GET_BY_TEXT).toBe('getByText');
      expect(LocatorStrategy.CSS).toBe('css');
    });
  });

  describe('LocatorDefinition', () => {
    it('should create a valid locator definition', () => {
      const locator: LocatorDefinition = {
        name: 'saveButton',
        strategy: LocatorStrategy.GET_BY_ROLE,
        selector: 'button',
        description: 'Save button',
      };

      expect(locator.name).toBe('saveButton');
      expect(locator.strategy).toBe(LocatorStrategy.GET_BY_ROLE);
      expect(locator.selector).toBe('button');
    });
  });

  describe('FieldLocatorDefinition', () => {
    it('should create a valid field locator definition', () => {
      const fieldLocator: FieldLocatorDefinition = {
        name: 'accountNameField',
        strategy: LocatorStrategy.GET_BY_LABEL,
        selector: 'Account Name',
        fieldName: 'Name',
        fieldLabel: 'Account Name',
        fieldType: 'String',
        isRequired: true,
      };

      expect(fieldLocator.fieldName).toBe('Name');
      expect(fieldLocator.fieldLabel).toBe('Account Name');
      expect(fieldLocator.isRequired).toBe(true);
    });
  });

  describe('ComponentLocatorDefinition', () => {
    it('should create a valid component locator definition', () => {
      const componentLocator: ComponentLocatorDefinition = {
        name: 'customComponent',
        strategy: LocatorStrategy.CSS,
        selector: 'c-custom-component',
        componentName: 'CustomComponent',
        componentType: 'LWC',
      };

      expect(componentLocator.componentName).toBe('CustomComponent');
      expect(componentLocator.componentType).toBe('LWC');
    });
  });

  describe('MethodDefinition', () => {
    it('should create a valid method definition', () => {
      const method: MethodDefinition = {
        name: 'fill',
        parameters: [
          {
            name: 'fieldName',
            type: 'string',
          },
          {
            name: 'value',
            type: 'string',
          },
        ],
        returnType: 'Promise<void>',
        description: 'Fill a field with a value',
      };

      expect(method.name).toBe('fill');
      expect(method.parameters).toHaveLength(2);
      expect(method.returnType).toBe('Promise<void>');
    });
  });

  describe('PageObjectDefinition', () => {
    it('should create a valid page object definition', () => {
      const pageObject: PageObjectDefinition = {
        name: 'AccountPage',
        type: 'Object',
        locators: [],
        methods: [],
      };

      expect(pageObject.name).toBe('AccountPage');
      expect(pageObject.type).toBe('Object');
    });
  });

  describe('ObjectPageDefinition', () => {
    it('should create a valid object page definition', () => {
      const objectPage: ObjectPageDefinition = {
        name: 'AccountPage',
        type: 'Object',
        objectName: 'Account',
        objectLabel: 'Account',
        locators: [],
        methods: [],
        fields: [],
      };

      expect(objectPage.objectName).toBe('Account');
      expect(objectPage.type).toBe('Object');
    });
  });

  describe('LightningPageDefinition', () => {
    it('should create a valid Lightning page definition', () => {
      const lightningPage: LightningPageDefinition = {
        name: 'RecordPage',
        type: 'Lightning',
        pageName: 'Account_Record_Page',
        pageType: 'Record',
        locators: [],
        methods: [],
      };

      expect(lightningPage.pageType).toBe('Record');
      expect(lightningPage.type).toBe('Lightning');
    });
  });

  describe('ComponentPageDefinition', () => {
    it('should create a valid component page definition', () => {
      const componentPage: ComponentPageDefinition = {
        name: 'CustomComponentPage',
        type: 'LWC',
        componentName: 'CustomComponent',
        componentType: 'LWC',
        locators: [],
        methods: [],
      };

      expect(componentPage.componentName).toBe('CustomComponent');
      expect(componentPage.componentType).toBe('LWC');
    });
  });

  describe('FlowScreenPageDefinition', () => {
    it('should create a valid Flow screen page definition', () => {
      const flowScreen: FlowScreenPageDefinition = {
        name: 'FlowScreenPage',
        type: 'Flow',
        flowName: 'MyFlow',
        screenName: 'Screen1',
        locators: [],
        methods: [],
      };

      expect(flowScreen.flowName).toBe('MyFlow');
      expect(flowScreen.screenName).toBe('Screen1');
    });
  });

  describe('BasePageObjectDefinition', () => {
    it('should create a valid base object page definition', () => {
      const basePage: BaseObjectPageDefinition = {
        name: 'BaseObjectPage',
        type: 'Object',
        locators: [],
        methods: [],
      };

      expect(basePage.name).toBe('BaseObjectPage');
      expect(basePage.type).toBe('Object');
    });
  });

  describe('GenerationConfig', () => {
    it('should create a valid generation configuration', () => {
      const config: GenerationConfig = {
        outputDirectory: './generated',
        locatorStrategy: {
          primaryStrategy: LocatorStrategy.GET_BY_LABEL,
        },
        methodGeneration: {
          generateAssertions: true,
        },
      };

      expect(config.outputDirectory).toBe('./generated');
      expect(config.locatorStrategy?.primaryStrategy).toBe(LocatorStrategy.GET_BY_LABEL);
    });
  });

  describe('GenerationResult', () => {
    it('should create a valid generation result', () => {
      const result: GenerationResult = {
        generatedFiles: [],
        errors: [],
        warnings: [],
        summary: {
          totalFiles: 0,
          successfulFiles: 0,
          failedFiles: 0,
          totalErrors: 0,
          totalWarnings: 0,
        },
      };

      expect(result.generatedFiles).toEqual([]);
      expect(result.summary.totalFiles).toBe(0);
    });
  });
});

