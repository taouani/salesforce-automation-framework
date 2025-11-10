/**
 * JavaScript file parser for LWC components using Babel
 */

import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

// Handle both default and named exports
const traverse = (_traverse as any).default || _traverse;
import { readFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import { JavaScriptParseError } from '../utils/lwc-errors.js';
import type {
  JavaScriptDefinition,
  PropertyDefinition,
  MethodDefinition,
  EventHandlerDefinition,
  WireDefinition,
  ImportDefinition,
  ParameterDefinition,
} from '../types/lwc-parsed.js';

/**
 * Babel parser options for LWC JavaScript files
 */
const parserOptions: Parameters<typeof parse>[1] = {
  sourceType: 'module',
  plugins: [
    ['decorators', { decoratorsBeforeExport: true }],
    'classProperties',
    'objectRestSpread',
    'typescript',
    'asyncGenerators',
    'functionBind',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'dynamicImport',
    'nullishCoalescingOperator',
    'optionalChaining',
  ],
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
};

/**
 * Lifecycle hook names
 */
const LIFECYCLE_HOOKS = [
  'connectedCallback',
  'renderedCallback',
  'disconnectedCallback',
  'errorCallback',
];

/**
 * Parses a JavaScript file and extracts component structure
 */
export async function parseJavaScriptFile(filePath: string): Promise<JavaScriptDefinition> {
  try {
    logger.debug({ filePath }, 'Parsing JavaScript file');
    const code = await readFile(filePath, 'utf-8');
    const ast = parse(code, parserOptions);

    const result: JavaScriptDefinition = {
      properties: [],
      methods: [],
      eventHandlers: [],
      wireServices: [],
      imports: [],
      computedProperties: [],
      eventDispatchers: [],
      elementReferences: [],
    };

    traverse(ast, {
      // Extract class properties
      ClassProperty(path: NodePath<t.ClassProperty>) {
        const property = extractProperty(path.node);
        if (property) {
          result.properties.push(property);
        }
      },

      // Extract class methods (including getters and setters)
      ClassMethod(path: NodePath<t.ClassMethod>) {
        const method = extractMethod(path.node);
        if (method) {
          // Check if it's a getter or setter
          if (path.node.kind === 'get') {
            // Add to computed properties
            const computedProp: PropertyDefinition = {
              name: method.name,
              type: method.returnType,
              decorators: method.decorators,
              isPublic: method.isPublic,
              isReactive: false,
            };
            if (!result.computedProperties) {
              result.computedProperties = [];
            }
            result.computedProperties.push(computedProp);
          } else if (path.node.kind === 'set') {
            // Setters are also properties
            const setterProp: PropertyDefinition = {
              name: method.name,
              type: method.parameters[0]?.type,
              decorators: method.decorators,
              isPublic: method.isPublic,
              isReactive: false,
            };
            result.properties.push(setterProp);
          } else {
            // Regular methods
            result.methods.push(method);
            
            // Check if it's a lifecycle hook
            if (LIFECYCLE_HOOKS.includes(method.name)) {
              result.eventHandlers.push({
                name: method.name,
                type: 'lifecycle',
                handler: method.name,
              });
            }
          }
        }
      },

      // Extract import statements
      ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
        const importDef = extractImport(path.node);
        if (importDef) {
          result.imports.push(importDef);
        }
      },

      // Extract @wire decorators
      Decorator(path: NodePath<t.Decorator>) {
        if (t.isIdentifier(path.node.expression)) {
          const decoratorName = path.node.expression.name;
          if (decoratorName === 'wire') {
            const wireDef = extractWire(path);
            if (wireDef) {
              result.wireServices.push(wireDef);
            }
          }
        }
      },

      // Extract CustomEvent dispatchers
      CallExpression(path: NodePath<t.CallExpression>) {
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'dispatchEvent'
        ) {
          const dispatcher = extractEventDispatcher(path);
          if (dispatcher && result.eventDispatchers) {
            result.eventDispatchers.push(dispatcher);
          }
        }
      },
    });

    // Second pass for querySelector extraction
    traverse(ast, {
      CallExpression(path: NodePath<t.CallExpression>) {
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.property) &&
          (path.node.callee.property.name === 'querySelector' ||
            path.node.callee.property.name === 'querySelectorAll')
        ) {
          const selector = extractSelector(path);
          if (selector && result.elementReferences) {
            result.elementReferences.push(selector);
          }
        }
      },
    });

    logger.debug({ filePath, properties: result.properties.length, methods: result.methods.length }, 'JavaScript file parsed successfully');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.warn({ filePath, error: errorMessage, stack: errorStack }, 'Failed to parse JavaScript file');
    throw new JavaScriptParseError(filePath, error instanceof Error ? error : undefined);
  }
}

/**
 * Extracts property definition from AST node
 */
function extractProperty(
  node: t.ClassProperty | t.TSPropertySignature
): PropertyDefinition | null {
  if (!t.isIdentifier(node.key)) {
    return null;
  }

  const name = node.key.name;
  const decorators: string[] = [];
  let isPublic = false;
  let isReactive = false;

  // Extract decorators
  if ('decorators' in node && node.decorators) {
    for (const decorator of node.decorators) {
      if (t.isIdentifier(decorator.expression)) {
        const decoratorName = decorator.expression.name;
        decorators.push(decoratorName);
        if (decoratorName === 'api') {
          isPublic = true;
        } else if (decoratorName === 'track') {
          isReactive = true;
        }
      }
    }
  }

  // Extract type
  let type: string | undefined;
  if (node.typeAnnotation && t.isTSTypeAnnotation(node.typeAnnotation)) {
    type = extractTypeName(node.typeAnnotation.typeAnnotation);
  }

  // Extract default value
  let defaultValue: unknown;
  if (t.isClassProperty(node) && node.value) {
    defaultValue = extractValue(node.value);
  }

  return {
    name,
    type,
    decorators,
    defaultValue,
    isPublic,
    isReactive,
  };
}

