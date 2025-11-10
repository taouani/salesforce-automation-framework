/**
 * Tests for HTML template parser
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseHTMLTemplate } from '../../src/parser/html-parser.js';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

describe('HTML Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-html-parser');

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

  it('should parse Lightning components', async () => {
    const html = '<lightning-button label="Click Me" onclick={handleClick}></lightning-button>';
    const filePath = join(testDir, 'test.html');
    await writeFile(filePath, html, 'utf-8');
    
    const result = await parseHTMLTemplate(filePath);
    expect(result.elements).toBeDefined();
    const lightningElement = result.elements.find(e => e.isLightningComponent);
    expect(lightningElement).toBeDefined();
    expect(lightningElement?.tagName).toBe('lightning-button');
  });

  it('should parse data bindings', async () => {
    const html = '<div>{recordName}</div>';
    const filePath = join(testDir, 'test.html');
    await writeFile(filePath, html, 'utf-8');
    
    const result = await parseHTMLTemplate(filePath);
    expect(result.bindings).toBeDefined();
    expect(result.bindings.length).toBeGreaterThan(0);
  });

  it('should parse directives', async () => {
    const html = '<template if:true={showContent}>Content</template>';
    const filePath = join(testDir, 'test.html');
    await writeFile(filePath, html, 'utf-8');
    
    const result = await parseHTMLTemplate(filePath);
    expect(result.directives).toBeDefined();
    const directive = result.directives.find(d => d.type === 'if');
    expect(directive).toBeDefined();
  });
});

