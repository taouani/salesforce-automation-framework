/**
 * Tests for JavaScript file parser
 */

import { describe, it, expect } from 'vitest';
import { parseJavaScriptFile } from '../../src/parser/javascript-parser.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('JavaScript Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-js-parser');

  beforeEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  it('should parse @api properties', async () => {
    const code = `
      import { api } from 'lwc';
      export default class MyComponent {
        @api recordId;
        @api label = 'Test';
      }
    `;
    const filePath = join(testDir, 'test.js');
    await writeFile(filePath, code, 'utf-8');
    
    const result = await parseJavaScriptFile(filePath);
    expect(result.properties).toBeDefined();
    expect(result.properties.length).toBeGreaterThan(0);
    const apiProperty = result.properties.find(p => p.name === 'recordId');
    expect(apiProperty).toBeDefined();
    expect(apiProperty?.isPublic).toBe(true);
  });

  it('should parse lifecycle hooks', async () => {
    const code = `
      export default class MyComponent {
        connectedCallback() {
          console.log('connected');
        }
      }
    `;
    const filePath = join(testDir, 'test.js');
    await writeFile(filePath, code, 'utf-8');
    
    const result = await parseJavaScriptFile(filePath);
    expect(result.eventHandlers).toBeDefined();
    const hook = result.eventHandlers.find(e => e.name === 'connectedCallback');
    expect(hook).toBeDefined();
    expect(hook?.type).toBe('lifecycle');
  });

  it('should parse import statements', async () => {
    const code = `
      import { LightningElement } from 'lwc';
      import { getRecord } from 'lightning/uiRecordApi';
      import MyComponent from 'c/myComponent';
    `;
    const filePath = join(testDir, 'test.js');
    await writeFile(filePath, code, 'utf-8');
    
    const result = await parseJavaScriptFile(filePath);
    expect(result.imports).toBeDefined();
    expect(result.imports.length).toBeGreaterThan(0);
    const lwcImport = result.imports.find(i => i.isLightningImport);
    expect(lwcImport).toBeDefined();
  });
});

