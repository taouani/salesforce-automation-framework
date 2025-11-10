/**
 * Tests for Aura markup parser
 */

import { describe, it, expect } from 'vitest';
import { parseAuraMarkup } from '../../src/parser/aura-markup-parser.js';
import { AuraMarkupParseError, AuraStructureError } from '../../src/utils/aura-errors.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('Aura Markup Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-aura-markup');

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

  it('should parse basic .cmp file with attributes and handlers', async () => {
    const testFile = join(testDir, 'TestComponent.cmp');
    const markup = `
<aura:component access="public" implements="flexipage:availableForRecordHome">
    <aura:attribute name="recordId" type="String" access="public"/>
    <aura:attribute name="context" type="Map" access="private" default="{}"/>
    <aura:handler name="init" value="{!this}" action="{!c.initialize}"/>
    <div>Test Content</div>
</aura:component>`;

    await writeFile(testFile, markup, 'utf-8');

    const result = await parseAuraMarkup(testFile);

    expect(result.attributes).toHaveLength(2);
    expect(result.attributes[0].name).toBe('recordId');
    expect(result.attributes[0].type).toBe('String');
    expect(result.attributes[0].access).toBe('public');
    expect(result.handlers).toHaveLength(1);
    expect(result.handlers[0].name).toBe('init');
    expect(result.handlers[0].action).toBe('c.initialize');
    expect(result.implements).toContain('flexipage:availableForRecordHome');
    expect(result.accessLevel).toBe('public');
  });

  it('should extract component references', async () => {
    const testFile = join(testDir, 'TestComponent2.cmp');
    const markup = `
<aura:component access="public">
    <c:CustomComponent attr1="{!v.value1}" attr2="static"/>
    <lightning:button label="Click" onclick="{!c.handleClick}"/>
</aura:component>`;

    await writeFile(testFile, markup, 'utf-8');

    const result = await parseAuraMarkup(testFile);

    expect(result.componentReferences.length).toBeGreaterThan(0);
  });

  it('should extract data bindings', async () => {
    const testFile = join(testDir, 'TestComponent3.cmp');
    const markup = `
<aura:component access="public">
    <aura:attribute name="recordId" type="String"/>
    <div>{!v.recordId}</div>
    <lightning:input value="{!v.recordId}"/>
</aura:component>`;

    await writeFile(testFile, markup, 'utf-8');

    const result = await parseAuraMarkup(testFile);

    expect(result.bindings.length).toBeGreaterThan(0);
    expect(result.bindings.some(b => b.attributePath.includes('recordId'))).toBe(true);
  });

  it('should extract conditional rendering', async () => {
    const testFile = join(testDir, 'TestComponent4.cmp');
    const markup = `
<aura:component access="public">
    <aura:if isTrue="{!v.showContent}">
        <div>Content</div>
    </aura:if>
    <aura:iteration items="{!v.items}" var="item">
        <div>{!item}</div>
    </aura:iteration>
</aura:component>`;

    await writeFile(testFile, markup, 'utf-8');

    const result = await parseAuraMarkup(testFile);

    expect(result.conditionalRendering.length).toBeGreaterThan(0);
  });

  it('should throw AuraStructureError for missing aura:component', async () => {
    const testFile = join(testDir, 'InvalidComponent.cmp');
    const markup = '<div>No aura:component</div>';

    await writeFile(testFile, markup, 'utf-8');

    await expect(parseAuraMarkup(testFile)).rejects.toThrow(AuraStructureError);
  });

  it('should extract events', async () => {
    const testFile = join(testDir, 'TestComponent5.cmp');
    const markup = `
<aura:component access="public">
    <aura:registerEvent name="customEvent" type="c:CustomEventType"/>
</aura:component>`;

    await writeFile(testFile, markup, 'utf-8');

    const result = await parseAuraMarkup(testFile);

    expect(result.events).toHaveLength(1);
    expect(result.events[0].name).toBe('customEvent');
  });
});

