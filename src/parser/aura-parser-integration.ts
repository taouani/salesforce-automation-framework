/**
 * Integration module for parsing all Aura component files in a directory
 */

import { scanDirectory, processFilesInParallel } from '../scanner/file-scanner.js';
import { logger } from '../utils/logger.js';
import { parseAuraComponentBundle } from './aura-component-bundle-parser.js';
import { parseAuraApplication } from './aura-application-parser.js';
import { ParsedAuraResultsImpl } from './aura-results.js';
import type { AuraComponentDefinition, ApplicationDefinition } from '../types/aura-parsed.js';
import { dirname } from 'path';
import type { AuraToObjectRelationshipType, AuraToApexRelationshipType } from '../types/aura-dependency-graph.js';

/**
 * Extracts dependencies and builds dependency graphs
 */
function extractAndMapDependencies(
  component: AuraComponentDefinition | ApplicationDefinition,
  results: ParsedAuraResultsImpl
): void {
  const componentName = component.metadata.name;

  // Extract Aura-to-Aura dependencies from markup
  if (component.markup?.componentReferences) {
    component.markup.componentReferences.forEach((ref) => {
      if (ref.isCustomAuraComponent) {
        results.auraDependencyGraph.addDependency(componentName, ref.componentName, 'markup');
      }
    });
  }

  // Extract Aura-to-Aura dependencies from applications
  if (component.type === 'Application' && 'componentDependencies' in component) {
    const app = component as ApplicationDefinition;
    if (app.componentDependencies) {
      app.componentDependencies.forEach((dep) => {
        results.auraDependencyGraph.addDependency(componentName, dep.componentName, 'application');
      });
    }
  }

  // Extract Aura-to-Object dependencies from attributes
  if (component.markup?.attributes) {
    component.markup.attributes.forEach((attr) => {
      // Check if attribute type is an SObject
      if (attr.type && (attr.type.includes('SObject') || attr.type.includes('Object'))) {
        // Try to extract object name from type (e.g., "Account" from "SObject" or "Account__c")
        const objectName = attr.type.replace(/^SObject$/, '').replace(/__c$/, '').trim();
        if (objectName) {
          results.auraToObjectDependencyGraph.addRelationship(
            componentName,
            objectName,
            'attribute' as AuraToObjectRelationshipType
          );
        }
      }
    });
  }

  // Extract Aura-to-Apex dependencies from Helper files
  if (component.helper?.apexCalls) {
    component.helper.apexCalls.forEach((apexCall) => {
      results.auraToApexDependencyGraph.addRelationship(
        componentName,
        apexCall.apexClassName,
        'enqueueAction' as AuraToApexRelationshipType,
        { methodName: apexCall.methodName }
      );
    });
  }

  // Extract Aura-to-Apex dependencies from controller attribute in markup
  if (component.markup?.controller) {
    results.auraToApexDependencyGraph.addRelationship(
      componentName,
      component.markup.controller,
      'controller' as AuraToApexRelationshipType
    );
  }
}

/**
 * Parses all Aura component files in a directory
 */
export async function parseAllAuraComponents(metadataPath: string, concurrency = 10): Promise<ParsedAuraResultsImpl> {
  
  logger.info({ metadataPath }, 'Starting Aura component parsing');

  // Discover Aura component directories
  const scanResult = await scanDirectory({
    path: metadataPath,
    includePatterns: ['**/*.cmp', '**/*.app'],
  });

  // Find component directories (directories containing .cmp files)
  const componentDirs: string[] = [];
  const appFiles: string[] = [];

  for (const file of scanResult.files) {
    if (file.endsWith('.cmp')) {
      const componentDir = dirname(file);
      if (!componentDirs.includes(componentDir)) {
        componentDirs.push(componentDir);
      }
    } else if (file.endsWith('.app')) {
      appFiles.push(file);
    }
  }

  logger.debug({ componentCount: componentDirs.length, appCount: appFiles.length }, 'Found Aura components and applications');

  const results = new ParsedAuraResultsImpl();

  let parsedComponentCount = 0;
  let parsedAppCount = 0;
  let errorCount = 0;
  let warningCount = 0;

  // Parse components in parallel
  await processFilesInParallel(
    componentDirs,
    async (componentDir) => {
      try {
        const component = await parseAuraComponentBundle(componentDir);
        results.addComponent(component);
        
        // Extract dependencies
        extractAndMapDependencies(component, results);
        
        parsedComponentCount++;
        return component;
      } catch (error) {
        warningCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn({ componentDir, error: errorMessage }, 'Failed to parse Aura component bundle');
        return null;
      }
    },
    concurrency
  );

  // Parse applications in parallel
  await processFilesInParallel(
    appFiles,
    async (appFilePath) => {
      try {
        const appDir = dirname(appFilePath);
        const appName = appFilePath.replace(/\.app$/, '').split('/').pop() || '';
        
        const application = await parseAuraApplication(appFilePath, appDir, appName);
        results.addApplication(application);
        
        // Extract dependencies
        extractAndMapDependencies(application, results);
        
        parsedAppCount++;
        return application;
      } catch (error) {
        warningCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn({ appFilePath, error: errorMessage }, 'Failed to parse Aura application');
        return null;
      }
    },
    concurrency
  );

  logger.info(
    {
      components: parsedComponentCount,
      applications: parsedAppCount,
      errors: errorCount,
      warnings: warningCount,
    },
    'Aura component parsing completed'
  );

  return results;
}

