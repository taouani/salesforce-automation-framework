/**
 * Markdown report generator
 */

import type { MetadataRegistry } from '../registry/metadata-registry.js';
import type { MetadataItem } from '../types/metadata.js';

/**
 * Generates a Markdown report
 */
export function generateMarkdownReport(registry: MetadataRegistry): string {
  const stats = registry.getStatistics();
  const items = registry.getItems();

  let report = '# Salesforce Metadata Inventory Report\n\n';
  report += `Generated at: ${new Date().toISOString()}\n\n`;

  // Summary Statistics
  report += '## Summary Statistics\n\n';
  report += `- **Total Metadata Items**: ${stats.totalItems}\n`;
  report += `- **Errors**: ${stats.errors}\n`;
  report += `- **Warnings**: ${stats.warnings}\n\n`;

  // Counts by Type
  report += '## Counts by Type\n\n';
  report += '| Type | Count |\n';
  report += '|------|-------|\n';
  const typeEntries = Object.entries(stats.countsByType)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  for (const [type, count] of typeEntries) {
    report += `| ${type} | ${count} |\n`;
  }
  report += '\n';

  // Counts by Purpose
  report += '## Counts by Purpose\n\n';
  report += '| Purpose | Count |\n';
  report += '|---------|-------|\n';
  const purposeEntries = Object.entries(stats.countsByPurpose)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  for (const [purpose, count] of purposeEntries) {
    report += `| ${purpose} | ${count} |\n`;
  }
  report += '\n';

  // Metadata Items
  report += '## Metadata Items\n\n';
  const itemsByType = new Map<string, MetadataItem[]>();
  for (const item of items) {
    if (!itemsByType.has(item.type)) {
      itemsByType.set(item.type, []);
    }
    itemsByType.get(item.type)!.push(item);
  }

  for (const [type, typeItems] of Array.from(itemsByType.entries()).sort()) {
    report += `### ${type.charAt(0).toUpperCase() + type.slice(1)} (${typeItems.length} items)\n\n`;
    for (const item of typeItems) {
      report += `- \`${item.path}\`\n`;
    }
    report += '\n';
  }

  return report;
}

