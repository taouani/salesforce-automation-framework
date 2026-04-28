/**
 * `generate-tests` command — emits Playwright test specs, fixtures, and
 * test-data factories from parsed metadata JSON.
 */

import { readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

import { logger } from '../../utils/logger.js';
import type { AuthApproach } from '../../config/schema.js';

export interface GenerateTestsOptions {
  input?: string;
  output?: string;
  authApproach?: AuthApproach;
  fixtures?: boolean;
  testData?: boolean;
}

const DEFAULTS = {
  input: './parsed-results',
  output: './generated-tests',
  authApproach: 'both' as AuthApproach,
};

export async function runGenerateTests(
  inputArg: string | undefined,
  outputArg: string | undefined,
  options: GenerateTestsOptions = {},
): Promise<{ totalFiles: number; successfulFiles: number; errors: number; warnings: number }> {
  const inputPath = options.input ?? inputArg ?? DEFAULTS.input;
  const outputPath = options.output ?? outputArg ?? DEFAULTS.output;
  const authApproach = options.authApproach ?? DEFAULTS.authApproach;
  const includeFixtures = options.fixtures !== false;
  const includeTestData = options.testData !== false;

  const { generateTests } = await import('../../generator/test-generation/test-generation-engine.js');

  logger.info({ input: inputPath, output: outputPath }, 'Starting test generation');

  await mkdir(outputPath, { recursive: true });
  await mkdir(join(outputPath, 'tests'), { recursive: true });
  await mkdir(join(outputPath, 'utils'), { recursive: true });
  await mkdir(join(outputPath, 'fixtures'), { recursive: true });

  // Load object metadata
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
  const relationshipMap = new Map<
    string,
    Array<{ fieldName: string; type: 'MasterDetail' | 'Lookup'; relatedObject: string }>
  >();

  if (existsSync(relationshipGraphPath)) {
    try {
      const relationshipGraphContent = await readFile(relationshipGraphPath, 'utf-8');
      const relationshipGraph = JSON.parse(relationshipGraphContent);
      if (relationshipGraph.nodes) {
        for (const node of relationshipGraph.nodes) {
          const relationships: Array<{
            fieldName: string;
            type: 'MasterDetail' | 'Lookup';
            relatedObject: string;
          }> = [];
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
        lwcComponents = Object.entries(lwcResults.components).map(
          ([name, component]: [string, any]) => ({
            ...component,
            name: component.name || component.metadata?.name || name,
          }),
        );
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
      if (Array.isArray(flowResults.flows)) {
        flows = flowResults.flows;
      } else if (
        flowResults.flows &&
        typeof flowResults.flows === 'object' &&
        !Array.isArray(flowResults.flows)
      ) {
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
      authApproach,
      includeFixtures,
      includeTestData,
    },
  );

  logger.info(
    {
      totalFiles: result.summary.totalFiles,
      successfulFiles: result.summary.successfulFiles,
      errors: result.summary.totalErrors,
      warnings: result.summary.totalWarnings,
    },
    'Test generation completed',
  );

  if (result.errors.length > 0) {
    logger.error({ errors: result.errors }, 'Test generation completed with errors');
    throw new Error(`Test generation completed with ${result.errors.length} errors`);
  }

  return {
    totalFiles: result.summary.totalFiles,
    successfulFiles: result.summary.successfulFiles,
    errors: result.summary.totalErrors,
    warnings: result.summary.totalWarnings,
  };
}

export async function generateTestsAction(
  inputArg: string,
  outputArg: string,
  options: GenerateTestsOptions,
): Promise<void> {
  try {
    await runGenerateTests(inputArg, outputArg, options);
  } catch (error) {
    logger.error({ error }, 'Test generation failed');
    process.exit(1);
  }
}
