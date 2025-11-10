/**
 * Code formatting utility using prettier
 */

import prettier from 'prettier';
import { logger } from '../utils/logger.js';

/**
 * Prettier configuration for TypeScript
 */
const prettierConfig: prettier.Options = {
  parser: 'typescript',
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  printWidth: 100,
  arrowParens: 'always',
};

/**
 * Formats code using prettier
 */
export async function formatCode(code: string, fileType: 'typescript' | 'json' = 'typescript'): Promise<string> {
  try {
    logger.debug({ fileType, codeLength: code.length }, 'Formatting code');
    
    const config = fileType === 'json' 
      ? { ...prettierConfig, parser: 'json' }
      : prettierConfig;
    
    const formatted = await prettier.format(code, config);
    logger.debug({ formattedLength: formatted.length }, 'Code formatted successfully');
    return formatted;
  } catch (error) {
    // If formatting fails, return original code with warning
    logger.warn({ error, fileType }, 'Failed to format code, returning original');
    return code;
  }
}

