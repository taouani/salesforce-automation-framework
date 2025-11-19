/**
 * Name Sanitization Utilities
 * Converts metadata names to valid TypeScript identifiers
 */

/**
 * Sanitizes a name to be a valid TypeScript identifier
 * Removes or replaces invalid characters (dots, hyphens, etc.)
 * 
 * @param name - The name to sanitize
 * @param options - Options for sanitization
 * @returns A valid TypeScript identifier
 */
export function sanitizeTypeScriptName(
  name: string,
  options: {
    case?: 'camelCase' | 'PascalCase';
    removeSuffix?: string;
  } = {}
): string {
  const { case: caseStyle = 'PascalCase', removeSuffix } = options;
  
  // Remove common suffixes like .object-meta.xml, .cls, etc.
  let cleaned = name;
  if (removeSuffix) {
    cleaned = cleaned.replace(new RegExp(`${removeSuffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '');
  }
  
  // Remove common file extensions and metadata suffixes
  cleaned = cleaned
    .replace(/\.object-meta\.xml$/i, '')
    .replace(/\.cls$/i, '')
    .replace(/\.trigger$/i, '')
    .replace(/\.js$/i, '')
    .replace(/\.html$/i, '')
    .replace(/\.css$/i, '')
    .replace(/\.cmp$/i, '')
    .replace(/\.app$/i, '')
    .replace(/\.xml$/i, '');
  
  // Replace invalid characters (dots, hyphens, spaces, underscores) with spaces
  cleaned = cleaned.replace(/[^a-zA-Z0-9]/g, ' ');
  
  // Split into words and filter empty strings
  let words = cleaned.split(/\s+/).filter(Boolean);
  
  // Split any camelCase/PascalCase words into separate words
  // This handles cases like "AccountAnonymizationEvent" -> ["Account", "Anonymization", "Event"]
  words = words.flatMap(word => {
    // If word contains camelCase pattern (lowercase followed by uppercase), split it
    if (/[a-z][A-Z]/.test(word)) {
      return word.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s+/).filter(Boolean);
    }
    // If word is all uppercase or starts with uppercase, try to split on consecutive capitals
    // e.g., "API" stays as "API", but "XMLParser" becomes ["XML", "Parser"]
    if (/^[A-Z]/.test(word) && /[A-Z][a-z]/.test(word)) {
      return word.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').split(/\s+/).filter(Boolean);
    }
    return [word];
  });
  
  if (words.length === 0) {
    return caseStyle === 'PascalCase' ? 'Unknown' : 'unknown';
  }
  
  // Convert to camelCase or PascalCase
  if (caseStyle === 'camelCase') {
    const firstWord = words[0].charAt(0).toLowerCase() + words[0].slice(1).toLowerCase();
    const restWords = words.slice(1).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    return firstWord + restWords.join('');
  } else {
    // PascalCase - ensure all words are properly capitalized
    return words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join('');
  }
}

/**
 * Sanitizes a name for use as a TypeScript class name (PascalCase)
 */
export function sanitizeClassName(name: string): string {
  return sanitizeTypeScriptName(name, { case: 'PascalCase' });
}

/**
 * Sanitizes a name for use as a TypeScript function name (camelCase)
 */
export function sanitizeFunctionName(name: string): string {
  return sanitizeTypeScriptName(name, { case: 'camelCase' });
}

/**
 * Sanitizes a name for use as a TypeScript variable name (camelCase)
 */
export function sanitizeVariableName(name: string): string {
  return sanitizeTypeScriptName(name, { case: 'camelCase' });
}

/**
 * Generates a page object class name from an object name
 * Example: "Contact.object-meta.xml" -> "ContactPage"
 */
export function generatePageObjectClassName(objectName: string): string {
  const sanitized = sanitizeClassName(objectName);
  return `${sanitized}Page`;
}

/**
 * Generates a test data factory function name from an object name
 * Example: "Contact.object-meta.xml" -> "createContact"
 */
export function generateTestDataFactoryFunctionName(objectName: string): string {
  const sanitized = sanitizeClassName(objectName);
  return `create${sanitized}`;
}

/**
 * Generates a delete function name from an object name
 * Example: "Contact.object-meta.xml" -> "deleteContact"
 */
export function generateDeleteFunctionName(objectName: string): string {
  const sanitized = sanitizeClassName(objectName);
  return `delete${sanitized}`;
}

/**
 * Generates a relationship helper function name.
 * Example: "Account", "Contact" -> "createContactForAccount"
 */
export function generateRelationshipHelperName(parentObjectName: string, childObjectName: string): string {
  const sanitizedChild = sanitizeClassName(childObjectName);
  const sanitizedParent = sanitizeClassName(parentObjectName);
  return `create${sanitizedChild}For${sanitizedParent}`;
}

/**
 * Generates a file name from a class name (converts PascalCase to kebab-case)
 * Example: "ContactPage" -> "contact-page"
 * @param className - The class name to convert
 * @param suffix - Optional suffix to append (e.g., "-page", ".spec")
 */
export function generateFileNameFromClassName(className: string, suffix: string = ''): string {
  // Remove common suffixes like "Page", "ComponentPage", etc. before converting
  const cleaned = className
    .replace(/ComponentPage$/, '')
    .replace(/Page$/, '')
    .replace(/Component$/, '');
  
  // Convert PascalCase/camelCase to kebab-case
  // Handle underscores and mixed case properly
  const kebabCase = cleaned
    // Insert hyphens before uppercase letters that follow lowercase or numbers
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Insert hyphens between consecutive uppercase letters followed by lowercase
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // Replace underscores with hyphens (handle multiple underscores)
    .replace(/_+/g, '-')
    // Convert to lowercase
    .toLowerCase()
    // Remove any double hyphens that might have been created
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
  
  return suffix ? `${kebabCase}${suffix}` : kebabCase;
}

