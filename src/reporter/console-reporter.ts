/**
 * Console report generator
 */

import type { MetadataRegistry } from '../registry/metadata-registry.js';
import type { MetadataItem } from '../types/metadata.js';

/**
 * Generates a human-readable console report
 */
export function generateConsoleReport(registry: MetadataRegistry): string {
  const stats = registry.getStatistics();
  const items = registry.getItems();

  let report = '\n';
  report += '='.repeat(80) + '\n';
  report += 'Salesforce Metadata Inventory Report\n';
  report += '='.repeat(80) + '\n\n';

  // Summary Statistics
  report += 'SUMMARY STATISTICS\n';
  report += '-'.repeat(80) + '\n';
  report += `Total Metadata Items: ${stats.totalItems}\n`;
  report += `Errors: ${stats.errors}\n`;
  report += `Warnings: ${stats.warnings}\n\n`;

  // Counts by Type
  report += 'COUNTS BY TYPE\n';
  report += '-'.repeat(80) + '\n';
  const typeEntries = Object.entries(stats.countsByType)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  for (const [type, count] of typeEntries) {
    report += `  ${type.padEnd(20)}: ${count}\n`;
  }
  report += '\n';

  // Counts by Purpose
  report += 'COUNTS BY PURPOSE\n';
  report += '-'.repeat(80) + '\n';
  const purposeEntries = Object.entries(stats.countsByPurpose)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  for (const [purpose, count] of purposeEntries) {
    report += `  ${purpose.padEnd(20)}: ${count}\n`;
  }
  report += '\n';

  // Metadata Items by Type
  report += 'METADATA ITEMS\n';
  report += '-'.repeat(80) + '\n';
  const itemsByType = new Map<string, MetadataItem[]>();
  for (const item of items) {
    if (!itemsByType.has(item.type)) {
      itemsByType.set(item.type, []);
    }
    itemsByType.get(item.type)!.push(item);
  }

  for (const [type, typeItems] of Array.from(itemsByType.entries()).sort()) {
    report += `\n${type.toUpperCase()} (${typeItems.length} items)\n`;
    report += '-'.repeat(80) + '\n';
    for (const item of typeItems.slice(0, 10)) {
      report += `  ${item.path}\n`;
    }
    if (typeItems.length > 10) {
      report += `  ... and ${typeItems.length - 10} more\n`;
    }
  }

  report += '\n' + '='.repeat(80) + '\n';

  return report;
}

