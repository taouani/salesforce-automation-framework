/**
 * Minimal Salesforce describe API client.
 *
 * We only need the bits of the describe payload that materially improve
 * generated tests: per-field labels, nillable/createable flags, and picklist
 * values. The rest of describe is large and noisy; we drop it on the floor.
 */

import { logger } from '../utils/logger.js';
import type { OrgCredentials } from './sf-cli-bridge.js';

export class DescribeError extends Error {
  constructor(
    readonly objectName: string,
    readonly status: number | undefined,
    message: string,
    readonly cause?: unknown,
  ) {
    super(`[${objectName}] ${message}`);
    this.name = 'DescribeError';
  }
}

export interface DescribePicklistValue {
  value: string;
  label: string;
  active: boolean;
  defaultValue: boolean;
}

export interface DescribeField {
  name: string;
  label: string;
  type: string;
  /** True when Salesforce permits NULL on insert/update. */
  nillable: boolean;
  createable: boolean;
  updateable: boolean;
  unique: boolean;
  /** Maximum length for text-like fields. */
  length: number;
  picklistValues: DescribePicklistValue[];
  referenceTo: string[];
  defaultValueFormula: string | null;
}

export interface DescribeResult {
  name: string;
  label: string;
  custom: boolean;
  createable: boolean;
  fields: DescribeField[];
}

export interface DescribeClient {
  /** Returns the describe payload for `objectName`, or null if it's missing/inaccessible. */
  describe(objectName: string): Promise<DescribeResult | null>;
}

export interface CreateDescribeClientOptions {
  credentials: OrgCredentials;
  /** Per-request timeout (ms). Defaults to 20s. */
  requestTimeoutMs?: number;
  /** Override the global fetch (used in tests). */
  fetchImpl?: typeof fetch;
}

export function createDescribeClient(options: CreateDescribeClientOptions): DescribeClient {
  const { credentials } = options;
  const timeout = options.requestTimeoutMs ?? 20_000;
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiBase = `${credentials.instanceUrl}/services/data/v${credentials.apiVersion}/sobjects`;

  return {
    async describe(objectName: string): Promise<DescribeResult | null> {
      const url = `${apiBase}/${encodeURIComponent(objectName)}/describe`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetchImpl(url, {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            Accept: 'application/json',
          },
          signal: controller.signal,
        });
        if (res.status === 404) {
          logger.debug({ objectName }, 'Describe returned 404; object missing in org');
          return null;
        }
        if (!res.ok) {
          const body = await safeReadText(res);
          throw new DescribeError(
            objectName,
            res.status,
            `describe failed: HTTP ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`,
          );
        }
        const json = (await res.json()) as DescribeResult;
        return normalizeDescribe(json);
      } catch (error) {
        if (error instanceof DescribeError) throw error;
        if ((error as { name?: string }).name === 'AbortError') {
          throw new DescribeError(objectName, undefined, `describe timed out after ${timeout}ms`, error);
        }
        throw new DescribeError(
          objectName,
          undefined,
          `describe failed: ${(error as Error).message}`,
          error,
        );
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return '';
  }
}

function normalizeDescribe(raw: DescribeResult): DescribeResult {
  // Defensive: Salesforce may omit fields[] for unusual objects (events).
  return {
    name: raw.name,
    label: raw.label,
    custom: !!raw.custom,
    createable: !!raw.createable,
    fields: Array.isArray(raw.fields)
      ? raw.fields.map((f) => ({
          name: f.name,
          label: f.label ?? f.name,
          type: f.type ?? 'string',
          nillable: !!f.nillable,
          createable: !!f.createable,
          updateable: !!f.updateable,
          unique: !!f.unique,
          length: typeof f.length === 'number' ? f.length : 0,
          picklistValues: Array.isArray(f.picklistValues)
            ? f.picklistValues.map((v) => ({
                value: v.value,
                label: v.label ?? v.value,
                active: v.active !== false,
                defaultValue: !!v.defaultValue,
              }))
            : [],
          referenceTo: Array.isArray(f.referenceTo) ? f.referenceTo : [],
          defaultValueFormula: f.defaultValueFormula ?? null,
        }))
      : [],
  };
}
