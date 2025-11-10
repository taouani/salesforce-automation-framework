#!/usr/bin/env node

/**
 * CLI interface for the Salesforce metadata scanner and XML parser
 */

import { Command } from 'commander';
import { scanDirectory, processFilesInParallel } from '../scanner/file-scanner.js';
import { validatePath, getPath } from '../scanner/path-validator.js';
import { createMetadataItem } from '../classifier/index.js';
import { MetadataRegistry } from '../registry/metadata-registry.js';
import { saveRegistryToFile } from '../registry/persistence.js';
import { generateReports, type ReportFormat } from '../reporter/index.js';
import { logger } from '../utils/logger.js';
import { FileReadError } from '../utils/errors.js';
import { parseAllObjects } from '../parser/object-parser-integration.js';
import { parseProfileXML } from '../parser/profile-parser.js';
import { parsePermissionSetXML } from '../parser/permissionset-parser.js';
import { RelationshipGraphImpl } from '../parser/relationship-graph.js';
import { ParsedXMLResultsImpl } from '../parser/xml-results.js';
import { CrossReferenceBuilder } from '../parser/cross-reference.js';
import { saveParsedXMLResults, saveRelationshipGraph } from '../parser/xml-results-persistence.js';
import { writeFile } from 'fs/promises';

const program = new Command();

program
  .name('sf-scanner')
  .description('Salesforce metadata scanner and XML parser')
  .version('1.0.0');

// Scan command
program
  .command('scan')
  .description('Scan Salesforce metadata repository and generate inventory reports')
  .argument('<path>', 'Path to Salesforce metadata directory')
  .option(
    '-f, --format <formats...>',
    'Output format(s): console, json, markdown',
    ['console']
  )
  .option('-o, --output <path>', 'Output file path (for JSON/Markdown)')
  .option(
    '-r, --registry <path>',
    'Path to save registry JSON file',
    'registry.json'
  )
  .option('-c, --concurrency <number>', 'Concurrency limit for file processing', '10')
  .option('--test-default', 'Use test default path (for development)')
  .action(async (pathArg, options) => {
    try {
      // Determine path to use
      const metadataPath = options.testDefault
        ? getPath(undefined, true)
        : getPath(pathArg, false);

      // Validate path
      await validatePath(metadataPath);

      logger.info({ path: metadataPath }, 'Starting metadata scan');

      // Scan directory
      const scanResult = await scanDirectory({
        path: metadataPath,
        concurrency: parseInt(options.concurrency, 10),
      });

      // Process files and classify
      const registry = new MetadataRegistry();
      const metadataItems = await processFilesInParallel(
        scanResult.files,
        async (filePath) => {
          try {
            return createMetadataItem(filePath);
          } catch (error) {
            registry.incrementWarnings();
            logger.warn({ filePath, error }, 'Failed to classify metadata item');
            return null;
          }
        },
        parseInt(options.concurrency, 10)
      );

      // Add items to registry
      for (const item of metadataItems) {
        if (item) {
          registry.addItem(item);
        }
      }

      // Save registry
      await saveRegistryToFile(registry.toJSON(), options.registry);

      // Generate reports
      const formats = options.format as ReportFormat[];
      await generateReports(registry, formats, options.output);

      logger.info(
        {
          totalItems: registry.getStatistics().totalItems,
          registryPath: options.registry,
        },
        'Scan completed successfully'
      );
    } catch (error) {
      if (error instanceof FileReadError) {
        logger.error({ error: error.message }, 'Scan failed');
        process.exit(1);
      } else {
        logger.error({ error }, 'Unexpected error');
        process.exit(1);
      }
    }
  });

