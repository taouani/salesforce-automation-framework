/**
 * Classifies metadata by purpose
 */

import type { MetadataPurpose, MetadataType } from '../types/metadata.js';

/**
 * Mapping of metadata types to purposes
 */
const TYPE_PURPOSE_MAP: Record<MetadataType, MetadataPurpose[]> = {
  object: ['data-model', 'configuration'],
  class: ['business-logic'],
  trigger: ['business-logic'],
  lwc: ['ui'],
  aura: ['ui'],
  flow: ['business-logic', 'ui'],
  profile: ['permissions'],
  permissionset: ['permissions'],
  permissionsetgroup: ['permissions'],
  custompermission: ['permissions'],
  layout: ['ui', 'configuration'],
  page: ['ui'],
  label: ['configuration'],
  flexipage: ['ui', 'configuration'],
  custom: ['configuration'],
};

/**
 * Classifies metadata purposes from type
 */
export function classifyPurposes(type: MetadataType): MetadataPurpose[] {
  return TYPE_PURPOSE_MAP[type] || ['configuration'];
}

