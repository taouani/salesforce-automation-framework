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
    // Skip formatting for very large files (over 100KB) to avoid performance issues
    if (code.length > 100 * 1024) {
      logger.debug({ fileType, codeLength: code.length }, 'Skipping formatting for large file');
      return code;
    }
    
    logger.debug({ fileType, codeLength: code.length }, 'Formatting code');
    
    const config = fileType === 'json' 
      ? { ...prettierConfig, parser: 'json' }
      : prettierConfig;
    
    const formatted = await prettier.format(code, config);
    logger.debug({ formattedLength: formatted.length }, 'Code formatted successfully');
    return formatted;
  } catch (error) {
    // If formatting fails, return original code silently (code is still valid, just not formatted)
    // Only log at debug level since this is not a critical error
    logger.debug({ 
      fileType, 
      codeLength: code.length,
      error: error instanceof Error ? error.message : String(error)
    }, 'Formatting skipped (Prettier parse error - code will be written unformatted)');
    return code;
  }
}

