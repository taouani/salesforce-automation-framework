/**
 * Merges Salesforce describe-API truth into parsed XML metadata.
 *
 * The XML metadata gives us field shape and validation rules; the describe
 * API gives us label translations, picklist `validValues`, and accurate
 * `nillable -> required` flags that XML can't express on standard fields.
 * This module fuses the two so downstream test generators emit assertions
 * that line up with the live org.
 */

import { logger } from '../utils/logger.js';
import { processFilesInParallel } from '../scanner/file-scanner.js';
import type { ObjectDefinition, FieldDefinition } from '../types/xml-parsed.js';
import type { DescribeClient, DescribeField, DescribePicklistValue } from './describe-client.js';

export interface EnrichmentSummary {
  /** How many objects had their describe successfully merged. */
  enriched: number;
  /** How many objects describe returned 404 (or were skipped). */
  missing: number;
  /** How many objects errored during describe. */
  errored: number;
  /** Total fields that picked up at least one piece of new truth. */
  fieldsUpdated: number;
  /** Errors keyed by object name. */
  errors: Record<string, string>;
}

export interface EnrichObjectsOptions {
  /** Concurrency cap for describe calls. Defaults to 5 to be polite. */
  concurrency?: number;
}

/**
 * Returns enriched copies of `objects`. The originals are not mutated, so
 * callers can swap result back into their parsed-results JSON.
 */
export async function enrichObjects(
  objects: ObjectDefinition[],
  client: DescribeClient,
  options: EnrichObjectsOptions = {},
): Promise<{ objects: ObjectDefinition[]; summary: EnrichmentSummary }> {
  const concurrency = options.concurrency ?? 5;

  const summary: EnrichmentSummary = {
    enriched: 0,
    missing: 0,
    errored: 0,
    fieldsUpdated: 0,
    errors: {},
  };

  const results = await processFilesInParallel(
    objects,
    async (object) => {
      try {
        const describe = await client.describe(object.fullName);
        if (!describe) {
          summary.missing++;
          return object;
        }
        const { object: enriched, fieldsUpdated } = mergeDescribeIntoObject(object, describe);
        summary.enriched++;
        summary.fieldsUpdated += fieldsUpdated;
        return enriched;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        summary.errored++;
        summary.errors[object.fullName] = message;
        logger.warn({ object: object.fullName, error: message }, 'Describe enrichment failed');
        return object; // fall back to the parsed-only definition
      }
    },
    concurrency,
  );

  return { objects: results, summary };
}

function mergeDescribeIntoObject(
  object: ObjectDefinition,
  describe: { fields: DescribeField[]; label: string },
): { object: ObjectDefinition; fieldsUpdated: number } {
  const describeByApi = new Map<string, DescribeField>();
  for (const field of describe.fields) {
    describeByApi.set(field.name, field);
  }

  let fieldsUpdated = 0;
  const enrichedFields: FieldDefinition[] = object.fields.map((field) => {
    const truth = describeByApi.get(field.fullName);
    if (!truth) return field;
    const merged = mergeFieldTruth(field, truth);
    if (merged !== field) fieldsUpdated++;
    return merged;
  });

  return {
    object: {
      ...object,
      label: object.label ?? describe.label,
      fields: enrichedFields,
    },
    fieldsUpdated,
  };
}

function mergeFieldTruth(field: FieldDefinition, truth: DescribeField): FieldDefinition {
  let changed = false;
  const next: FieldDefinition = { ...field };

  if (truth.label && truth.label !== field.label) {
    next.label = truth.label;
    changed = true;
  }

  // describe.nillable === false on createable fields is the authoritative
  // "required" signal; XML's `required` is sometimes absent on standard
  // fields (Account.Name) where the constraint is implicit.
  const describeRequired = !truth.nillable && truth.createable;
  if (describeRequired && !field.required) {
    next.required = true;
    changed = true;
  }

  if (typeof truth.length === 'number' && truth.length > 0 && truth.length !== field.length) {
    next.length = truth.length;
    changed = true;
  }

  // Attach picklist values when present. `picklistValues` isn't in the
  // declared FieldDefinition shape but the interface is open via index
  // signature; downstream generators can read it when defined.
  if (truth.picklistValues.length > 0) {
    const simplified = truth.picklistValues.map((v: DescribePicklistValue) => ({
      value: v.value,
      label: v.label,
      active: v.active,
      defaultValue: v.defaultValue,
    }));
    if (!shallowEqual(next.picklistValues as unknown, simplified)) {
      next.picklistValues = simplified;
      changed = true;
    }
  }

  return changed ? next : field;
}

function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false;
  }
  return true;
}
