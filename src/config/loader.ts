/**
 * Loads and validates `sf-scanner.config.json`.
 *
 * Search order: walks upward from `cwd` until it finds a file named
 * `sf-scanner.config.json` or hits the filesystem root. CLI flag overrides
 * are merged on top of the file's contents before validation.
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';
import { logger } from '../utils/logger.js';
import {
  CONFIG_FILENAME,
  sfScannerConfigSchema,
  type SfScannerConfig,
  type SfScannerConfigInput,
} from './schema.js';

export class ConfigError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'ConfigError';
  }
}

export interface LoadConfigOptions {
  /** Directory to begin the upward search from. Defaults to `process.cwd()`. */
  cwd?: string;
  /** Explicit config path; skips upward search if provided. */
  configPath?: string;
  /** CLI overrides merged on top of the file contents before validation. */
  overrides?: Partial<SfScannerConfigInput>;
}

export interface LoadConfigResult {
  config: SfScannerConfig;
  /** Absolute path to the config file actually read, or null if none was found. */
  configPath: string | null;
  /** Directory the config was loaded from (or cwd when no file was found). */
  rootDir: string;
}

/**
 * Walks up from `start` looking for `sf-scanner.config.json`.
 * Returns the absolute path or null if not found before the filesystem root.
 */
export function findConfigFile(start: string): string | null {
  let current = resolve(start);
  while (true) {
    const candidate = resolve(current, CONFIG_FILENAME);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export async function loadConfig(options: LoadConfigOptions = {}): Promise<LoadConfigResult> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const configPath = options.configPath
    ? resolve(cwd, options.configPath)
    : findConfigFile(cwd);

  let fileContents: SfScannerConfigInput = {} as SfScannerConfigInput;
  if (configPath) {
    if (!existsSync(configPath)) {
      throw new ConfigError(`Config file not found: ${configPath}`);
    }
    try {
      const raw = await readFile(configPath, 'utf-8');
      fileContents = JSON.parse(raw) as SfScannerConfigInput;
    } catch (error) {
      throw new ConfigError(
        `Failed to read or parse ${configPath}`,
        error,
      );
    }
  }

  const merged: SfScannerConfigInput = {
    ...(fileContents as object),
    ...(options.overrides ?? {}),
  } as SfScannerConfigInput;

  const parsed = sfScannerConfigSchema.safeParse(merged);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new ConfigError(
      `Invalid sf-scanner configuration:\n${issues}\n` +
        (configPath
          ? `(loaded from ${configPath})`
          : '(no config file found; values came from CLI flags only)'),
    );
  }

  const rootDir = configPath ? dirname(configPath) : cwd;
  const resolved = resolvePaths(parsed.data, rootDir);

  logger.debug(
    { configPath, rootDir, resolvedKeys: Object.keys(resolved) },
    'Configuration loaded',
  );

  return { config: resolved, configPath, rootDir };
}

/**
 * Resolves relative paths in the config against `rootDir` so downstream code
 * can treat all paths as absolute. Leaves absolute paths unchanged.
 */
function resolvePaths(config: SfScannerConfig, rootDir: string): SfScannerConfig {
  return {
    ...config,
    metadataPath: isAbsolute(config.metadataPath)
      ? config.metadataPath
      : resolve(rootDir, config.metadataPath),
    parsedResultsDir: isAbsolute(config.parsedResultsDir)
      ? config.parsedResultsDir
      : resolve(rootDir, config.parsedResultsDir),
    generatedDir: isAbsolute(config.generatedDir)
      ? config.generatedDir
      : resolve(rootDir, config.generatedDir),
  };
}
