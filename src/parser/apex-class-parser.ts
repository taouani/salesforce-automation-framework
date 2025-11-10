/**
 * Apex class file parser using regex-based extraction
 * This approach is more reliable for metadata extraction than full AST parsing
 */

import { readFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import { ApexClassParseError } from '../utils/apex-errors.js';
import type {
  ApexClassDefinition,
  ApexMethodDefinition,
  ApexPropertyDefinition,
  InnerClassDefinition,
  AnnotationDefinition,
  ApexParameterDefinition,
  AccessModifier,
  SharingModifier,
} from '../types/apex-parsed.js';

/**
 * Parses an Apex class file and extracts class structure
 */
export async function parseApexClassFile(filePath: string): Promise<ApexClassDefinition> {
  try {
    const code = await readFile(filePath, 'utf-8');
    return parseApexClassCode(code, filePath);
  } catch (error) {
    logger.warn({ filePath, error }, 'Failed to parse Apex class file');
    if (error instanceof Error) {
      throw new ApexClassParseError(filePath, error);
    }
    throw new ApexClassParseError(filePath);
  }
}

/**
 * Parses Apex class code and extracts class structure (allows code to be passed directly)
 */
export function parseApexClassCode(code: string, filePath: string): ApexClassDefinition {
  // Extract class name from file path if not found in code
  const fileName = filePath.split('/').pop()?.replace(/\.cls$/, '') || '';
  
  // Extract class definition
  const classDef = extractClassDefinition(code, fileName);
  
  return classDef;
}

/**
 * Extracts class definition from Apex code
 */
function extractClassDefinition(code: string, fallbackName: string): ApexClassDefinition {
  // Simplified class declaration regex - more tolerant
  // Match: [modifiers] class ClassName [extends ...] [implements ...] {
  const classMatch = code.match(
    /\b(?:public|private|global|with\s+sharing|without\s+sharing|inherited\s+sharing)?\s*(?:@[\w.]+(?:\s*\([^)]*\))?\s*)*\s*(?:public|private|global|with\s+sharing|without\s+sharing|inherited\s+sharing)?\s*class\s+(\w+)(?:\s+extends\s+([\w.]+))?(?:\s+implements\s+([\w.,\s]+))?\s*\{/i
  );
  
  if (!classMatch) {
    // More tolerant: try simpler pattern
    const simpleMatch = code.match(/\bclass\s+(\w+)/i);
    if (simpleMatch) {
      // Return minimal definition if we can't parse fully
      return {
        name: simpleMatch[1] || fallbackName,
        methods: [],
        properties: [],
        isTestClass: /\b@isTest\b/i.test(code),
        implementsBatchable: false,
        implementsQueueable: false,
        implementsSchedulable: false,
      };
    }
    throw new Error(`Could not find class declaration in code`);
  }
  
  const className = classMatch[1] || fallbackName;
  const superclass = classMatch[2] || undefined;
  const interfacesStr = classMatch[3];
  const interfaces = interfacesStr
    ? interfacesStr.split(',').map((i) => i.trim()).filter(Boolean)
    : [];
  
  // Extract annotations before class declaration
  const annotations = extractAnnotations(code, /(?:public|private|global|with\s+sharing|without\s+sharing|inherited\s+sharing|\s)*(?:@[\w.]+(?:\s*\([^)]*\))?\s*)*\s*class/i);
  
  // Extract access modifier
  const accessModifier = extractAccessModifier(code, /(?:public|private|global|protected)\s+class/i);
  
  // Extract sharing modifier
  const sharingModifier = extractSharingModifier(code);
  
  // Check if test class
  const isTestClass = annotations.some((ann) => ann.name === 'isTest');
  
  // Extract class body content
  const classBodyMatch = code.match(/class\s+\w+[^{]*\{([\s\S]*)\}$/);
  const classBody = classBodyMatch ? classBodyMatch[1] : '';
  
  // Extract methods
  const methods = extractMethods(classBody);
  
  // Extract properties
  const properties = extractProperties(classBody);
  
  // Extract inner classes
  const innerClasses = extractInnerClasses(classBody);
  
  // Check for Batchable, Queueable, Schedulable implementations
  const implementsBatchable = interfaces.some((i) => i.includes('Batchable'));
  const implementsQueueable = interfaces.includes('Queueable');
  const implementsSchedulable = interfaces.includes('Schedulable');
  
  return {
    name: className,
    annotations: annotations.length > 0 ? annotations : undefined,
    accessModifier,
    sharingModifier,
    superclass,
    interfaces: interfaces.length > 0 ? interfaces : undefined,
    methods,
    properties,
    innerClasses: innerClasses.length > 0 ? innerClasses : undefined,
    isTestClass,
    implementsBatchable,
    implementsQueueable,
    implementsSchedulable,
  };
}

/**
 * Extracts annotations from code
 */
function extractAnnotations(code: string, beforePattern: RegExp): AnnotationDefinition[] {
  const annotations: AnnotationDefinition[] = [];
  
  // Find annotations before the pattern
  const beforeMatch = code.match(beforePattern);
  if (!beforeMatch) {
    return annotations;
  }
  
  const beforeIndex = beforeMatch.index || 0;
  const beforeCode = code.substring(0, beforeIndex);
  
  // Match @Annotation or @Annotation(params)
  const annotationRegex = /@(\w+(?:\.\w+)*)(?:\s*\(([^)]*)\))?/g;
  let match;
  
  while ((match = annotationRegex.exec(beforeCode)) !== null) {
    const name = match[1];
    const paramsStr = match[2];
    const params: Record<string, unknown> = {};
    
    if (paramsStr) {
      // Simple parameter extraction (key=value pairs)
      const paramMatches = paramsStr.match(/(\w+)\s*=\s*([^,)]+)/g);
      if (paramMatches) {
        for (const paramMatch of paramMatches) {
          const [key, value] = paramMatch.split('=').map((s) => s.trim());
          params[key] = value.replace(/['"]/g, '');
        }
      }
    }
    
    annotations.push({
      name,
      parameters: Object.keys(params).length > 0 ? params : undefined,
    });
  }
  
  return annotations;
}

/**
 * Extracts access modifier from code
 */
function extractAccessModifier(code: string, pattern: RegExp): AccessModifier | undefined {
  const match = code.match(pattern);
  if (!match) {
    return undefined;
  }
  
  const fullMatch = match[0];
  if (fullMatch.includes('public')) return 'public';
  if (fullMatch.includes('private')) return 'private';
  if (fullMatch.includes('global')) return 'global';
  if (fullMatch.includes('protected')) return 'protected';
  
  return undefined;
}

/**
 * Extracts sharing modifier from code
 */
function extractSharingModifier(code: string): SharingModifier | undefined {
  if (/\bwith\s+sharing\b/i.test(code)) {
    return 'with sharing';
  }
  if (/\bwithout\s+sharing\b/i.test(code)) {
    return 'without sharing';
  }
  if (/\binherited\s+sharing\b/i.test(code)) {
    return 'inherited sharing';
  }
  return undefined;
}

/**
 * Extracts methods from class body
 */
function extractMethods(classBody: string): ApexMethodDefinition[] {
  const methods: ApexMethodDefinition[] = [];
  
  // Match method declarations
  // Pattern: [modifiers] [returnType] methodName([parameters]) { ... }
  const methodRegex = /(?:(?:public|private|global|protected|static|@[\w.]+(?:\s*\([^)]*\))?)\s+)*(?:(\w+(?:\[\])*)\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g;
  
  let match;
  while ((match = methodRegex.exec(classBody)) !== null) {
    const returnType = match[1] || 'void';
    const methodName = match[2];
    const paramsStr = match[3];
    
    if (!methodName || methodName === 'class') {
      continue; // Skip if it's not a method
    }
    
    // Extract modifiers from the match
    const fullMatch = match[0];
    const accessModifier = extractAccessModifier(fullMatch, /(?:public|private|global|protected)/i);
    const isStatic = /\bstatic\b/.test(fullMatch);
    
    // Extract annotations
    const annotations = extractAnnotations(fullMatch, /@[\w.]+/);
    
    // Extract parameters
    const parameters = extractParameters(paramsStr);
    
    // Check if test method
    const isTestMethod = annotations.some((ann) => ann.name === 'isTest') ||
                         /\btestMethod\b/.test(fullMatch);
    const isTestSetup = annotations.some((ann) => ann.name === 'TestSetup');
    
    // Extract exceptions (throws clause) - look after method signature
    const afterMatch = classBody.substring(match.index! + match[0].length);
    const throwsMatch = afterMatch.match(/throws\s+([\w.,\s]+)/);
    const exceptions = throwsMatch
      ? throwsMatch[1].split(',').map((e) => e.trim()).filter(Boolean)
      : undefined;
    
    methods.push({
      name: methodName,
      parameters,
      returnType,
      accessModifier,
      isStatic,
      annotations: annotations.length > 0 ? annotations : undefined,
      exceptions,
      isTestMethod,
      isTestSetup,
    });
  }
  
  return methods;
}

/**
 * Extracts parameters from parameter string
 */
function extractParameters(paramsStr: string): ApexParameterDefinition[] {
  if (!paramsStr.trim()) {
    return [];
  }
  
  const parameters: ApexParameterDefinition[] = [];
  const paramParts = paramsStr.split(',').map((p) => p.trim());
  
  for (const paramPart of paramParts) {
    // Match: Type paramName or Type paramName = defaultValue
    const paramMatch = paramPart.match(/(\w+(?:\[\])*)\s+(\w+)(?:\s*=\s*(.+))?/);
    if (paramMatch) {
      parameters.push({
        name: paramMatch[2],
        type: paramMatch[1],
        defaultValue: paramMatch[3] ? paramMatch[3].trim() : undefined,
      });
    }
  }
  
  return parameters;
}

/**
 * Extracts properties from class body
 */
function extractProperties(classBody: string): ApexPropertyDefinition[] {
  const properties: ApexPropertyDefinition[] = [];
  
  // Match field declarations: [modifiers] Type fieldName [= defaultValue];
  const fieldRegex = /(?:(?:public|private|global|protected|static|final|transient|@[\w.]+)\s+)+(\w+(?:\[\])*)\s+(\w+)(?:\s*=\s*([^;]+))?\s*;/g;
  
  let match;
  while ((match = fieldRegex.exec(classBody)) !== null) {
    const type = match[1];
    const fieldName = match[2];
    const defaultValue = match[3] ? match[3].trim() : undefined;
    
    const fullMatch = match[0];
    const accessModifier = extractAccessModifier(fullMatch, /(?:public|private|global|protected)/i);
    const isStatic = /\bstatic\b/.test(fullMatch);
    const isFinal = /\bfinal\b/.test(fullMatch);
    const isTransient = /\btransient\b/.test(fullMatch);
    
    // Extract annotations
    const annotations = extractAnnotations(fullMatch, /@[\w.]+/);
    
    properties.push({
      name: fieldName,
      type,
      accessModifier,
      isStatic,
      isFinal,
      isTransient,
      annotations: annotations.length > 0 ? annotations : undefined,
      defaultValue,
    });
  }
  
  return properties;
}

/**
 * Extracts inner classes from class body
 */
function extractInnerClasses(classBody: string): InnerClassDefinition[] {
  const innerClasses: InnerClassDefinition[] = [];
  
  // Match inner class declarations
  const innerClassRegex = /(?:(?:public|private|global|protected)\s+)*class\s+(\w+)[^{]*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  
  let match;
  while ((match = innerClassRegex.exec(classBody)) !== null) {
    const className = match[1];
    const innerClassBody = match[2];
    
    const accessModifier = extractAccessModifier(match[0], /(?:public|private|global|protected)/i);
    const annotations = extractAnnotations(match[0], /@[\w.]+/);
    
    const methods = extractMethods(innerClassBody);
    const properties = extractProperties(innerClassBody);
    
    innerClasses.push({
      name: className,
      accessModifier,
      annotations: annotations.length > 0 ? annotations : undefined,
      methods,
      properties,
    });
  }
  
  return innerClasses;
}