// Parse command
program
  .command('parse')
  .description('Parse XML metadata files (objects, profiles, permission sets)')
  .argument('<path>', 'Path to Salesforce metadata directory')
  .option(
    '-o, --output <path>',
    'Output directory for parsed results',
    './parsed-results'
  )
  .option(
    '-r, --relationships <path>',
    'Path to save relationship graph JSON file',
    './relationship-graph.json'
  )
  .option('-c, --concurrency <number>', 'Concurrency limit for XML parsing', '10')
  .option('--test-default', 'Use test default path (for development)')
  .option('--objects-only', 'Parse only object XML files')
  .option('--profiles-only', 'Parse only profile XML files')
  .option('--permissionsets-only', 'Parse only permission set XML files')
  .action(async (pathArg, options) => {
    try {
      // Determine path to use
      const metadataPath = options.testDefault
        ? getPath(undefined, true)
        : getPath(pathArg, false);

      // Validate path
      await validatePath(metadataPath);

      logger.info({ path: metadataPath }, 'Starting XML metadata parsing');

      const concurrency = parseInt(options.concurrency, 10);
      const relationshipGraph = new RelationshipGraphImpl();
      const results = new ParsedXMLResultsImpl(relationshipGraph);
      const crossRefBuilder = new CrossReferenceBuilder();

      // Parse objects
      if (!options.profilesOnly && !options.permissionsetsOnly) {
        logger.info('Parsing object XML files...');
        const objectResult = await parseAllObjects({
          metadataPath,
          concurrency,
        });

        for (const obj of objectResult.objects) {
          results.addObject(obj);
          // Add relationships to graph
          for (const rel of obj.relationships) {
            relationshipGraph.addRelationship(rel, obj.fullName);
          }
        }

        logger.info(
          {
            parsed: objectResult.objects.length,
            errors: objectResult.errors,
            warnings: objectResult.warnings,
          },
          'Object parsing completed'
        );
      }

      // Parse profiles
      if (!options.objectsOnly && !options.permissionsetsOnly) {
        logger.info('Parsing profile XML files...');
        const scanResult = await scanDirectory({
          path: metadataPath,
          includePatterns: ['**/profiles/**/*.profile-meta.xml'],
        });

        let profileCount = 0;
        let profileWarnings = 0;

        await processFilesInParallel(
          scanResult.files,
          async (filePath) => {
            try {
              const profile = await parseProfileXML(filePath);
              results.addProfile(profile);
              profileCount++;
              return profile;
            } catch (error) {
              profileWarnings++;
              logger.warn({ filePath, error }, 'Failed to parse profile XML');
              return null;
            }
          },
          concurrency
        );

        logger.info(
          {
            parsed: profileCount,
            warnings: profileWarnings,
          },
          'Profile parsing completed'
        );
      }

      // Parse permission sets
      if (!options.objectsOnly && !options.profilesOnly) {
        logger.info('Parsing permission set XML files...');
        const scanResult = await scanDirectory({
          path: metadataPath,
          includePatterns: ['**/permissionsets/**/*.permissionset-meta.xml'],
        });

        let permSetCount = 0;
        let permSetWarnings = 0;

        await processFilesInParallel(
          scanResult.files,
          async (filePath) => {
            try {
              const permSet = await parsePermissionSetXML(filePath);
              results.addPermissionSet(permSet);
              permSetCount++;
              return permSet;
            } catch (error) {
              permSetWarnings++;
              logger.warn({ filePath, error }, 'Failed to parse permission set XML');
              return null;
            }
          },
          concurrency
        );

        logger.info(
          {
            parsed: permSetCount,
            warnings: permSetWarnings,
          },
          'Permission set parsing completed'
        );
      }

      // Build cross-references
      logger.info('Building cross-references...');
      crossRefBuilder.buildCrossReferences(
        results.getAllParsedProfiles(),
        results.getAllParsedPermissionSets(),
        results.getAllParsedObjects()
      );

      // Save results
      logger.info('Saving parsed results...');
      await saveParsedXMLResults(results, `${options.output}/parsed-xml-results.json`);
      await saveRelationshipGraph(
        relationshipGraph.toJSON(),
        options.relationships
      );

      // Save cross-references summary
      const allObjects = Array.from(results.objects.values());
      const crossRefSummary = {
        objectToProfiles: Object.fromEntries(
          allObjects.map((obj) => [
            obj.fullName,
            crossRefBuilder.getProfilesForObject(obj.fullName),
          ])
        ),
        objectToPermissionSets: Object.fromEntries(
          allObjects.map((obj) => [
            obj.fullName,
            crossRefBuilder.getPermissionSetsForObject(obj.fullName),
          ])
        ),
        generatedAt: new Date().toISOString(),
      };
      // Ensure output directory exists
      const { mkdir } = await import('fs/promises');
      await mkdir(options.output, { recursive: true });

      await writeFile(
        `${options.output}/cross-references.json`,
        JSON.stringify(crossRefSummary, null, 2),
        'utf-8'
      );

      logger.info(
        {
          objects: results.objects.size,
          profiles: results.profiles.size,
          permissionSets: results.permissionSets.size,
          relationships: relationshipGraph.nodes.size,
          outputDir: options.output,
        },
        'XML parsing completed successfully'
      );
    } catch (error) {
      logger.error({ error }, 'XML parsing failed');
      process.exit(1);
    }
  });

// Generate command
program
  .command('generate')
  .description('Generate Playwright test project structure')
  .argument('<output-path>', 'Output path for generated test structure')
  .option('--force', 'Overwrite existing files and directories', false)
  .option('--project-name <name>', 'Project name for package.json', 'salesforce-tests')
  .action(async (outputPathArg, options) => {
    try {
      const { generateTestStructure } = await import('../generator/index.js');
      
      await generateTestStructure({
        outputPath: outputPathArg,
        force: options.force || false,
        projectName: options.projectName || 'salesforce-tests',
      });

      logger.info(
        {
          outputPath: outputPathArg,
          projectName: options.projectName || 'salesforce-tests',
        },
        'Test structure generated successfully'
      );
    } catch (error) {
      logger.error({ error }, 'Test structure generation failed');
      process.exit(1);
    }
  });

program.parse();

