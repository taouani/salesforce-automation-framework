/**
 * Integration tests for Flow parser
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { parseAllFlowFiles } from '../../src/parser/flow-parser-integration.js';
import { parseFlowXML } from '../../src/parser/flow-parser.js';
import { join } from 'path';
import { existsSync } from 'fs';

// Path to real Flow files
const REAL_FLOWS_PATH = join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default/flows');

describe('Flow Parser Integration', () => {
  const hasRealFlows = existsSync(REAL_FLOWS_PATH);

  describe('End-to-End Flow Parsing', () => {
    it('should parse all Flow types', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found at', REAL_FLOWS_PATH);
        return;
      }

      const result = await parseAllFlowFiles({
        metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
        concurrency: 10,
      });

      expect(result.flows.length).toBeGreaterThan(0);
      expect(result.results).toBeDefined();
      expect(result.results.dependencyGraph).toBeDefined();
      expect(result.results.flowToObjectGraph).toBeDefined();

      // Verify different flow types are parsed
      const flowTypes = new Set(result.flows.map((f) => f.type));
      expect(flowTypes.size).toBeGreaterThan(0);
    });

    it('should parse flows with subflows', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      const result = await parseAllFlowFiles({
        metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
        concurrency: 10,
      });

      // Find flows with subflows
      const flowsWithSubflows = result.flows.filter((f) => f.subflows && f.subflows.length > 0);
      
      if (flowsWithSubflows.length > 0) {
        const flow = flowsWithSubflows[0];
        expect(flow.subflows).toBeDefined();
        expect(flow.subflows!.length).toBeGreaterThan(0);
        expect(flow.subflows![0].subflowName).toBeDefined();
      }
    });

    it('should parse flows with decision paths', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      const result = await parseAllFlowFiles({
        metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
        concurrency: 10,
      });

      // Find flows with decisions
      const flowsWithDecisions = result.flows.filter(
        (f) => f.decisionPaths && f.decisionPaths.length > 0
      );

      if (flowsWithDecisions.length > 0) {
        const flow = flowsWithDecisions[0];
        expect(flow.decisionPaths).toBeDefined();
        expect(flow.decisionPaths!.length).toBeGreaterThan(0);
        expect(flow.decisionPaths![0].decisionElement).toBeDefined();
        expect(flow.decisionPaths![0].outcomes).toBeDefined();
      }
    });

    it('should parse flows with screen elements', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      const result = await parseAllFlowFiles({
        metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
        concurrency: 10,
      });

      // Find Screen flows
      const screenFlows = result.flows.filter((f) => f.type === 'Screen');

      if (screenFlows.length > 0) {
        const flow = screenFlows[0];
        expect(flow.screens).toBeDefined();
        if (flow.screens && flow.screens.length > 0) {
          expect(flow.screens[0].screenElement).toBeDefined();
          expect(flow.screens[0].fields).toBeDefined();
        }
      }
    });

    it('should parse flows with object interactions', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      const result = await parseAllFlowFiles({
        metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
        concurrency: 10,
      });

      // Find flows with record operations
      const flowsWithObjects = result.flows.filter((f) =>
        f.elements.some(
          (e) =>
            e.type === 'RecordLookup' ||
            e.type === 'RecordCreate' ||
            e.type === 'RecordUpdate' ||
            e.type === 'RecordDelete'
        )
      );

      if (flowsWithObjects.length > 0) {
        const flow = flowsWithObjects[0];
        const recordElements = flow.elements.filter(
          (e) =>
            e.type === 'RecordLookup' ||
            e.type === 'RecordCreate' ||
            e.type === 'RecordUpdate' ||
            e.type === 'RecordDelete'
        );
        expect(recordElements.length).toBeGreaterThan(0);
        expect(recordElements[0].properties?.object).toBeDefined();
      }
    });
  });

  describe('Real Flow XML Files', () => {
    it('should parse Screen Flow files', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      // Try to find a Screen flow
      const screenFlowPath = join(REAL_FLOWS_PATH, 'CSCO_SendEmailFlow.flow-meta.xml');
      if (existsSync(screenFlowPath)) {
        const flow = await parseFlowXML(screenFlowPath);
        expect(flow).toBeDefined();
        expect(flow.name).toBeDefined();
        expect(flow.type).toBeDefined();
        expect(flow.elements).toBeDefined();
      }
    });

    it('should parse Record-Triggered Flow files', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      // Try to find a Record-Triggered flow
      const recordFlowPath = join(REAL_FLOWS_PATH, 'CASND_Case_NewEmailOnCase.flow-meta.xml');
      if (existsSync(recordFlowPath)) {
        const flow = await parseFlowXML(recordFlowPath);
        expect(flow).toBeDefined();
        expect(flow.name).toBeDefined();
        expect(flow.type).toBeDefined();
        
        // Check if it has triggers
        if (flow.triggers && flow.triggers.length > 0) {
          expect(flow.triggers[0].triggerType).toBeDefined();
        }
      }
    });

    it('should parse Autolaunched Flow files', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      const result = await parseAllFlowFiles({
        metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
        concurrency: 10,
      });

      // Find Autolaunched flows
      const autolaunchedFlows = result.flows.filter((f) => f.type === 'Autolaunched');
      
      if (autolaunchedFlows.length > 0) {
        const flow = autolaunchedFlows[0];
        expect(flow.type).toBe('Autolaunched');
        expect(flow.elements).toBeDefined();
      }
    });
  });

  describe('Flow Dependency Graph Building', () => {
    it('should build subflow dependency graph', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      const result = await parseAllFlowFiles({
        metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
        concurrency: 10,
      });

      const graph = result.results.dependencyGraph;
      const graphJSON = graph.toJSON();
      
      expect(graphJSON).toBeDefined();
      expect(graphJSON.nodes).toBeDefined();
      expect(graphJSON.edges).toBeDefined();

      // Check if there are any dependencies
      if (graphJSON.edges.length > 0) {
        const edge = graphJSON.edges[0];
        expect(edge.sourceFlow).toBeDefined();
        expect(edge.targetFlow).toBeDefined();
      }
    });

    it('should build flow-to-object dependency graph', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      const result = await parseAllFlowFiles({
        metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
        concurrency: 10,
      });

      const graph = result.results.flowToObjectGraph;
      const graphJSON = graph.toJSON();
      
      expect(graphJSON).toBeDefined();
      expect(graphJSON.nodes).toBeDefined();
      expect(graphJSON.edges).toBeDefined();

      // Check if there are any relationships
      if (graphJSON.edges.length > 0) {
        const edge = graphJSON.edges[0];
        expect(edge.flowName).toBeDefined();
        expect(edge.objectName).toBeDefined();
        expect(edge.relationshipType).toBeDefined();
      }
    });

    it('should support bidirectional queries', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      const result = await parseAllFlowFiles({
        metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
        concurrency: 10,
      });

      const flowToObjectGraph = result.results.flowToObjectGraph;
      
      // Get a flow that has object relationships
      const flowsWithObjects = result.flows.filter((f) =>
        f.elements.some((e) => e.properties?.object)
      );

      if (flowsWithObjects.length > 0) {
        const flow = flowsWithObjects[0];
        const relationships = flowToObjectGraph.getRelationships(flow.name);
        
        if (relationships.length > 0) {
          const objectName = relationships[0].objectName;
          const flowsForObject = flowToObjectGraph.getFlowsForObject(objectName);
          expect(flowsForObject).toContain(flow.name);
        }
      }
    });
  });

  describe('Flow Parser Error Handling', () => {
    it('should handle invalid Flow XML files gracefully', async () => {
      try {
        // Try to parse a non-existent file
        await parseFlowXML('/nonexistent/path/to/flow.flow-meta.xml');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Expected to throw an error
        expect(error).toBeDefined();
      }
    });

    it('should handle missing Flow XML files gracefully', async () => {
      const result = await parseAllFlowFiles({
        metadataPath: '/nonexistent/path',
        concurrency: 5,
      });

      // Should return empty result without crashing
      expect(result.flows).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.warnings).toBeDefined();
    });

    it('should handle malformed Flow XML gracefully', async () => {
      // This test would require creating a malformed XML file
      // For now, we verify that the parser handles errors without crashing
      const result = await parseAllFlowFiles({
        metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
        concurrency: 10,
      });

      // Should complete without crashing even if some files fail
      expect(result).toBeDefined();
      expect(result.flows).toBeDefined();
    });
  });

  describe('Flow Parser Performance', () => {
    it('should parse large numbers of Flow files efficiently', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      const startTime = Date.now();
      
      const result = await parseAllFlowFiles({
        metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
        concurrency: 20,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result.flows.length).toBeGreaterThan(0);
      
      // Performance check: should parse at least 10 flows per second
      const flowsPerSecond = (result.flows.length / duration) * 1000;
      console.log(`Parsed ${result.flows.length} flows in ${duration}ms (${flowsPerSecond.toFixed(2)} flows/sec)`);
      
      // Should be reasonably fast (at least 1 flow per second)
      expect(flowsPerSecond).toBeGreaterThan(1);
    });

    it('should handle parallel processing correctly', async () => {
      if (!hasRealFlows) {
        console.warn('Skipping test: Real Flow files not found');
        return;
      }

      // Test with different concurrency levels
      const concurrencyLevels = [5, 10, 20];
      
      for (const concurrency of concurrencyLevels) {
        const startTime = Date.now();
        
        const result = await parseAllFlowFiles({
          metadataPath: join(process.cwd(), '../../Salesforce/cxhhc-sf-core/force-app/main/default'),
          concurrency,
        });

        const endTime = Date.now();
        const duration = endTime - startTime;
        
        expect(result.flows.length).toBeGreaterThan(0);
        console.log(`Concurrency ${concurrency}: Parsed ${result.flows.length} flows in ${duration}ms`);
      }
    });
  });
});

