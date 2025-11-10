/**
 * Tests for Aura Controller JavaScript parser
 */

import { describe, it, expect } from 'vitest';
import { parseControllerJavaScriptFile } from '../../src/parser/aura-controller-parser.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('Aura Controller Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-aura-controller');

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

  it('should parse Controller.js file and extract action methods', async () => {
    const testFile = join(testDir, 'TestComponentController.js');
    const code = `
({
    initialize : function(component, event, helper) {
        component.set('v.recordId', '123');
    },
    handleClick : function(component, event, helper) {
        helper.doSomething(component);
    }
});`;

    await writeFile(testFile, code, 'utf-8');

    const result = await parseControllerJavaScriptFile(testFile);

    expect(result.actionMethods).toBeDefined();
    expect(result.actionMethods.length).toBeGreaterThan(0);
    expect(result.actionMethods.some(m => m.name === 'initialize')).toBe(true);
    expect(result.actionMethods.some(m => m.name === 'handleClick')).toBe(true);
  });

  it('should extract event parameters from event.getParam() calls', async () => {
    const testFile = join(testDir, 'TestComponent2Controller.js');
    const code = `
({
    handleEvent : function(component, event, helper) {
        var value = event.getParam('value');
        var days = event.getParam('days');
    }
});`;

    await writeFile(testFile, code, 'utf-8');

    const result = await parseControllerJavaScriptFile(testFile);

    const handleEventMethod = result.actionMethods.find(m => m.name === 'handleEvent');
    expect(handleEventMethod).toBeDefined();
    expect(handleEventMethod?.eventParameters).toBeDefined();
    expect(handleEventMethod?.eventParameters?.length).toBeGreaterThanOrEqual(2);
  });

  it('should extract component attribute access from component.get() and component.set() calls', async () => {
    const testFile = join(testDir, 'TestComponent3Controller.js');
    const code = `
({
    updateAttribute : function(component, event, helper) {
        var recordId = component.get('v.recordId');
        component.set('v.selectedId', '456');
    }
});`;

    await writeFile(testFile, code, 'utf-8');

    const result = await parseControllerJavaScriptFile(testFile);

    const updateMethod = result.actionMethods.find(m => m.name === 'updateAttribute');
    expect(updateMethod).toBeDefined();
    expect(updateMethod?.attributeAccess).toBeDefined();
    expect(updateMethod?.attributeAccess?.length).toBeGreaterThanOrEqual(2);
    expect(updateMethod?.attributeAccess?.some(a => a.attributePath === 'v.recordId' && a.accessMethod === 'get')).toBe(true);
    expect(updateMethod?.attributeAccess?.some(a => a.attributePath === 'v.selectedId' && a.accessMethod === 'set')).toBe(true);
  });

  it('should extract helper method calls', async () => {
    const testFile = join(testDir, 'TestComponent4Controller.js');
    const code = `
({
    doAction : function(component, event, helper) {
        helper.getData(component);
        helper.processData(component, event);
    }
});`;

    await writeFile(testFile, code, 'utf-8');

    const result = await parseControllerJavaScriptFile(testFile);

    const doActionMethod = result.actionMethods.find(m => m.name === 'doAction');
    expect(doActionMethod).toBeDefined();
    expect(doActionMethod?.helperCalls).toBeDefined();
    expect(doActionMethod?.helperCalls?.length).toBeGreaterThanOrEqual(2);
    expect(doActionMethod?.helperCalls?.includes('getData')).toBe(true);
    expect(doActionMethod?.helperCalls?.includes('processData')).toBe(true);
  });
});

