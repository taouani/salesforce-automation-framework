/**
 * Tests for object page object generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  convertObjectToPageDefinition,
  generateObjectPageObject,
  generateObjectPageObjects,
} from '../../src/generator/page-object/object-page-generator.js';
import type { ObjectDefinition } from '../../src/types/xml-parsed.js';

describe('Object Page Object Generator', () => {
  const testOutputDir = join(process.cwd(), 'test-output-object-pages');

  beforeEach(async () => {
    if (existsSync(testOutputDir)) {
      await rm(testOutputDir, { recursive: true });
    }
    await mkdir(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(testOutputDir)) {
      await rm(testOutputDir, { recursive: true });
    }
  });

  describe('convertObjectToPageDefinition', () => {
    it('should convert ObjectDefinition to ObjectPageDefinition', () => {
      const objectDef: ObjectDefinition = {
        fullName: 'TestObject__c',
        label: 'Test Object',
        fields: [
          {
            fullName: 'Name',
            label: 'Name',
            type: 'String',
            required: true,
          },
          {
            fullName: 'Description__c',
            label: 'Description',
            type: 'Text',
          },
        ],
        validationRules: [],
        recordTypes: [],
        relationships: [],
      };

      const pageDef = convertObjectToPageDefinition(objectDef);

      expect(pageDef.objectName).toBe('TestObject__c');
      expect(pageDef.objectLabel).toBe('Test Object');
      expect(pageDef.fields).toHaveLength(2);
      expect(pageDef.fields[0].fieldName).toBe('Name');
    });
  });

  describe('generateObjectPageObject', () => {
    it('should generate object page object class', async () => {
      const objectDef: ObjectDefinition = {
        fullName: 'TestObject__c',
        label: 'Test Object',
        fields: [
          {
            fullName: 'Name',
            label: 'Name',
            type: 'String',
          },
        ],
        validationRules: [],
        recordTypes: [],
        relationships: [],
      };

      const filePath = await generateObjectPageObject(testOutputDir, objectDef);

      expect(existsSync(filePath)).toBe(true);
    });
  });

  describe('generateObjectPageObjects', () => {
    it('should generate page objects for multiple objects', async () => {
      const objects: ObjectDefinition[] = [
        {
          fullName: 'TestObject1__c',
          label: 'Test Object 1',
          fields: [],
          validationRules: [],
          recordTypes: [],
          relationships: [],
        },
        {
          fullName: 'TestObject2__c',
          label: 'Test Object 2',
          fields: [],
          validationRules: [],
          recordTypes: [],
          relationships: [],
        },
      ];

      const filePaths = await generateObjectPageObjects(testOutputDir, objects);

      expect(filePaths.length).toBeGreaterThan(0);
    });
  });
});

