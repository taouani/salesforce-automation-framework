/**
 * Renderer JavaScript parser for Aura components using Babel
 */

import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

// Handle both default and named exports
const traverse = (_traverse as any).default || _traverse;
import { readFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import { AuraJavaScriptParseError } from '../utils/aura-errors.js';
import type {
  RendererDefinition,
  RenderMethodDefinition,
  DOMManipulationDefinition,
} from '../types/aura-parsed.js';

/**
 * Babel parser options for Aura Renderer JavaScript files
 */
const parserOptions: Parameters<typeof parse>[1] = {
  sourceType: 'script',
  plugins: [
    'objectRestSpread',
    'asyncGenerators',
    'functionBind',
    'dynamicImport',
    'nullishCoalescingOperator',
    'optionalChaining',
  ],
  allowReturnOutsideFunction: true,
  allowAwaitOutsideFunction: true,
};

/**
 * Render method names in Aura
 */
const RENDER_METHODS = ['render', 'rerender', 'afterRender', 'unrender'];

/**
 * Parses a Renderer JavaScript file and extracts render methods
 */
export async function parseRendererJavaScriptFile(filePath: string): Promise<RendererDefinition> {
  try {
    logger.debug({ filePath }, 'Parsing Aura Renderer JavaScript file');
    const code = await readFile(filePath, 'utf-8');
    const ast = parse(code, parserOptions);

    const result: RendererDefinition = {
      renderMethods: [],
      domManipulation: [],
    };

    traverse(ast, {
      // Look for object expression (the renderer object literal)
      ObjectExpression(path: NodePath<t.ObjectExpression>) {
        path.node.properties.forEach((prop) => {
          if (t.isObjectMethod(prop) || (t.isObjectProperty(prop) && t.isFunctionExpression(prop.value))) {
            const method = extractRenderMethod(prop, path);
            if (method) {
              result.renderMethods.push(method);
            }
          }
        });
      },

      // Also look for standalone function declarations
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        if (t.isIdentifier(path.node.id) && RENDER_METHODS.includes(path.node.id.name)) {
          const method = extractStandaloneRenderMethod(path);
          if (method) {
            result.renderMethods.push(method);
          }
        }
      },
    });

    // Extract DOM manipulation from render methods
    result.renderMethods.forEach((method) => {
      if (method.implementation) {
        try {
          const methodAst = parse(method.implementation, parserOptions);
          traverse(methodAst, {
            CallExpression(path: NodePath<t.CallExpression>) {
              // Extract DOM manipulation calls
              const domManip = extractDOMManipulation(path);
              if (domManip) {
                result.domManipulation.push(domManip);
              }
            },
          });
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    logger.debug({ filePath, renderMethods: result.renderMethods.length }, 'Aura Renderer JavaScript file parsed successfully');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn({ filePath, error: errorMessage }, 'Failed to parse Aura Renderer JavaScript file');
    throw new AuraJavaScriptParseError(filePath, error instanceof Error ? error : undefined);
  }
}

/**
 * Extracts render method definition from object property
 */
function extractRenderMethod(
  prop: t.ObjectMethod | t.ObjectProperty,
  parentPath: NodePath<t.ObjectExpression>
): RenderMethodDefinition | null {
  let methodName: string;
  let functionNode: t.FunctionExpression | t.FunctionDeclaration;

  if (t.isObjectMethod(prop)) {
    if (!t.isIdentifier(prop.key)) {
      return null;
    }
    methodName = prop.key.name;
    if (!RENDER_METHODS.includes(methodName)) {
      return null;
    }
    // ObjectMethod is compatible for our purposes
    functionNode = prop as unknown as t.FunctionExpression;
  } else if (t.isObjectProperty(prop) && t.isFunctionExpression(prop.value)) {
    if (!t.isIdentifier(prop.key)) {
      return null;
    }
    methodName = prop.key.name;
    if (!RENDER_METHODS.includes(methodName)) {
      return null;
    }
    functionNode = prop.value;
  } else {
    return null;
  }

  // Extract implementation
  let implementation: string | undefined;
  if (functionNode.body && t.isBlockStatement(functionNode.body)) {
    // Try to get source from parent path context
    try {
      const source = (parentPath as any).hub?.file?.code;
      if (source && functionNode.body.start !== null && functionNode.body.end !== null) {
        implementation = source.substring(functionNode.body.start, functionNode.body.end);
      }
    } catch (e) {
      // Ignore if source not available
    }
  }

  return {
    methodName: methodName as 'render' | 'rerender' | 'afterRender' | 'unrender',
    implementation,
  };
}

/**
 * Extracts standalone render method declaration
 */
function extractStandaloneRenderMethod(path: NodePath<t.FunctionDeclaration>): RenderMethodDefinition | null {
  if (!t.isIdentifier(path.node.id)) {
    return null;
  }

  const methodName = path.node.id.name;
  if (!RENDER_METHODS.includes(methodName)) {
    return null;
  }

  let implementation: string | undefined;
  if (path.node.body && t.isBlockStatement(path.node.body)) {
    // Try to get source from path context
    try {
      const source = (path as any).hub?.file?.code;
      if (source && path.node.body.start !== null && path.node.body.end !== null) {
        implementation = source.substring(path.node.body.start, path.node.body.end);
      }
    } catch (e) {
      // Ignore if source not available
    }
  }

  return {
    methodName: methodName as 'render' | 'rerender' | 'afterRender' | 'unrender',
    implementation,
  };
}

/**
 * Extracts DOM manipulation from call expression
 */
function extractDOMManipulation(path: NodePath<t.CallExpression>): DOMManipulationDefinition | null {
  if (!t.isMemberExpression(path.node.callee)) {
    return null;
  }

  const callee = path.node.callee;
  if (!t.isIdentifier(callee.property)) {
    return null;
  }

  const methodName = callee.property.name;
  let type: DOMManipulationDefinition['type'] | null = null;
  let element: string | undefined;
  let operation: string | undefined;

  // Detect DOM manipulation methods
  if (methodName === 'createElement' || methodName === 'appendChild' || methodName === 'insertBefore') {
    type = 'create';
    operation = methodName;
  } else if (methodName === 'setAttribute' || methodName === 'removeAttribute' || methodName === 'classList') {
    type = 'modify';
    operation = methodName;
  } else if (methodName === 'removeChild' || methodName === 'remove') {
    type = 'remove';
    operation = methodName;
  } else if (methodName === 'querySelector' || methodName === 'querySelectorAll' || methodName === 'getElementById') {
    type = 'query';
    operation = methodName;
  } else if (methodName === 'addEventListener' || methodName === 'removeEventListener') {
    type = 'eventListener';
    operation = methodName;
  }

  if (type) {
    // Try to extract element selector or description
    const args = path.node.arguments;
    if (args.length > 0 && t.isStringLiteral(args[0])) {
      element = args[0].value;
    }

    return {
      type,
      element,
      operation,
    };
  }

  return null;
}

