/**
 * Configuration schema for the sf-scanner CLI.
 *
 * The shape here is the single source of truth. CLI flags, the JSON config
 * file, and downstream commands all flow through `SfScannerConfig`.
 */

import { z } from 'zod';

export const AUTH_APPROACHES = ['helpers', 'configuredConnection', 'both'] as const;
export type AuthApproach = (typeof AUTH_APPROACHES)[number];

export const sfScannerConfigSchema = z.object({
  /** Path to the Salesforce metadata directory to scan/parse. */
  metadataPath: z.string().min(1, 'metadataPath is required'),

  /** Directory where parsed JSON artifacts are written. */
  parsedResultsDir: z.string().default('./parsed-results'),

  /** Directory where the generated Playwright project is written. */
  generatedDir: z.string().default('./generated'),

  /** Name placed in the generated project's package.json. */
  projectName: z.string().default('salesforce-tests'),

  /** Authentication style emitted by `generate-tests`. */
  authApproach: z.enum(AUTH_APPROACHES).default('both'),

  /** Whether `generate-tests` emits Playwright fixtures. */
  includeFixtures: z.boolean().default(true),

  /** Whether `generate-tests` emits test-data factories. */
  includeTestData: z.boolean().default(true),

  /** Concurrency limit shared by all parsers. */
  concurrency: z.number().int().positive().default(10),

  /**
   * Reserved for Phase D: optional live-org enrichment via the local `sf` CLI.
   * Currently unused by `build`; will be wired in Phase D.
   */
  org: z
    .object({
      alias: z.string().min(1),
    })
    .optional(),
});

export type SfScannerConfig = z.infer<typeof sfScannerConfigSchema>;
export type SfScannerConfigInput = z.input<typeof sfScannerConfigSchema>;

/** Filename searched for by `loadConfig`. */
export const CONFIG_FILENAME = 'sf-scanner.config.json';
