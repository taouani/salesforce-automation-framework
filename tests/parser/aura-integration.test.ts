/**
 * Integration tests for the Aura Component Parser
 * Tests end-to-end parsing of Aura components with real files
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { parseAllAuraComponents } from '../../src/parser/aura-parser-integration.js';
import { saveParsedAuraResults } from '../../src/parser/aura-results-persistence.js';
import { parseAuraComponentBundle } from '../../src/parser/aura-component-bundle-parser.js';
import { existsSync } from 'fs';
import { join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';

const TEST_OUTPUT_DIR = join(process.cwd(), 'tests', 'output', 'aura-integration');

describe('Aura Component Parser - Integration Tests', () => {
  beforeAll(async () => {
    // Ensure test output directory exists
    if (!existsSync(TEST_OUTPUT_DIR)) {
      await mkdir(TEST_OUTPUT_DIR, { recursive: true });
    }
  });

  describe('End-to-End Parsing', () => {
    it('should parse a complete Aura component bundle', async () => {
      // Create a test component bundle
      const testComponentDir = join(TEST_OUTPUT_DIR, 'TestComponent');
      await mkdir(testComponentDir, { recursive: true });

      // Create .cmp file
      await writeFile(
        join(testComponentDir, 'TestComponent.cmp'),
        `<aura:component implements="flexipage:availableForAllPageTypes">
          <aura:attribute name="message" type="String" default="Hello" />
          <aura:attribute name="count" type="Integer" default="0" />
          <aura:handler name="init" value="{!this}" action="{!c.doInit}" />
          <div class="container">
            <h1>{!v.message}</h1>
            <p>Count: {!v.count}</p>
            <lightning:button label="Click Me" onclick="{!c.handleClick}" />
            <c:ChildComponent message="{!v.message}" />
          </div>
        </aura:component>`
      );

      // Create Controller.js file
      await writeFile(
        join(testComponentDir, 'TestComponentController.js'),
        `({
          doInit: function(component, event, helper) {
            var msg = component.get("v.message");
            helper.loadData(component);
            component.set("v.count", 1);
          },
          handleClick: function(component, event, helper) {
            var currentCount = component.get("v.count");
            component.set("v.count", currentCount + 1);
            component.getEvent("countChanged").setParams({ count: currentCount + 1 }).fire();
          }
        })`
      );

      // Create Helper.js file
      await writeFile(
        join(testComponentDir, 'TestComponentHelper.js'),
        `({
          loadData: function(component) {
            var action = component.get("c.getData");
            action.setParams({ recordId: component.get("v.recordId") });
            action.setCallback(this, function(response) {
              if (response.getState() === "SUCCESS") {
                component.set("v.data", response.getReturnValue());
              }
            });
            $A.enqueueAction(action);
          },
          formatData: function(data) {
            return data.map(item => item.Name).join(", ");
          }
        })`
      );

      // Create .css file
      await writeFile(
        join(testComponentDir, 'TestComponent.css'),
        `.THIS .container {
          padding: 1rem;
          background-color: #f4f4f4;
        }
        .THIS h1 {
          color: #333;
          font-size: 2rem;
        }`
      );

      // Create metadata file
      await writeFile(
        join(testComponentDir, 'TestComponent.cmp-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
          <description>Test Component for Integration Testing</description>
        </AuraDefinitionBundle>`
      );

      // Parse the component bundle
      const result = await parseAuraComponentBundle(testComponentDir);

      // Verify parsing results
      expect(result).toBeDefined();
      expect(result.name).toBe('TestComponent');
      expect(result.markup).toBeDefined();
      expect(result.markup?.attributes).toHaveLength(2);
      expect(result.markup?.handlers).toHaveLength(1);
      expect(result.markup?.componentReferences).toContain('c:ChildComponent');
      expect(result.controller).toBeDefined();
      expect(result.controller?.methods).toHaveLength(2);
      expect(result.helper).toBeDefined();
      expect(result.helper?.functions).toHaveLength(2);
      expect(result.css).toBeDefined();
      expect(result.css?.selectors).toContain('.THIS .container');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.apiVersion).toBe('58.0');

      // Cleanup
      await rm(testComponentDir, { recursive: true, force: true });
    });

    it('should parse multiple component bundles', async () => {
      // Create two test component bundles
      const testDir = join(TEST_OUTPUT_DIR, 'MultipleComponents');
      await mkdir(testDir, { recursive: true });

      // Component 1
      const comp1Dir = join(testDir, 'Component1');
      await mkdir(comp1Dir, { recursive: true });
      await writeFile(
        join(comp1Dir, 'Component1.cmp'),
        `<aura:component>
          <aura:attribute name="value" type="String" />
          <div>{!v.value}</div>
        </aura:component>`
      );
      await writeFile(
        join(comp1Dir, 'Component1.cmp-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
        </AuraDefinitionBundle>`
      );

      // Component 2
      const comp2Dir = join(testDir, 'Component2');
      await mkdir(comp2Dir, { recursive: true });
      await writeFile(
        join(comp2Dir, 'Component2.cmp'),
        `<aura:component>
          <aura:attribute name="data" type="Object" />
          <c:Component1 value="{!v.data.name}" />
        </aura:component>`
      );
      await writeFile(
        join(comp2Dir, 'Component2.cmp-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
        </AuraDefinitionBundle>`
      );

      // Parse all components
      const results = await parseAllAuraComponents(testDir);

      // Verify results
      expect(results).toBeDefined();
      expect(results.components.size).toBe(2);
      expect(results.components.has('Component1')).toBe(true);
      expect(results.components.has('Component2')).toBe(true);

      // Verify dependency graph
      const comp2 = results.components.get('Component2');
      expect(comp2).toBeDefined();
      expect(comp2?.markup?.componentReferences).toContain('c:Component1');

      // Cleanup
      await rm(testDir, { recursive: true, force: true });
    });

    it('should handle components with Renderer files', async () => {
      const testComponentDir = join(TEST_OUTPUT_DIR, 'RendererComponent');
      await mkdir(testComponentDir, { recursive: true });

      await writeFile(
        join(testComponentDir, 'RendererComponent.cmp'),
        `<aura:component>
          <div id="customDiv"></div>
        </aura:component>`
      );

      await writeFile(
        join(testComponentDir, 'RendererComponentRenderer.js'),
        `({
          render: function(component, helper) {
            var div = document.createElement('div');
            div.className = 'custom-render';
            div.textContent = 'Rendered Content';
            return div;
          },
          afterRender: function(component, helper) {
            this.superAfterRender();
            var element = component.getElement();
            element.addEventListener('click', function() {
              console.log('Clicked');
            });
          }
        })`
      );

      await writeFile(
        join(testComponentDir, 'RendererComponent.cmp-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
        </AuraDefinitionBundle>`
      );

      const result = await parseAuraComponentBundle(testComponentDir);

      expect(result).toBeDefined();
      expect(result.renderer).toBeDefined();
      expect(result.renderer?.methods).toHaveLength(2);
      expect(result.renderer?.methods.some(m => m.name === 'render')).toBe(true);
      expect(result.renderer?.methods.some(m => m.name === 'afterRender')).toBe(true);

      // Cleanup
      await rm(testComponentDir, { recursive: true, force: true });
    });

    it('should parse Aura application files', async () => {
      const testAppDir = join(TEST_OUTPUT_DIR, 'TestApp');
      await mkdir(testAppDir, { recursive: true });

      await writeFile(
        join(testAppDir, 'TestApp.app'),
        `<aura:application extends="force:slds">
          <aura:dependency resource="c:Component1" />
          <aura:dependency resource="c:Component2" />
          <div class="app-container">
            <c:Component1 />
            <c:Component2 />
          </div>
        </aura:application>`
      );

      await writeFile(
        join(testAppDir, 'TestApp.app-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
          <description>Test Application</description>
        </AuraDefinitionBundle>`
      );

      const result = await parseAuraComponentBundle(testAppDir);

      expect(result).toBeDefined();
      expect(result.application).toBeDefined();
      expect(result.application?.extends).toBe('force:slds');
      expect(result.application?.dependencies).toHaveLength(2);

      // Cleanup
      await rm(testAppDir, { recursive: true, force: true });
    });

    it('should save parsed results to JSON', async () => {
      const testComponentDir = join(TEST_OUTPUT_DIR, 'SaveTest');
      await mkdir(testComponentDir, { recursive: true });

      await writeFile(
        join(testComponentDir, 'SaveTest.cmp'),
        `<aura:component>
          <aura:attribute name="test" type="String" />
        </aura:component>`
      );

      await writeFile(
        join(testComponentDir, 'SaveTest.cmp-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
        </AuraDefinitionBundle>`
      );

      const results = await parseAllAuraComponents(testComponentDir);
      const outputPath = join(TEST_OUTPUT_DIR, 'saved-results.json');
      
      await saveParsedAuraResults(results, outputPath);

      expect(existsSync(outputPath)).toBe(true);

      // Cleanup
      await rm(testComponentDir, { recursive: true, force: true });
      await rm(outputPath, { force: true });
    });
  });

  describe('Dependency Graph Building', () => {
    it('should build component-to-component dependency graph', async () => {
      const testDir = join(TEST_OUTPUT_DIR, 'DependencyTest');
      await mkdir(testDir, { recursive: true });

      // Parent component
      const parentDir = join(testDir, 'ParentComponent');
      await mkdir(parentDir, { recursive: true });
      await writeFile(
        join(parentDir, 'ParentComponent.cmp'),
        `<aura:component>
          <c:ChildComponent1 />
          <c:ChildComponent2 />
        </aura:component>`
      );
      await writeFile(
        join(parentDir, 'ParentComponent.cmp-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
        </AuraDefinitionBundle>`
      );

      // Child components
      const child1Dir = join(testDir, 'ChildComponent1');
      await mkdir(child1Dir, { recursive: true });
      await writeFile(
        join(child1Dir, 'ChildComponent1.cmp'),
        `<aura:component><div>Child 1</div></aura:component>`
      );
      await writeFile(
        join(child1Dir, 'ChildComponent1.cmp-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
        </AuraDefinitionBundle>`
      );

      const child2Dir = join(testDir, 'ChildComponent2');
      await mkdir(child2Dir, { recursive: true });
      await writeFile(
        join(child2Dir, 'ChildComponent2.cmp'),
        `<aura:component><div>Child 2</div></aura:component>`
      );
      await writeFile(
        join(child2Dir, 'ChildComponent2.cmp-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
        </AuraDefinitionBundle>`
      );

      const results = await parseAllAuraComponents(testDir);

      // Verify dependency graph
      const dependencies = results.dependencyGraph.getDependencies('ParentComponent');
      expect(dependencies).toContain('c:ChildComponent1');
      expect(dependencies).toContain('c:ChildComponent2');

      // Cleanup
      await rm(testDir, { recursive: true, force: true });
    });

    it('should build component-to-Apex dependency graph', async () => {
      const testComponentDir = join(TEST_OUTPUT_DIR, 'ApexDependencyTest');
      await mkdir(testComponentDir, { recursive: true });

      await writeFile(
        join(testComponentDir, 'ApexDependencyTest.cmp'),
        `<aura:component controller="MyApexController">
          <aura:attribute name="data" type="Object" />
        </aura:component>`
      );

      await writeFile(
        join(testComponentDir, 'ApexDependencyTestHelper.js'),
        `({
          loadData: function(component) {
            var action = component.get("c.getData");
            $A.enqueueAction(action);
          }
        })`
      );

      await writeFile(
        join(testComponentDir, 'ApexDependencyTest.cmp-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
        </AuraDefinitionBundle>`
      );

      const results = await parseAllAuraComponents(testComponentDir);

      // Verify Apex dependency graph
      const apexDeps = results.apexDependencyGraph.getDependencies('ApexDependencyTest');
      expect(apexDeps.length).toBeGreaterThan(0);

      // Cleanup
      await rm(testComponentDir, { recursive: true, force: true });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing files gracefully', async () => {
      const testComponentDir = join(TEST_OUTPUT_DIR, 'MissingFiles');
      await mkdir(testComponentDir, { recursive: true });

      // Only create .cmp file, no metadata
      await writeFile(
        join(testComponentDir, 'MissingFiles.cmp'),
        `<aura:component><div>Test</div></aura:component>`
      );

      // Should still parse without metadata
      const result = await parseAuraComponentBundle(testComponentDir);
      expect(result).toBeDefined();
      expect(result.markup).toBeDefined();
      expect(result.metadata).toBeUndefined();

      // Cleanup
      await rm(testComponentDir, { recursive: true, force: true });
    });

    it('should handle malformed XML gracefully', async () => {
      const testComponentDir = join(TEST_OUTPUT_DIR, 'MalformedXML');
      await mkdir(testComponentDir, { recursive: true });

      await writeFile(
        join(testComponentDir, 'MalformedXML.cmp'),
        `<aura:component>
          <div>Unclosed tag
        </aura:component>`
      );

      await writeFile(
        join(testComponentDir, 'MalformedXML.cmp-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
        </AuraDefinitionBundle>`
      );

      // Should throw an error
      await expect(parseAuraComponentBundle(testComponentDir)).rejects.toThrow();

      // Cleanup
      await rm(testComponentDir, { recursive: true, force: true });
    });

    it('should handle JavaScript syntax errors gracefully', async () => {
      const testComponentDir = join(TEST_OUTPUT_DIR, 'JSError');
      await mkdir(testComponentDir, { recursive: true });

      await writeFile(
        join(testComponentDir, 'JSError.cmp'),
        `<aura:component><div>Test</div></aura:component>`
      );

      await writeFile(
        join(testComponentDir, 'JSErrorController.js'),
        `({
          method: function(component) {
            var x = ; // Syntax error
          }
        })`
      );

      await writeFile(
        join(testComponentDir, 'JSError.cmp-meta.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
        <AuraDefinitionBundle xmlns="http://soap.sforce.com/2006/04/metadata">
          <apiVersion>58.0</apiVersion>
        </AuraDefinitionBundle>`
      );

      // Should throw an error
      await expect(parseAuraComponentBundle(testComponentDir)).rejects.toThrow();

      // Cleanup
      await rm(testComponentDir, { recursive: true, force: true });
    });
  });
});

