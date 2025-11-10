/**
 * Report generator module
 */

import type { MetadataRegistry } from '../registry/metadata-registry.js';
import { generateConsoleReport } from './console-reporter.js';
import { generateJSONReport } from './json-reporter.js';
import { generateMarkdownReport } from './markdown-reporter.js';
import { writeFile } from 'fs/promises';
import { logger } from '../utils/logger.js';

export type ReportFormat = 'console' | 'json' | 'markdown';

/**
 * Generates reports in the specified formats
 */
export async function generateReports(
  registry: MetadataRegistry,
  formats: ReportFormat[],
  outputPath?: string
): Promise<void> {
  for (const format of formats) {
    switch (format) {
      case 'console':
        console.log(generateConsoleReport(registry));
        break;
      case 'json':
        const jsonReport = generateJSONReport(registry);
        if (outputPath) {
          await writeFile(outputPath, jsonReport, 'utf-8');
          logger.info({ outputPath }, 'JSON report saved');
        } else {
          console.log(jsonReport);
        }
        break;
      case 'markdown':
        const markdownReport = generateMarkdownReport(registry);
        if (outputPath) {
          await writeFile(outputPath, markdownReport, 'utf-8');
          logger.info({ outputPath }, 'Markdown report saved');
        } else {
          console.log(markdownReport);
        }
        break;
    }
  }
}

