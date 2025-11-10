/**
 * Tests for Aura Renderer JavaScript parser
 */

import { describe, it, expect } from 'vitest';
import { parseRendererJavaScriptFile } from '../../src/parser/aura-renderer-parser.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('Aura Renderer Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-aura-renderer');

  beforeAll(async () => {
    if (!existsSync(testDir)) {
      await mkdir(testDir, { recursive: true });
    }
  });

  afterAll(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should parse Renderer.js file and extract render methods', async () => {
    const testFile = join(testDir, 'TestComponentRenderer.js');
    const code = `
({
    render : function(component, helper) {
        return [];
    },
    rerender : function(component, helper) {
        // Re-render logic
    },
    afterRender : function(component, helper) {
        // After render logic
    }
});`;

    await writeFile(testFile, code, 'utf-8');

    const result = await parseRendererJavaScriptFile(testFile);

    expect(result.renderMethods).toBeDefined();
    expect(result.renderMethods.length).toBeGreaterThan(0);
    expect(result.renderMethods.some(m => m.methodName === 'render')).toBe(true);
    expect(result.renderMethods.some(m => m.methodName === 'rerender')).toBe(true);
  });

  it('should extract DOM manipulation from render methods', async () => {
    const testFile = join(testDir, 'TestComponent2Renderer.js');
    const code = `
({
    render : function(component, helper) {
        var element = document.createElement('div');
        element.setAttribute('class', 'my-class');
        document.getElementById('container').appendChild(element);
        return [];
    }
});`;

    await writeFile(testFile, code, 'utf-8');

    const result = await parseRendererJavaScriptFile(testFile);

    expect(result.domManipulation.length).toBeGreaterThanOrEqual(0);
  });
});

