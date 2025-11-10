/**
 * Integration module for parsing all Flow files in a directory
 */

import { scanDirectory, processFilesInParallel } from '../scanner/file-scanner.js';
import { logger } from '../utils/logger.js';
import { parseFlowXML } from './flow-parser.js';
import { FlowDependencyGraphImpl } from './flow-dependency-graph.js';
import { FlowToObjectDependencyGraphImpl } from './flow-dependency-graph.js';
import { ParsedFlowResultsImpl } from './flow-results.js';
import type { FlowDefinition } from '../types/flow-parsed.js';

/**
 * Options for parsing Flow files
 */
export interface ParseFlowOptions {
  metadataPath: string;
  concurrency?: number;
}

/**
 * Result of parsing Flow files
 */
export interface ParseFlowResult {
  flows: FlowDefinition[];
  errors: number;
  warnings: number;
  results: ParsedFlowResultsImpl; // Include the results object for saving
}

/**
 * Extracts object references from Flow elements and maps relationships
 */
function extractAndMapRelationships(
  flowName: string,
  flow: FlowDefinition,
  dependencyGraph: FlowDependencyGraphImpl,
  flowToObjectGraph: FlowToObjectDependencyGraphImpl
): void {
  // Extract subflow relationships
  flow.elements.forEach((element) => {
    if (element.type === 'Subflow' && element.properties?.flowName) {
      const subflowName = element.properties.flowName as string;
      dependencyGraph.addDependency(flowName, subflowName);
    }
  });

  // Extract object relationships from record operations
  flow.elements.forEach((element) => {
    if (element.type === 'RecordLookup' && element.properties?.object) {
      const objectName = element.properties.object as string;
      flowToObjectGraph.addRelationship(flowName, objectName, 'query');
    } else if (element.type === 'RecordCreate' && element.properties?.object) {
      const objectName = element.properties.object as string;
      flowToObjectGraph.addRelationship(flowName, objectName, 'create');
    } else if (element.type === 'RecordUpdate' && element.properties?.object) {
      const objectName = element.properties.object as string;
      flowToObjectGraph.addRelationship(flowName, objectName, 'update');
    } else if (element.type === 'RecordDelete' && element.properties?.object) {
      const objectName = element.properties.object as string;
      flowToObjectGraph.addRelationship(flowName, objectName, 'delete');
    }
  });

  // Extract object references from variables
  if (flow.variables) {
    flow.variables.forEach((variable) => {
      if (variable.dataType === 'SObject' && variable.objectType) {
        const objectName = variable.objectType as string;
        flowToObjectGraph.addRelationship(flowName, objectName, 'fieldReference');
      }
    });
  }
}

/**
 * Parses all Flow files in a directory
 */
export async function parseAllFlowFiles(options: ParseFlowOptions): Promise<ParseFlowResult> {
  const { metadataPath, concurrency = 10 } = options;
  
  logger.info({ metadataPath }, 'Starting Flow file parsing');

  // Discover Flow files
  const scanResult = await scanDirectory({
    path: metadataPath,
    includePatterns: ['**/*.flow-meta.xml'],
  });

  logger.debug({ flowCount: scanResult.files.length }, 'Found Flow files');

  const dependencyGraph = new FlowDependencyGraphImpl();
  const flowToObjectGraph = new FlowToObjectDependencyGraphImpl();
  const results = new ParsedFlowResultsImpl();
  results.dependencyGraph = dependencyGraph;
  results.flowToObjectGraph = flowToObjectGraph;

  let parsedCount = 0;
  let errorCount = 0;
  let warningCount = 0;

  // Parse flows in parallel
  await processFilesInParallel(
    scanResult.files,
    async (filePath) => {
      try {
        const flow = await parseFlowXML(filePath);
        results.addFlow(flow);
        
        // Extract relationships
        extractAndMapRelationships(flow.name, flow, dependencyGraph, flowToObjectGraph);
        
        parsedCount++;
        return flow;
      } catch (error) {
        warningCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn({ filePath, error: errorMessage }, 'Failed to parse Flow file');
        return null;
      }
    },
    concurrency
  );

  logger.info(
    {
      parsed: parsedCount,
      errors: errorCount,
      warnings: warningCount,
    },
    'Flow file parsing completed'
  );

  return {
    flows: results.getAllFlows(),
    errors: errorCount,
    warnings: warningCount,
    results,
  };
}

