/**
 * Tests for test template system
 * Tests template loading, rendering, and variable substitution for test templates
 */

import { describe, it, expect } from 'vitest';
import { readTemplate } from '../../src/generator/template-loader.js';
import { renderTemplate } from '../../src/generator/template-engine.js';
import { join } from 'path';

describe('Test Template System', () => {
  describe('Template Loading', () => {
    it('should load object-test.hbs template', async () => {
      const template = await readTemplate('test/object-test.hbs');
      
      expect(template).toBeDefined();
      expect(template.length).toBeGreaterThan(0);
      // Template should contain Handlebars syntax
      expect(template).toMatch(/\{\{/);
    });

    it('should handle missing template file gracefully', async () => {
      await expect(readTemplate('test/non-existent.hbs')).rejects.toThrow();
    });
  });

  describe('Template Rendering', () => {
    it('should render template with test group data', async () => {
      const template = `describe('{{groupName}}', () => {
  {{#each tests}}
  {{testCase}}
  {{/each}}
});`;
      
      const data = {
        groupName: 'CRUD Tests - Account',
        tests: [
          { testCase: "test('should create Account', async () => {});" },
          { testCase: "test('should read Account', async () => {});" },
        ],
      };
      
      const result = renderTemplate(template, data);
      
      expect(result).toContain('CRUD Tests - Account');
      expect(result).toContain('should create Account');
      expect(result).toContain('should read Account');
    });

    it('should render template with tags', async () => {
      const template = `test('{{name}} {{#if tags}}{{#each tags}}{{this}} {{/each}}{{/if}}', async () => {});`;
      
      const data = {
        name: 'should create Account',
        tags: ['@crud', '@Account'],
      };
      
      const result = renderTemplate(template, data);
      
      expect(result).toContain('should create Account');
      expect(result).toContain('@crud');
      expect(result).toContain('@Account');
    });

    it('should handle conditional rendering', async () => {
      const template = `{{#if pageObjectImport}}
import { {{pageObjectName}} } from '{{pageObjectFileName}}';
{{/if}}`;
      
      const dataWithImport = {
        pageObjectImport: true,
        pageObjectName: 'AccountPage',
        pageObjectFileName: 'account-page.js',
      };
      
      const dataWithoutImport = {
        pageObjectImport: false,
      };
      
      const resultWith = renderTemplate(template, dataWithImport);
      const resultWithout = renderTemplate(template, dataWithoutImport);
      
      expect(resultWith).toContain('import');
      expect(resultWith).toContain('AccountPage');
      expect(resultWithout).not.toContain('import');
    });
  });

  describe('Template Variable Substitution', () => {
    it('should substitute object name variables', async () => {
      const template = 'Test for {{objectName}} object';
      const data = { objectName: 'Account' };
      
      const result = renderTemplate(template, data);
      
      expect(result).toBe('Test for Account object');
    });

    it('should substitute nested variables', async () => {
      const template = '{{test.name}} - {{test.type}}';
      const data = {
        test: {
          name: 'should create Account',
          type: 'CRUD',
        },
      };
      
      const result = renderTemplate(template, data);
      
      expect(result).toBe('should create Account - CRUD');
    });

    it('should handle unescaped HTML in test cases', async () => {
      const template = '{{{testCase}}}';
      const data = {
        testCase: "test('should create Account', async () => { expect(x).toBe(1); });",
      };
      
      const result = renderTemplate(template, data);
      
      expect(result).toContain('expect(x).toBe(1)');
      expect(result).not.toContain('&lt;');
    });
  });
});

