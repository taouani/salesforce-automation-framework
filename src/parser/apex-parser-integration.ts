/**
 * Integration module for parsing all Apex classes and triggers in a directory
 */

import { scanDirectory, processFilesInParallel } from '../scanner/file-scanner.js';
import { logger } from '../utils/logger.js';
import { parseApexClassCode } from './apex-class-parser.js';
import { parseApexTriggerCode } from './apex-trigger-parser.js';
import { extractSOQLQueries } from './soql-parser.js';
import { extractDMLOperations } from './dml-parser.js';
import { ApexToObjectDependencyGraphImpl } from './apex-dependency-graph.js';
import { ParsedApexResultsImpl } from './apex-results.js';
import { readFile } from 'fs/promises';
import type { ApexClassDefinition, ApexTriggerDefinition } from '../types/apex-parsed.js';

/**
 * Options for parsing Apex files
 */
export interface ParseApexOptions {
  metadataPath: string;
  concurrency?: number;
}

/**
 * Result of parsing Apex files
 */
export interface ParseApexResult {
  classes: ApexClassDefinition[];
  triggers: ApexTriggerDefinition[];
  errors: number;
  warnings: number;
  results: ParsedApexResultsImpl; // Include the results object for saving
}

/**
 * Parses all Apex classes and triggers in a directory
 */
export async function parseAllApexFiles(options: ParseApexOptions): Promise<ParseApexResult> {
  // Increase default concurrency for better performance with large file sets
  const { metadataPath, concurrency = 20 } = options;
  
  logger.info({ metadataPath }, 'Starting Apex file parsing');

  // Discover Apex files
  const scanResult = await scanDirectory({
    path: metadataPath,
    includePatterns: ['**/*.cls', '**/*.trigger'],
  });

  // Separate classes and triggers
  const classFiles = scanResult.files.filter((file) => file.endsWith('.cls'));
  const triggerFiles = scanResult.files.filter((file) => file.endsWith('.trigger'));
  
  logger.debug({ classCount: classFiles.length, triggerCount: triggerFiles.length }, 'Found Apex files');

  const dependencyGraph = new ApexToObjectDependencyGraphImpl();
  const results = new ParsedApexResultsImpl();

  let parsedClassCount = 0;
  let parsedTriggerCount = 0;
  let errorCount = 0;
  let warningCount = 0;

  // Parse classes in parallel - read file once and reuse code
  await processFilesInParallel(
    classFiles,
    async (filePath) => {
      try {
        // Read file once
        const code = await readFile(filePath, 'utf-8');
        
        // Parse class structure
        const apexClass = parseApexClassCode(code, filePath);
        results.addClass(apexClass);
        
        // Extract SOQL queries and DML operations from the same code
        extractAndMapRelationships(apexClass.name, code, dependencyGraph);
        
        parsedClassCount++;
        return apexClass;
      } catch (error) {
        warningCount++;
        // Only log if it's not a common parsing issue (like missing class declaration)
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('Could not find class declaration')) {
          logger.warn({ filePath, error: errorMessage }, 'Failed to parse Apex class');
        }
        return null;
      }
    },
    concurrency
  );

  // Parse triggers in parallel - read file once and reuse code
  await processFilesInParallel(
    triggerFiles,
    async (filePath) => {
      try {
        // Read file once
        const code = await readFile(filePath, 'utf-8');
        
        // Parse trigger structure
        const trigger = parseApexTriggerCode(code, filePath);
        results.addTrigger(trigger);
        
        // Map trigger to objects
        for (const objectName of trigger.objects) {
          dependencyGraph.addRelationship(
            trigger.name,
            objectName,
            'trigger',
            { events: trigger.events }
          );
        }
        
        // Extract DML operations from the same code
        extractAndMapRelationships(trigger.name, code, dependencyGraph);
        
        parsedTriggerCount++;
        return trigger;
      } catch (error) {
        warningCount++;
        // Only log if it's not a common parsing issue
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('Could not find trigger declaration')) {
          logger.warn({ filePath, error: errorMessage }, 'Failed to parse Apex trigger');
        }
        return null;
      }
    },
    concurrency
  );

  // Set dependency graph in results
  results.dependencyGraph = dependencyGraph;

  logger.info(
    {
      classes: parsedClassCount,
      triggers: parsedTriggerCount,
      errors: errorCount,
      warnings: warningCount,
    },
    'Apex file parsing completed'
  );

  return {
    classes: results.getAllClasses(),
    triggers: results.getAllTriggers(),
    errors: errorCount,
    warnings: warningCount,
    results, // Return the results object so it can be used for saving
  };
}

/**
 * Extracts SOQL queries and DML operations and maps relationships
 * Optimized to avoid expensive regex operations
 */
function extractAndMapRelationships(
  apexName: string,
  code: string,
  dependencyGraph: ApexToObjectDependencyGraphImpl
): void {
  // Extract SOQL queries
  const soqlQueries = extractSOQLQueries(code, apexName);
  for (const query of soqlQueries) {
    if (query.object) {
      dependencyGraph.addRelationship(
        apexName,
        query.object,
        'SOQL',
        { queryString: query.queryString }
      );
    }
  }

  // Extract DML operations
  const dmlOperations = extractDMLOperations(code, apexName);
  for (const dml of dmlOperations) {
    if (dml.objects && dml.objects.length > 0) {
      for (const objectName of dml.objects) {
        dependencyGraph.addRelationship(
          apexName,
          objectName,
          'DML',
          { operationType: dml.operationType }
        );
      }
    }
  }

  // Skip expensive method parameter extraction for performance
  // This was causing significant slowdown and produces many false positives
  // SOQL and DML extraction already covers most object relationships
}

