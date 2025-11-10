/**
 * In-memory metadata registry
 */

import type {
  MetadataItem,
  MetadataType,
  MetadataPurpose,
  ScanStatistics,
} from '../types/metadata.js';
import type { RegistryJSON } from '../types/registry.js';

/**
 * In-memory registry implementation
 */
export class MetadataRegistry {
  private items: MetadataItem[] = [];
  private errors: number = 0;
  private warnings: number = 0;

  /**
   * Adds a metadata item to the registry
   */
  addItem(item: MetadataItem): void {
    this.items.push(item);
  }

  /**
   * Gets all items
   */
  getItems(): MetadataItem[] {
    return [...this.items];
  }

  /**
   * Gets items filtered by type
   */
  getItemsByType(type: MetadataType): MetadataItem[] {
    return this.items.filter((item) => item.type === type);
  }

  /**
   * Gets items filtered by purpose
   */
  getItemsByPurpose(purpose: MetadataPurpose): MetadataItem[] {
    return this.items.filter((item) => item.purposes.includes(purpose));
  }

  /**
   * Calculates and returns statistics
   */
  getStatistics(): ScanStatistics {
    const countsByType: Record<MetadataType, number> = {
      object: 0,
      class: 0,
      trigger: 0,
      lwc: 0,
      aura: 0,
      flow: 0,
      profile: 0,
      permissionset: 0,
      permissionsetgroup: 0,
      custompermission: 0,
      layout: 0,
      page: 0,
      label: 0,
      flexipage: 0,
      custom: 0,
    };

    const countsByPurpose: Record<MetadataPurpose, number> = {
      'data-model': 0,
      ui: 0,
      'business-logic': 0,
      permissions: 0,
      configuration: 0,
    };

    // Count by type
    for (const item of this.items) {
      countsByType[item.type]++;
      // Count by purpose
      for (const purpose of item.purposes) {
        countsByPurpose[purpose]++;
      }
    }

    return {
      totalItems: this.items.length,
      countsByType,
      countsByPurpose,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Increments error count
   */
  incrementErrors(): void {
    this.errors++;
  }

  /**
   * Increments warning count
   */
  incrementWarnings(): void {
    this.warnings++;
  }

  /**
   * Converts registry to JSON format
   */
  toJSON(): RegistryJSON {
    return {
      items: this.items,
      statistics: this.getStatistics(),
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}

