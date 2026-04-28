/**
 * `generate` command — emits the bare Playwright test project skeleton.
 */

import { logger } from '../../utils/logger.js';

export interface GenerateOptions {
  force?: boolean;
  projectName?: string;
}

export async function runGenerate(
  outputPath: string,
  options: GenerateOptions = {},
): Promise<void> {
  const { generateTestStructure } = await import('../../generator/index.js');

  await generateTestStructure({
    outputPath,
    force: options.force ?? false,
    projectName: options.projectName ?? 'salesforce-tests',
  });

  logger.info(
    { outputPath, projectName: options.projectName ?? 'salesforce-tests' },
    'Test structure generated successfully',
  );
}

export async function generateAction(
  outputPathArg: string,
  options: GenerateOptions,
): Promise<void> {
  try {
    await runGenerate(outputPathArg, options);
  } catch (error) {
    logger.error({ error }, 'Test structure generation failed');
    process.exit(1);
  }
}
