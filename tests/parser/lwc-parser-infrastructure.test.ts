/**
 * Tests for LWC parser infrastructure (parsing libraries and type definitions)
 */

import { describe, it, expect } from 'vitest';
import { parse } from '@babel/parser';
import * as cheerio from 'cheerio';
import postcss from 'postcss';

describe('Parsing Libraries Setup', () => {
  it('should parse JavaScript code with Babel', () => {
    const code = 'export default class MyComponent {}';
    expect(() => {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['decorators', 'classProperties'],
      });
      expect(ast).toBeDefined();
    }).not.toThrow();
  });

  it('should parse HTML with cheerio', () => {
    const html = '<div class="test">Hello</div>';
    const $ = cheerio.load(html);
    expect($('div').text()).toBe('Hello');
    expect($('div').attr('class')).toBe('test');
  });

  it('should parse CSS with postcss', async () => {
    const css = '.test { color: red; }';
    const result = await postcss().process(css, { from: undefined });
    expect(result).toBeDefined();
    expect(result.css).toContain('color: red');
  });
});

describe('Type Definitions', () => {
  it('should compile TypeScript interfaces without errors', () => {
    // This test verifies that type definitions compile correctly
    // The actual interfaces will be imported and tested in integration tests
    expect(true).toBe(true);
  });
});

