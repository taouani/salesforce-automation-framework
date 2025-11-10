/**
 * Template loader utility
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync } from 'fs';

// Get current directory for template files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try both source and dist locations
function getTemplatesDir(): string {
  // Check if we're in dist (compiled) or src (source)
  const distTemplatesDir = join(__dirname, 'templates');
  const srcTemplatesDir = join(__dirname, '..', '..', 'src', 'generator', 'templates');
  
  // Prefer dist templates if they exist, otherwise use source templates
  if (existsSync(distTemplatesDir)) {
    return distTemplatesDir;
  }
  if (existsSync(srcTemplatesDir)) {
    return srcTemplatesDir;
  }
  // Fallback: try relative to process.cwd()
  const cwdTemplatesDir = join(process.cwd(), 'src', 'generator', 'templates');
  if (existsSync(cwdTemplatesDir)) {
    return cwdTemplatesDir;
  }
  throw new Error(`Templates directory not found. Tried: ${distTemplatesDir}, ${srcTemplatesDir}, ${cwdTemplatesDir}`);
}

/**
 * Reads a template file
 */
export async function readTemplate(templateName: string): Promise<string> {
  const templatesDir = getTemplatesDir();
  const templatePath = join(templatesDir, templateName);
  return await readFile(templatePath, 'utf-8');
}

