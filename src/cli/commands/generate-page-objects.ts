/**
 * `generate-page-objects` command — emits Page Object Model classes from
 * parsed metadata JSON.
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

import { logger } from '../../utils/logger.js';

export interface GeneratePageObjectsOptions {
  input?: string;
  output?: string;
  templateDir?: string;
}

const DEFAULTS = {
  input: './parsed-results',
  output: './generated-page-objects',
};

export async function runGeneratePageObjects(
  options: GeneratePageObjectsOptions = {},
): Promise<void> {
  const input = options.input ?? DEFAULTS.input;
  const output = options.output ?? DEFAULTS.output;

  const { generatePageObjects } = await import(
    '../../generator/page-object/generation-engine.js'
  );

  logger.info({ input, output }, 'Starting page object generation');

  // Load parsed metadata
  const xmlResultsPath = join(input, 'parsed-xml-results.json');
  let objects: unknown[] = [];

  if (existsSync(xmlResultsPath)) {
    try {
      const xmlResultsContent = await readFile(xmlResultsPath, 'utf-8');
      const xmlResults = JSON.parse(xmlResultsContent);
      objects = xmlResults.objects || [];
      logger.info({ count: objects.length }, 'Loaded object metadata');
    } catch (error) {
      logger.warn(
        { xmlResultsPath, error },
        'Failed to load XML results, continuing without object metadata',
      );
    }
  } else {
    logger.warn({ xmlResultsPath }, 'XML results file not found, continuing without object metadata');
  }

  const lwcResultsPath = join(input, 'parsed-lwc-results.json');
  let lwcComponents: unknown[] = [];

  if (existsSync(lwcResultsPath)) {
    try {
      const lwcResultsContent = await readFile(lwcResultsPath, 'utf-8');
      const lwcResults = JSON.parse(lwcResultsContent);
      if (lwcResults.components && typeof lwcResults.components === 'object') {
        lwcComponents = Object.values(lwcResults.components);
      }
      logger.info({ count: lwcComponents.length }, 'Loaded LWC component metadata');
    } catch (error) {
      logger.warn(
        { lwcResultsPath, error },
        'Failed to load LWC results, continuing without LWC component metadata',
      );
    }
  } else {
    logger.warn(
      { lwcResultsPath },
      'LWC results file not found, continuing without LWC component metadata',
    );
  }

  const auraResultsPath = join(input, 'aura-results.json');
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
      logger.warn(
        { auraResultsPath, error },
        'Failed to load Aura results, continuing without Aura component metadata',
      );
    }
  } else {
    logger.warn(
      { auraResultsPath },
      'Aura results file not found, continuing without Aura component metadata',
    );
  }

  const flowResultsPath = join(input, 'parsed-flow-results.json');
  let flows: unknown[] = [];

  if (existsSync(flowResultsPath)) {
    try {
      const flowResultsContent = await readFile(flowResultsPath, 'utf-8');
      const flowResults = JSON.parse(flowResultsContent);
      if (flowResults.flows && typeof flowResults.flows === 'object') {
        flows = Object.values(flowResults.flows);
      }
      logger.info({ count: flows.length }, 'Loaded Flow metadata');
    } catch (error) {
      logger.warn(
        { flowResultsPath, error },
        'Failed to load Flow results, continuing without Flow metadata',
      );
    }
  } else {
    logger.warn({ flowResultsPath }, 'Flow results file not found, continuing without Flow metadata');
  }

  const config = {
    outputDirectory: output,
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
      outputDir: output,
    },
    'Page object generation completed',
  );

  if (result.errors.length > 0) {
    logger.warn({ errors: result.errors }, 'Generation completed with errors');
  }
  if (result.warnings.length > 0) {
    logger.warn({ warnings: result.warnings }, 'Generation completed with warnings');
  }
}

export async function generatePageObjectsAction(
  options: GeneratePageObjectsOptions,
): Promise<void> {
  try {
    await runGeneratePageObjects(options);
  } catch (error) {
    logger.error({ error }, 'Page object generation failed');
    process.exit(1);
  }
}
