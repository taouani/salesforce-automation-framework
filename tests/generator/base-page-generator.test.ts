/**
 * Tests for base page object generators
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import {
  generateBaseObjectPage,
  generateBaseLightningPage,
  generateBaseComponentPage,
  generateBaseFlowScreen,
} from '../../src/generator/page-object/base-page-generator.js';
import type {
  BaseObjectPageDefinition,
  BaseLightningPageDefinition,
  BaseComponentPageDefinition,
  BaseFlowScreenDefinition,
} from '../../src/types/page-object.js';
import { existsSync } from 'fs';

describe('Base Page Object Generators', () => {
  const testOutputDir = join(process.cwd(), 'test-output-base-pages');

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

  describe('generateBaseObjectPage', () => {
    it('should generate BaseObjectPage class', async () => {
      const definition: BaseObjectPageDefinition = {
        name: 'BaseObjectPage',
        type: 'Object',
        locators: [],
        methods: [],
      };

      const filePath = await generateBaseObjectPage(testOutputDir, definition);

      expect(existsSync(filePath)).toBe(true);
    });
  });

  describe('generateBaseLightningPage', () => {
    it('should generate BaseLightningPage class', async () => {
      const definition: BaseLightningPageDefinition = {
        name: 'BaseLightningPage',
        type: 'Lightning',
        locators: [],
        methods: [],
      };

      const filePath = await generateBaseLightningPage(testOutputDir, definition);

      expect(existsSync(filePath)).toBe(true);
    });
  });

  describe('generateBaseComponentPage', () => {
    it('should generate BaseComponentPage class', async () => {
      const definition: BaseComponentPageDefinition = {
        name: 'BaseComponentPage',
        type: 'LWC',
        locators: [],
        methods: [],
      };

      const filePath = await generateBaseComponentPage(testOutputDir, definition);

      expect(existsSync(filePath)).toBe(true);
    });
  });

  describe('generateBaseFlowScreen', () => {
    it('should generate BaseFlowScreen class', async () => {
      const definition: BaseFlowScreenDefinition = {
        name: 'BaseFlowScreen',
        type: 'Flow',
        locators: [],
        methods: [],
      };

      const filePath = await generateBaseFlowScreen(testOutputDir, definition);

      expect(existsSync(filePath)).toBe(true);
    });
  });
});

