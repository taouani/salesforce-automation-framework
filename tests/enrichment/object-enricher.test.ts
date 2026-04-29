import { describe, it, expect } from 'vitest';
import { enrichObjects } from '../../src/enrichment/object-enricher.js';
import type { DescribeClient, DescribeResult } from '../../src/enrichment/describe-client.js';
import type { ObjectDefinition } from '../../src/types/xml-parsed.js';

const accountObject = (): ObjectDefinition => ({
  fullName: 'Account',
  fields: [
    { fullName: 'Name', type: 'Text' },
    { fullName: 'Industry', type: 'Picklist' },
    { fullName: 'Custom_Field__c', type: 'Text', label: 'Outdated Label', required: false },
  ],
  validationRules: [],
  recordTypes: [],
  relationships: [],
});

const accountDescribe = (): DescribeResult => ({
  name: 'Account',
  label: 'Account (Org)',
  custom: false,
  createable: true,
  fields: [
    {
      name: 'Name',
      label: 'Account Name',
      type: 'string',
      nillable: false,
      createable: true,
      updateable: true,
      unique: false,
      length: 255,
      picklistValues: [],
      referenceTo: [],
      defaultValueFormula: null,
    },
    {
      name: 'Industry',
      label: 'Industry',
      type: 'picklist',
      nillable: true,
      createable: true,
      updateable: true,
      unique: false,
      length: 0,
      picklistValues: [
        { value: 'Banking', label: 'Banking', active: true, defaultValue: false },
        { value: 'Retired Value', label: 'Retired Value', active: false, defaultValue: false },
        { value: 'Technology', label: 'Technology', active: true, defaultValue: false },
      ],
      referenceTo: [],
      defaultValueFormula: null,
    },
    {
      name: 'Custom_Field__c',
      label: 'Live Label',
      type: 'string',
      nillable: false,
      createable: true,
      updateable: true,
      unique: false,
      length: 100,
      picklistValues: [],
      referenceTo: [],
      defaultValueFormula: null,
    },
  ],
});

function makeClient(map: Record<string, DescribeResult | null | Error>): DescribeClient {
  return {
    async describe(name) {
      const result = map[name];
      if (result instanceof Error) throw result;
      return result ?? null;
    },
  };
}

describe('enrichObjects', () => {
  it('returns empty results for empty input', async () => {
    const client = makeClient({});
    const { objects, summary } = await enrichObjects([], client);
    expect(objects).toEqual([]);
    expect(summary).toEqual({
      enriched: 0,
      missing: 0,
      errored: 0,
      fieldsUpdated: 0,
      errors: {},
    });
  });

  it('merges label, required, length, and picklist truth into matching fields', async () => {
    const obj = accountObject();
    const client = makeClient({ Account: accountDescribe() });
    const { objects, summary } = await enrichObjects([obj], client);

    expect(summary.enriched).toBe(1);
    expect(summary.missing).toBe(0);
    expect(summary.errored).toBe(0);
    expect(summary.fieldsUpdated).toBe(3);

    const enriched = objects[0];
    const name = enriched.fields.find((f) => f.fullName === 'Name')!;
    expect(name.label).toBe('Account Name');
    expect(name.required).toBe(true);
    expect(name.length).toBe(255);

    const industry = enriched.fields.find((f) => f.fullName === 'Industry')!;
    expect((industry as { picklistValues?: Array<{ value: string }> }).picklistValues).toEqual([
      { value: 'Banking', label: 'Banking', active: true, defaultValue: false },
      { value: 'Retired Value', label: 'Retired Value', active: false, defaultValue: false },
      { value: 'Technology', label: 'Technology', active: true, defaultValue: false },
    ]);

    const custom = enriched.fields.find((f) => f.fullName === 'Custom_Field__c')!;
    expect(custom.label).toBe('Live Label');
    expect(custom.required).toBe(true);
  });

  it('does not mutate the input object', async () => {
    const obj = accountObject();
    const original = JSON.stringify(obj);
    const client = makeClient({ Account: accountDescribe() });
    await enrichObjects([obj], client);
    expect(JSON.stringify(obj)).toBe(original);
  });

  it('counts 404 (null describe) as missing and passes the object through', async () => {
    const obj = accountObject();
    const client = makeClient({ Account: null });
    const { objects, summary } = await enrichObjects([obj], client);
    expect(summary.missing).toBe(1);
    expect(summary.enriched).toBe(0);
    expect(objects[0]).toEqual(obj);
  });

  it('captures errors per object and continues', async () => {
    const obj = accountObject();
    const client = makeClient({ Account: new Error('boom') });
    const { objects, summary } = await enrichObjects([obj], client);
    expect(summary.errored).toBe(1);
    expect(summary.errors.Account).toMatch(/boom/);
    expect(objects[0]).toEqual(obj);
  });

  it('leaves a field unchanged when describe has no matching API name', async () => {
    const obj: ObjectDefinition = {
      fullName: 'Account',
      fields: [{ fullName: 'Phantom__c', type: 'Text', label: 'Original' }],
      validationRules: [],
      recordTypes: [],
      relationships: [],
    };
    const client = makeClient({ Account: accountDescribe() });
    const { objects, summary } = await enrichObjects([obj], client);
    expect(summary.fieldsUpdated).toBe(0);
    expect(objects[0].fields[0]).toEqual(obj.fields[0]);
  });

  it('respects the concurrency cap (does not overlap describe calls beyond limit)', async () => {
    let inFlight = 0;
    let peakConcurrency = 0;
    const client: DescribeClient = {
      async describe() {
        inFlight++;
        peakConcurrency = Math.max(peakConcurrency, inFlight);
        await new Promise((r) => setTimeout(r, 5));
        inFlight--;
        return accountDescribe();
      },
    };
    const objs = Array.from({ length: 12 }, () => accountObject());
    await enrichObjects(objs, client, { concurrency: 3 });
    expect(peakConcurrency).toBeLessThanOrEqual(3);
  });
});
