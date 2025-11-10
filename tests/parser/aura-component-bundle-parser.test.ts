/**
 * Tests for Aura component bundle parser
 */

import { describe, it, expect } from 'vitest';
import { parseAuraComponentBundle } from '../../src/parser/aura-component-bundle-parser.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('Aura Component Bundle Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-aura-bundle');

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

  it('should parse component bundle with all files', async () => {
    const componentDir = join(testDir, 'TestComponent');
    const componentName = 'TestComponent';
    
    if (!existsSync(componentDir)) {
      await mkdir(componentDir, { recursive: true });
    }

    // Create .cmp file
    const cmpFile = join(componentDir, `${componentName}.cmp`);
    await writeFile(cmpFile, `
<aura:component access="public">
    <aura:attribute name="recordId" type="String"/>
    <div>Test</div>
</aura:component>`, 'utf-8');

    // Create Controller.js file
    const controllerFile = join(componentDir, `${componentName}Controller.js`);
    await writeFile(controllerFile, `
({
    initialize : function(component, event, helper) {
        component.set('v.recordId', '123');
    }
});`, 'utf-8');

    // Create Helper.js file
    const helperFile = join(componentDir, `${componentName}Helper.js`);
    await writeFile(helperFile, `
({
    getData : function(component) {
        return component.get('v.recordId');
    }
});`, 'utf-8');

    // Create CSS file
    const cssFile = join(componentDir, `${componentName}.css`);
    await writeFile(cssFile, `
.THIS .my-class {
    color: red;
}`, 'utf-8');

    // Create metadata file
    const metaFile = join(componentDir, `${componentName}.cmp-meta.xml`);
    await writeFile(metaFile, `<?xml version="1.0" encoding="UTF-8"?>
<AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>51.0</apiVersion>
    <description>Test Component</description>
</AuraDefinitionBundle>`, 'utf-8');

    const result = await parseAuraComponentBundle(componentDir);

    expect(result.metadata.name).toBe(componentName);
    expect(result.type).toBe('Component');
    expect(result.markup).toBeDefined();
    expect(result.controller).toBeDefined();
    expect(result.helper).toBeDefined();
    expect(result.css).toBeDefined();
  });

  it('should parse component bundle with missing optional files', async () => {
    const componentDir = join(testDir, 'TestComponent2');
    const componentName = 'TestComponent2';
    
    if (!existsSync(componentDir)) {
      await mkdir(componentDir, { recursive: true });
    }

    // Create only .cmp file
    const cmpFile = join(componentDir, `${componentName}.cmp`);
    await writeFile(cmpFile, `
<aura:component access="public">
    <div>Test</div>
</aura:component>`, 'utf-8');

    const result = await parseAuraComponentBundle(componentDir);

    expect(result.metadata.name).toBe(componentName);
    expect(result.markup).toBeDefined();
    expect(result.controller).toBeUndefined();
    expect(result.helper).toBeUndefined();
    expect(result.renderer).toBeUndefined();
    expect(result.css).toBeUndefined();
  });

  it('should extract component name from directory structure', async () => {
    const componentDir = join(testDir, 'MyComponent');
    const componentName = 'MyComponent';
    
    if (!existsSync(componentDir)) {
      await mkdir(componentDir, { recursive: true });
    }

    const cmpFile = join(componentDir, `${componentName}.cmp`);
    await writeFile(cmpFile, `
<aura:component access="public">
    <div>Test</div>
</aura:component>`, 'utf-8');

    const result = await parseAuraComponentBundle(componentDir);

    expect(result.metadata.name).toBe(componentName);
  });
});