/**
 * Extracts method definition from AST node
 */
function extractMethod(node: t.ClassMethod): MethodDefinition | null {
  if (!t.isIdentifier(node.key)) {
    return null;
  }

  const name = node.key.name;
  const decorators: string[] = [];
  let isPublic = false;

  // Extract decorators
  if (node.decorators) {
    for (const decorator of node.decorators) {
      if (t.isIdentifier(decorator.expression)) {
        const decoratorName = decorator.expression.name;
        decorators.push(decoratorName);
        if (decoratorName === 'api') {
          isPublic = true;
        }
      }
    }
  }

  // Extract parameters
  const parameters: ParameterDefinition[] = node.params.map((param) => {
    if (t.isIdentifier(param)) {
      return {
        name: param.name,
        type: param.typeAnnotation && t.isTSTypeAnnotation(param.typeAnnotation)
          ? extractTypeName(param.typeAnnotation.typeAnnotation)
          : undefined,
      };
    }
    return { name: 'unknown' };
  });

  // Extract return type
  let returnType: string | undefined;
  if (node.returnType && t.isTSTypeAnnotation(node.returnType)) {
    returnType = extractTypeName(node.returnType.typeAnnotation);
  }

  const isLifecycleHook = LIFECYCLE_HOOKS.includes(name);

  return {
    name,
    parameters,
    returnType,
    decorators,
    isPublic,
    isLifecycleHook,
  };
}

/**
 * Extracts import definition from AST node
 */
function extractImport(node: t.ImportDeclaration): ImportDefinition | null {
  const source = node.source.value as string;
  const specifiers: ImportDefinition['specifiers'] = [];
  let defaultImport: string | undefined;

  for (const specifier of node.specifiers) {
    if (t.isImportDefaultSpecifier(specifier)) {
      defaultImport = specifier.local.name;
      } else if (t.isImportSpecifier(specifier)) {
        const importedName = t.isIdentifier(specifier.imported)
          ? specifier.imported.name
          : t.isStringLiteral(specifier.imported)
            ? specifier.imported.value
            : 'unknown';
        specifiers.push({
          imported: importedName,
          local: specifier.local.name !== importedName ? specifier.local.name : undefined,
        });
      }
  }

  const isLightningImport = source.startsWith('lightning/');
  const isLWCImport = source.startsWith('c/');

  return {
    source,
    specifiers,
    defaultImport,
    isLightningImport,
    isLWCImport,
  };
}

/**
 * Extracts wire definition from decorator path
 */
function extractWire(path: NodePath<t.Decorator>): WireDefinition | null {
  // Wire decorator structure: @wire(adapter, params)
  const parent = path.parentPath;
  if (!parent) {
    return null;
  }

  // This is a simplified extraction - full implementation would need to handle wire adapter and params
  return {
    propertyOrMethod: 'unknown',
    adapter: 'unknown',
  };
}

/**
 * Extracts event dispatcher from call expression
 */
function extractEventDispatcher(path: NodePath<t.CallExpression>): EventHandlerDefinition | null {
  // CustomEvent dispatcher: this.dispatchEvent(new CustomEvent('eventName', { detail: ... }))
  const args = path.node.arguments;
  if (args.length > 0 && t.isNewExpression(args[0]) && t.isIdentifier(args[0].callee) && args[0].callee.name === 'CustomEvent') {
    const eventArgs = args[0].arguments;
    if (eventArgs.length > 0 && t.isStringLiteral(eventArgs[0])) {
      return {
        name: eventArgs[0].value,
        type: 'custom',
      };
    }
  }
  return null;
}

/**
 * Extracts selector from querySelector call
 */
function extractSelector(path: NodePath<t.CallExpression>): string | null {
  const args = path.node.arguments;
  if (args.length > 0 && t.isStringLiteral(args[0])) {
    return args[0].value;
  }
  return null;
}

/**
 * Extracts type name from TypeScript type annotation
 */
function extractTypeName(type: t.TSType): string {
  if (t.isTSTypeReference(type) && t.isIdentifier(type.typeName)) {
    return type.typeName.name;
  }
  if (t.isTSStringKeyword(type)) {
    return 'string';
  }
  if (t.isTSNumberKeyword(type)) {
    return 'number';
  }
  if (t.isTSBooleanKeyword(type)) {
    return 'boolean';
  }
  return 'unknown';
}

/**
 * Extracts value from AST node
 */
function extractValue(node: t.Node): unknown {
  if (t.isStringLiteral(node)) {
    return node.value;
  }
  if (t.isNumericLiteral(node)) {
    return node.value;
  }
  if (t.isBooleanLiteral(node)) {
    return node.value;
  }
  if (t.isNullLiteral(node)) {
    return null;
  }
  if (t.isObjectExpression(node)) {
    const obj: Record<string, unknown> = {};
    for (const prop of node.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        obj[prop.key.name] = extractValue(prop.value);
      }
    }
    return obj;
  }
  if (t.isArrayExpression(node)) {
    return node.elements.map((el) => (el ? extractValue(el) : null));
  }
  return undefined;
}

