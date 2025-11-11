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
import { parseAllLWCComponents } from '../parser/lwc-parser-integration.js';
import { saveParsedLWCResults } from '../parser/lwc-results-persistence.js';
import { parseAllApexFiles } from '../parser/apex-parser-integration.js';
import { saveParsedApexResults, saveApexDependencyGraph } from '../parser/apex-results-persistence.js';
import { parseAllFlowFiles } from '../parser/flow-parser-integration.js';
import { saveParsedFlowResults } from '../parser/flow-results-persistence.js';
import { parseAllAuraComponents } from '../parser/aura-parser-integration.js';
import { saveParsedAuraResults } from '../parser/aura-results-persistence.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

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
      
      // Save relationship graph - if path is relative (starts with ./), make it relative to output directory
      const relationshipsPath = options.relationships.startsWith('./')
        ? join(options.output, options.relationships.replace(/^\.\//, ''))
        : options.relationships;
      await saveRelationshipGraph(
        relationshipGraph.toJSON(),
        relationshipsPath
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

// Parse LWC command
program
  .command('parse-lwc')
  .description('Parse Lightning Web Component files (.js, .html, .css)')
  .argument('[path]', 'Path to Salesforce metadata directory (required unless --test-default is used)')
  .option(
    '-o, --output <path>',
    'Output directory for parsed results',
    './parsed-results'
  )
  .option(
    '-d, --dependencies <path>',
    'Path to save dependency graph JSON file',
    './component-dependency-graph.json'
  )
  .option('-c, --concurrency <number>', 'Concurrency limit for parsing', '10')
  .option('--test-default', 'Use test default path (for development)')
  .action(async (pathArg, options) => {
    try {
      // Determine path to use
      const metadataPath = options.testDefault
        ? getPath(undefined, true)
        : getPath(pathArg, false);

      // Validate path
      await validatePath(metadataPath);

      logger.info({ path: metadataPath }, 'Starting LWC component parsing');

      const concurrency = parseInt(options.concurrency, 10);

      // Parse LWC components
      const parseResult = await parseAllLWCComponents({
        metadataPath,
        concurrency,
      });

      // Save results
      const outputPath = join(options.output, 'parsed-lwc-results.json');
      await saveParsedLWCResults(parseResult.results.toJSON(), outputPath);

      // Save dependency graph - if path is relative (starts with ./), make it relative to output directory
      const dependenciesPath = options.dependencies.startsWith('./')
        ? join(options.output, options.dependencies.replace(/^\.\//, ''))
        : options.dependencies;
      await writeFile(
        dependenciesPath,
        JSON.stringify(parseResult.results.dependencyGraph.toJSON(), null, 2),
        'utf-8'
      );

      logger.info(
        {
          components: parseResult.components.length,
          errors: parseResult.errors,
          warnings: parseResult.warnings,
          outputDir: options.output,
        },
        'LWC parsing completed successfully'
      );
    } catch (error) {
      logger.error({ error }, 'LWC parsing failed');
      process.exit(1);
    }
  });

// Parse Apex command
program
  .command('parse-apex')
  .description('Parse Apex class and trigger files (.cls, .trigger)')
  .argument('[path]', 'Path to Salesforce metadata directory (required unless --test-default is used)')
  .option(
    '-o, --output <path>',
    'Output directory for parsed results',
    './parsed-results'
  )
  .option(
    '-d, --dependencies <path>',
    'Path to save dependency graph JSON file',
    './apex-dependency-graph.json'
  )
  .option('-c, --concurrency <number>', 'Concurrency limit for parsing', '10')
  .option('--test-default', 'Use test default path (for development)')
  .action(async (pathArg, options) => {
    try {
      // Determine path to use
      const metadataPath = options.testDefault
        ? getPath(undefined, true)
        : getPath(pathArg, false);

      // Validate path
      await validatePath(metadataPath);

      logger.info({ path: metadataPath }, 'Starting Apex file parsing');

      const concurrency = parseInt(options.concurrency, 10);

      // Parse Apex files
      const parseResult = await parseAllApexFiles({
        metadataPath,
        concurrency,
      });

      // Ensure output directory exists
      await mkdir(options.output, { recursive: true });

      // Save results
      const outputPath = join(options.output, 'parsed-apex-results.json');
      await saveParsedApexResults(parseResult.results.toJSON(), outputPath);

      // Save dependency graph - if path is relative (starts with ./), make it relative to output directory
      const dependenciesPath = options.dependencies.startsWith('./')
        ? join(options.output, options.dependencies.replace(/^\.\//, ''))
        : options.dependencies;
      await saveApexDependencyGraph(
        parseResult.results.dependencyGraph.toJSON(),
        dependenciesPath
      );

      logger.info(
        {
          classes: parseResult.classes.length,
          triggers: parseResult.triggers.length,
          errors: parseResult.errors,
          warnings: parseResult.warnings,
          outputDir: options.output,
        },
        'Apex parsing completed successfully'
      );
    } catch (error) {
      logger.error({ error }, 'Apex parsing failed');
      process.exit(1);
    }
  });

// Parse Flow command
program
  .command('parse-flow')
  .description('Parse Salesforce Flow definition files (.flow-meta.xml)')
  .argument('[path]', 'Path to Salesforce metadata directory (required unless --test-default is used)')
  .option(
    '-o, --output <path>',
    'Output directory for parsed results',
    './parsed-results'
  )
  .option(
    '-d, --dependencies <path>',
    'Path to save dependency graph JSON file',
    './flow-dependency-graph.json'
  )
  .option(
    '-t, --to-object <path>',
    'Path to save Flow-to-object dependency graph JSON file',
    './flow-to-object-dependency-graph.json'
  )
  .option('-c, --concurrency <number>', 'Concurrency limit for parsing', '10')
  .option('--test-default', 'Use test default path (for development)')
  .action(async (pathArg, options) => {
    try {
      // Determine path to use
      const metadataPath = options.testDefault
        ? getPath(undefined, true)
        : getPath(pathArg, false);

      // Validate path
      await validatePath(metadataPath);

      logger.info({ path: metadataPath }, 'Starting Flow file parsing');

      const concurrency = parseInt(options.concurrency, 10);

      // Parse Flow files
      const parseResult = await parseAllFlowFiles({
        metadataPath,
        concurrency,
      });

      // Ensure output directory exists
      await mkdir(options.output, { recursive: true });

      // Save results
      const outputPath = join(options.output, 'parsed-flow-results.json');
      await saveParsedFlowResults({
        output: outputPath,
        results: parseResult.results,
      });

      // Save dependency graphs - if path is relative (starts with ./), make it relative to output directory
      const dependenciesPath = options.dependencies.startsWith('./')
        ? join(options.output, options.dependencies.replace(/^\.\//, ''))
        : options.dependencies;
      await writeFile(
        dependenciesPath,
        JSON.stringify(parseResult.results.dependencyGraph.toJSON(), null, 2),
        'utf-8'
      );

      const toObjectPath = options.toObject.startsWith('./')
        ? join(options.output, options.toObject.replace(/^\.\//, ''))
        : options.toObject;
      await writeFile(
        toObjectPath,
        JSON.stringify(parseResult.results.flowToObjectGraph.toJSON(), null, 2),
        'utf-8'
      );

      logger.info(
        {
          flows: parseResult.flows.length,
          errors: parseResult.errors,
          warnings: parseResult.warnings,
          outputDir: options.output,
        },
        'Flow parsing completed successfully'
      );
    } catch (error) {
      logger.error({ error }, 'Flow parsing failed');
      process.exit(1);
    }
  });

program
  .command('parse-aura')
  .description('Parse Salesforce Aura component files (.cmp, .js, .css)')
  .argument('[path]', 'Path to Salesforce metadata directory (required unless --test-default is used)')
  .option(
    '-o, --output <path>',
    'Output directory for parsed results',
    './parsed-results'
  )
  .option(
    '-d, --dependencies <path>',
    'Path to save Aura-to-Aura dependency graph JSON file',
    './aura-dependency-graph.json'
  )
  .option(
    '-t, --to-object <path>',
    'Path to save Aura-to-object dependency graph JSON file',
    './aura-to-object-dependency-graph.json'
  )
  .option(
    '-a, --to-apex <path>',
    'Path to save Aura-to-Apex dependency graph JSON file',
    './aura-to-apex-dependency-graph.json'
  )
  .option('-c, --concurrency <number>', 'Concurrency limit for parsing', '10')
  .option('--test-default', 'Use test default path (for development)')
  .action(async (pathArg, options) => {
    try {
      // Determine path to use
      const metadataPath = options.testDefault
        ? getPath(undefined, true)
        : getPath(pathArg, false);

      // Validate path
      await validatePath(metadataPath);

      logger.info({ path: metadataPath }, 'Starting Aura component parsing');

      const concurrency = parseInt(options.concurrency, 10);

      // Parse Aura components
      const results = await parseAllAuraComponents(metadataPath, concurrency);

      // Ensure output directory exists
      await mkdir(options.output, { recursive: true });

      // Save results
      await saveParsedAuraResults(results, options.output);

      // Save dependency graphs - if path is relative (starts with ./), make it relative to output directory
      const dependenciesPath = options.dependencies.startsWith('./')
        ? join(options.output, options.dependencies.replace(/^\.\//, ''))
        : options.dependencies;
      await writeFile(
        dependenciesPath,
        JSON.stringify(results.auraDependencyGraph.toJSON(), null, 2),
        'utf-8'
      );

      const toObjectPath = options.toObject.startsWith('./')
        ? join(options.output, options.toObject.replace(/^\.\//, ''))
        : options.toObject;
      await writeFile(
        toObjectPath,
        JSON.stringify(results.auraToObjectDependencyGraph.toJSON(), null, 2),
        'utf-8'
      );

      const toApexPath = options.toApex.startsWith('./')
        ? join(options.output, options.toApex.replace(/^\.\//, ''))
        : options.toApex;
      await writeFile(
        toApexPath,
        JSON.stringify(results.auraToApexDependencyGraph.toJSON(), null, 2),
        'utf-8'
      );

      logger.info(
        {
          components: results.components.size,
          applications: results.applications.size,
          outputDir: options.output,
        },
        'Aura component parsing completed successfully'
      );
    } catch (error) {
      logger.error({ error }, 'Aura component parsing failed');
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

// Generate page objects command
program
  .command('generate-page-objects')
  .description('Generate Page Object Model classes from parsed Salesforce metadata')
  .option(
    '-i, --input <path>',
    'Path to parsed metadata results directory (default: ./parsed-results)',
    './parsed-results'
  )
  .option(
    '-o, --output <path>',
    'Output directory for generated page objects (page objects will be created in a "pages" subdirectory)',
    './generated-page-objects'
  )
  .option(
    '--template-dir <path>',
    'Custom template directory (optional)'
  )
  .action(async (options) => {
    try {
      const { generatePageObjects } = await import('../generator/page-object/generation-engine.js');
      const { readFile } = await import('fs/promises');
      const { join } = await import('path');
      const { existsSync } = await import('fs');

      logger.info({ input: options.input, output: options.output }, 'Starting page object generation');

      // Load parsed metadata
      const xmlResultsPath = join(options.input, 'parsed-xml-results.json');
      let objects: unknown[] = [];

      if (existsSync(xmlResultsPath)) {
        try {
          const xmlResultsContent = await readFile(xmlResultsPath, 'utf-8');
          const xmlResults = JSON.parse(xmlResultsContent);
          objects = xmlResults.objects || [];
          logger.info({ count: objects.length }, 'Loaded object metadata');
        } catch (error) {
          logger.warn({ xmlResultsPath, error }, 'Failed to load XML results, continuing without object metadata');
        }
      } else {
        logger.warn({ xmlResultsPath }, 'XML results file not found, continuing without object metadata');
      }

      // Load LWC component metadata
      const lwcResultsPath = join(options.input, 'parsed-lwc-results.json');
      let lwcComponents: unknown[] = [];

      if (existsSync(lwcResultsPath)) {
        try {
          const lwcResultsContent = await readFile(lwcResultsPath, 'utf-8');
          const lwcResults = JSON.parse(lwcResultsContent);
          // Convert Record<string, LWCComponentDefinition> to array
          if (lwcResults.components && typeof lwcResults.components === 'object') {
            lwcComponents = Object.values(lwcResults.components);
          }
          logger.info({ count: lwcComponents.length }, 'Loaded LWC component metadata');
        } catch (error) {
          logger.warn({ lwcResultsPath, error }, 'Failed to load LWC results, continuing without LWC component metadata');
        }
      } else {
        logger.warn({ lwcResultsPath }, 'LWC results file not found, continuing without LWC component metadata');
      }

      // Load Aura component metadata
      const auraResultsPath = join(options.input, 'aura-results.json');
      let auraComponents: unknown[] = [];

      if (existsSync(auraResultsPath)) {
        try {
          const auraResultsContent = await readFile(auraResultsPath, 'utf-8');
          const auraResults = JSON.parse(auraResultsContent);
          // Convert Record<string, AuraComponentDefinition> to array
          if (auraResults.components && typeof auraResults.components === 'object') {
            auraComponents = Object.values(auraResults.components);
          }
          logger.info({ count: auraComponents.length }, 'Loaded Aura component metadata');
        } catch (error) {
          logger.warn({ auraResultsPath, error }, 'Failed to load Aura results, continuing without Aura component metadata');
        }
      } else {
        logger.warn({ auraResultsPath }, 'Aura results file not found, continuing without Aura component metadata');
      }

      // Load Flow metadata
      const flowResultsPath = join(options.input, 'parsed-flow-results.json');
      let flows: unknown[] = [];

      if (existsSync(flowResultsPath)) {
        try {
          const flowResultsContent = await readFile(flowResultsPath, 'utf-8');
          const flowResults = JSON.parse(flowResultsContent);
          // Convert Record<string, FlowDefinition> to array
          if (flowResults.flows && typeof flowResults.flows === 'object') {
            flows = Object.values(flowResults.flows);
          }
          logger.info({ count: flows.length }, 'Loaded Flow metadata');
        } catch (error) {
          logger.warn({ flowResultsPath, error }, 'Failed to load Flow results, continuing without Flow metadata');
        }
      } else {
        logger.warn({ flowResultsPath }, 'Flow results file not found, continuing without Flow metadata');
      }

      // Generate page objects
      const config = {
        outputDirectory: options.output,
        templateDirectory: options.templateDir,
      };

      const result = await generatePageObjects(config, {
        objects: objects as any[],
        lwcComponents: lwcComponents as any[],
        auraComponents: auraComponents as any[],
        flows: flows as any[],
      });

      logger.info(
        {
          generatedFiles: result.summary.totalFiles,
          successfulFiles: result.summary.successfulFiles,
          failedFiles: result.summary.failedFiles,
          errors: result.summary.totalErrors,
          warnings: result.summary.totalWarnings,
          outputDir: options.output,
        },
        'Page object generation completed'
      );

      if (result.errors.length > 0) {
        logger.warn({ errors: result.errors }, 'Generation completed with errors');
      }
      if (result.warnings.length > 0) {
        logger.warn({ warnings: result.warnings }, 'Generation completed with warnings');
      }
    } catch (error) {
      logger.error({ error }, 'Page object generation failed');
      process.exit(1);
    }
  });

// Generate tests command
program
  .command('generate-tests')
  .description('Generate Playwright test specifications from parsed Salesforce metadata')
  .argument('[input]', 'Path to parsed metadata results directory (default: ./parsed-results)')
  .argument('[output]', 'Output directory for generated tests (default: ./generated-tests)')
  .option(
    '-i, --input <path>',
    'Path to parsed metadata results directory (default: ./parsed-results)'
  )
  .option(
    '-o, --output <path>',
    'Output directory for generated tests (default: ./generated-tests)'
  )
  .option(
    '--auth-approach <approach>',
    'Authentication approach: helpers, configuredConnection, or both',
    'both'
  )
  .option('--no-fixtures', 'Skip generating test fixtures')
  .option('--no-test-data', 'Skip generating test data factories')
  .action(async (inputArg, outputArg, options) => {
    // Use options if provided, otherwise use positional arguments, otherwise use defaults
    const inputPath = options.input || inputArg || './parsed-results';
    const outputPath = options.output || outputArg || './generated-tests';
    try {
      const { generateTests } = await import('../generator/test-generation/test-generation-engine.js');
      const { readFile } = await import('fs/promises');
      const { join } = await import('path');
      const { existsSync } = await import('fs');
      const { mkdir } = await import('fs/promises');

      logger.info({ input: inputPath, output: outputPath }, 'Starting test generation');

      // Ensure output directory exists
      await mkdir(outputPath, { recursive: true });
      await mkdir(join(outputPath, 'tests'), { recursive: true });
      await mkdir(join(outputPath, 'utils'), { recursive: true });
      await mkdir(join(outputPath, 'fixtures'), { recursive: true });

      // Load parsed metadata
      const xmlResultsPath = join(inputPath, 'parsed-xml-results.json');
      let objects: unknown[] = [];

      if (existsSync(xmlResultsPath)) {
        try {
          const xmlResultsContent = await readFile(xmlResultsPath, 'utf-8');
          const xmlResults = JSON.parse(xmlResultsContent);
          objects = xmlResults.objects || [];
          logger.info({ count: objects.length }, 'Loaded object metadata');
        } catch (error) {
          logger.warn({ xmlResultsPath, error }, 'Failed to load XML results');
        }
      }

      // Load relationship graph
      const relationshipGraphPath = join(inputPath, 'relationship-graph.json');
      const relationshipMap = new Map<string, Array<{ fieldName: string; type: 'MasterDetail' | 'Lookup'; relatedObject: string }>>();
      
      if (existsSync(relationshipGraphPath)) {
        try {
          const relationshipGraphContent = await readFile(relationshipGraphPath, 'utf-8');
          const relationshipGraph = JSON.parse(relationshipGraphContent);
          // Build relationship map from graph
          if (relationshipGraph.nodes) {
            for (const node of relationshipGraph.nodes) {
              const relationships: Array<{ fieldName: string; type: 'MasterDetail' | 'Lookup'; relatedObject: string }> = [];
              if (node.relationships) {
                for (const rel of node.relationships) {
                  relationships.push({
                    fieldName: rel.fieldName,
                    type: rel.type as 'MasterDetail' | 'Lookup',
                    relatedObject: rel.relatedObject,
                  });
                }
              }
              relationshipMap.set(node.objectName, relationships);
            }
          }
          logger.info({ count: relationshipMap.size }, 'Loaded relationship graph');
        } catch (error) {
          logger.warn({ relationshipGraphPath, error }, 'Failed to load relationship graph');
        }
      }

      // Load LWC component metadata
      const lwcResultsPath = join(inputPath, 'parsed-lwc-results.json');
      let lwcComponents: unknown[] = [];
      if (existsSync(lwcResultsPath)) {
        try {
          const lwcResultsContent = await readFile(lwcResultsPath, 'utf-8');
          const lwcResults = JSON.parse(lwcResultsContent);
          if (lwcResults.components && typeof lwcResults.components === 'object') {
            // Convert object to array, preserving component name as 'name' property
            lwcComponents = Object.entries(lwcResults.components).map(([name, component]: [string, any]) => ({
              ...component,
              name: component.name || component.metadata?.name || name,
            }));
          }
          logger.info({ count: lwcComponents.length }, 'Loaded LWC component metadata');
        } catch (error) {
          logger.warn({ lwcResultsPath, error }, 'Failed to load LWC results');
        }
      }

      // Load Aura component metadata
      const auraResultsPath = join(inputPath, 'aura-results.json');
      let auraComponents: unknown[] = [];
      if (existsSync(auraResultsPath)) {
        try {
          const auraResultsContent = await readFile(auraResultsPath, 'utf-8');
          const auraResults = JSON.parse(auraResultsContent);
          if (auraResults.components && typeof auraResults.components === 'object') {
            auraComponents = Object.values(auraResults.components);
          }
          logger.info({ count: auraComponents.length }, 'Loaded Aura component metadata');
        } catch (error) {
          logger.warn({ auraResultsPath, error }, 'Failed to load Aura results');
        }
      }

      // Load Flow metadata
      const flowResultsPath = join(inputPath, 'parsed-flow-results.json');
      let flows: unknown[] = [];
      if (existsSync(flowResultsPath)) {
        try {
          const flowResultsContent = await readFile(flowResultsPath, 'utf-8');
          const flowResults = JSON.parse(flowResultsContent);
          // Handle both array and object formats
          if (Array.isArray(flowResults.flows)) {
            flows = flowResults.flows;
          } else if (flowResults.flows && typeof flowResults.flows === 'object' && !Array.isArray(flowResults.flows)) {
            // Convert object to array
            flows = Object.values(flowResults.flows);
          } else if (Array.isArray(flowResults)) {
            flows = flowResults;
          } else if (typeof flowResults === 'object' && flowResults !== null) {
            flows = Object.values(flowResults);
          }
          logger.info({ count: flows.length }, 'Loaded Flow metadata');
        } catch (error) {
          logger.warn({ flowResultsPath, error }, 'Failed to load Flow results');
        }
      }

      // Generate tests
      const result = await generateTests(
        {
          objects: objects as any,
          lwcComponents: lwcComponents as any,
          auraComponents: auraComponents as any,
          flows: flows as any,
          relationshipMap,
        },
        {
          outputDirectory: outputPath,
          authApproach: options.authApproach as 'helpers' | 'configuredConnection' | 'both',
          includeFixtures: options.fixtures !== false,
          includeTestData: options.testData !== false,
        }
      );

      logger.info(
        {
          totalFiles: result.summary.totalFiles,
          successfulFiles: result.summary.successfulFiles,
          errors: result.summary.totalErrors,
          warnings: result.summary.totalWarnings,
        },
        'Test generation completed'
      );

      if (result.errors.length > 0) {
        logger.error({ errors: result.errors }, 'Test generation completed with errors');
        process.exit(1);
      }
    } catch (error) {
      logger.error({ error }, 'Test generation failed');
      process.exit(1);
    }
  });

// Parse arguments, allowing unknown options to be passed through
program.parse(process.argv);

