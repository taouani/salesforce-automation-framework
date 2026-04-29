/**
 * Bridge to the local `sf` CLI for org credentials.
 *
 * We shell out to `sf org display --target-org <alias> --json` and pull the
 * access token + instance URL + API version back. This avoids reinventing
 * Salesforce's auth flows (JWT, web-based, OAuth) — if the user has the org
 * registered with the CLI, we just borrow the live session.
 *
 * Errors are wrapped in `SfCliError` so the orchestrator can decide whether
 * to fall back to file-only mode or fail outright (depending on whether the
 * user explicitly asked for `--org`).
 */

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileP = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 30_000;

export class SfCliError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SfCliError';
  }
}

export interface OrgCredentials {
  accessToken: string;
  instanceUrl: string;
  /** API version, e.g. "60.0" — falls back to a sensible default if absent. */
  apiVersion: string;
  /** The alias as resolved by `sf` (often the same as input but may differ). */
  alias?: string;
  /** Username under which we authenticated. */
  username?: string;
}

interface SfOrgDisplayJsonResult {
  status: number;
  result: {
    id?: string;
    accessToken?: string;
    instanceUrl?: string;
    username?: string;
    alias?: string;
    apiVersion?: string;
    connectedStatus?: string;
  };
  warnings?: string[];
}

export interface FetchOrgCredentialsOptions {
  /** Override the default 30s timeout. */
  timeoutMs?: number;
  /** Path to the `sf` binary. Useful for tests; defaults to PATH lookup. */
  sfBinary?: string;
  /** Default API version if the CLI doesn't return one. */
  fallbackApiVersion?: string;
}

/**
 * Resolves credentials for `alias` via `sf org display`. Throws SfCliError
 * with a descriptive message on missing CLI / unknown alias / expired auth.
 */
export async function fetchOrgCredentials(
  alias: string,
  options: FetchOrgCredentialsOptions = {},
): Promise<OrgCredentials> {
  if (!alias || alias.trim() === '') {
    throw new SfCliError('Org alias is required');
  }

  const sfBinary = options.sfBinary ?? 'sf';
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fallbackApiVersion = options.fallbackApiVersion ?? '60.0';

  let stdout: string;
  try {
    const result = await execFileP(
      sfBinary,
      ['org', 'display', '--target-org', alias, '--json'],
      { timeout, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
    );
    stdout = result.stdout;
  } catch (error) {
    const errno = (error as NodeJS.ErrnoException).code;
    if (errno === 'ENOENT') {
      throw new SfCliError(
        `'sf' CLI not found on PATH. Install it from https://developer.salesforce.com/tools/salesforcecli or pass sfBinary.`,
        error,
      );
    }
    // sf prints JSON to stdout even on error; salvage it if possible.
    const stderrOutput = (error as { stdout?: string; stderr?: string }).stdout ?? '';
    if (stderrOutput) {
      try {
        const parsed = JSON.parse(stderrOutput) as SfOrgDisplayJsonResult & { message?: string };
        throw new SfCliError(
          `sf org display failed for alias "${alias}": ${parsed.message ?? 'unknown error'}`,
          error,
        );
      } catch {
        // fall through to generic message
      }
    }
    throw new SfCliError(
      `sf org display failed for alias "${alias}": ${(error as Error).message}`,
      error,
    );
  }

  let parsed: SfOrgDisplayJsonResult;
  try {
    parsed = JSON.parse(stdout);
  } catch (error) {
    throw new SfCliError(`Could not parse sf org display output as JSON`, error);
  }

  if (parsed.status !== 0 || !parsed.result) {
    throw new SfCliError(`sf org display returned non-zero status for alias "${alias}"`);
  }

  const { accessToken, instanceUrl, apiVersion, alias: resolvedAlias, username } = parsed.result;
  if (!accessToken || !instanceUrl) {
    throw new SfCliError(
      `sf org display did not return an access token / instance URL for alias "${alias}". ` +
        `The auth may be expired — try \`sf org login web --alias ${alias}\`.`,
    );
  }

  return {
    accessToken,
    instanceUrl: instanceUrl.replace(/\/$/, ''),
    apiVersion: normalizeApiVersion(apiVersion) ?? fallbackApiVersion,
    alias: resolvedAlias,
    username,
  };
}

function normalizeApiVersion(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // sf may return "60.0" or "v60.0"; we want the bare number.
  return value.replace(/^v/i, '');
}
