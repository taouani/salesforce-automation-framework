/**
 * Helper JavaScript parser for Aura components using Babel
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
  HelperDefinition,
  HelperFunctionDefinition,
  ApexCallDefinition,
  PromiseChainDefinition,
  ErrorHandlingDefinition,
  ParameterDefinition,
} from '../types/aura-parsed.js';

/**
 * Babel parser options for Aura Helper JavaScript files
 */
const parserOptions: Parameters<typeof parse>[1] = {
  sourceType: 'script', // Aura helpers use script mode
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
 * Parses a Helper JavaScript file and extracts helper functions
 */
export async function parseHelperJavaScriptFile(filePath: string): Promise<HelperDefinition> {
  try {
    logger.debug({ filePath }, 'Parsing Aura Helper JavaScript file');
    const code = await readFile(filePath, 'utf-8');
    const ast = parse(code, parserOptions);

    const result: HelperDefinition = {
      functions: [],
      apexCalls: [],
      promiseChains: [],
      errorHandling: [],
      utilityFunctions: [],
    };

    traverse(ast, {
      // Look for object expression (the helper object literal)
      ObjectExpression(path: NodePath<t.ObjectExpression>) {
        // Extract functions from object properties
        path.node.properties.forEach((prop) => {
          if (t.isObjectMethod(prop) || (t.isObjectProperty(prop) && t.isFunctionExpression(prop.value))) {
            const func = extractHelperFunction(prop, path);
            if (func) {
              result.functions.push(func);
            }
          }
        });
      },

      // Also look for standalone function declarations
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        const func = extractStandaloneFunction(path);
        if (func) {
          result.functions.push(func);
        }
      },
    });

    // Extract Apex calls, promise chains, and error handling from all functions
    result.functions.forEach((func) => {
      // Re-parse to extract details from function body
      if (func.logic) {
        try {
          const funcAst = parse(func.logic, parserOptions);
          traverse(funcAst, {
            CallExpression(path: NodePath<t.CallExpression>) {
              // Extract $A.enqueueAction() calls
              if (
                t.isMemberExpression(path.node.callee) &&
                t.isIdentifier(path.node.callee.object) &&
                path.node.callee.object.name === '$A' &&
                t.isMemberExpression(path.node.callee.property) &&
                t.isIdentifier(path.node.callee.property.object) &&
                path.node.callee.property.object.name === 'enqueueAction'
              ) {
                const apexCall = extractApexCall(path);
                if (apexCall) {
                  result.apexCalls.push(apexCall);
                }
              }

              // Extract promise chains (then, catch, finally)
              if (
                t.isMemberExpression(path.node.callee) &&
                t.isIdentifier(path.node.callee.property)
              ) {
                const methodName = path.node.callee.property.name;
                if (methodName === 'then' || methodName === 'catch' || methodName === 'finally') {
                  const promiseChain: PromiseChainDefinition = {
                    type: methodName as 'then' | 'catch' | 'finally',
                  };
                  result.promiseChains.push(promiseChain);
                }
              }
            },

            // Extract try/catch blocks
            TryStatement(path: NodePath<t.TryStatement>) {
              const errorHandling: ErrorHandlingDefinition = {
                type: 'tryCatch',
              };
              if (path.node.handler && t.isCatchClause(path.node.handler)) {
                if (t.isIdentifier(path.node.handler.param)) {
                  errorHandling.errorVariable = path.node.handler.param.name;
                }
              }
              if (!result.errorHandling) {
                result.errorHandling = [];
              }
              result.errorHandling.push(errorHandling);
            },
          });
        } catch (e) {
          // Ignore parsing errors for function logic extraction
        }
      }
    });

    logger.debug({ 
      filePath, 
      functions: result.functions.length, 
      apexCalls: result.apexCalls.length,
      promiseChains: result.promiseChains.length,
    }, 'Aura Helper JavaScript file parsed successfully');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn({ filePath, error: errorMessage }, 'Failed to parse Aura Helper JavaScript file');
    throw new AuraJavaScriptParseError(filePath, error instanceof Error ? error : undefined);
  }
}

/**
 * Extracts helper function definition from object property
 */
function extractHelperFunction(
  prop: t.ObjectMethod | t.ObjectProperty,
  parentPath: NodePath<t.ObjectExpression>
): HelperFunctionDefinition | null {
  let functionName: string;
  let functionNode: t.FunctionExpression | t.FunctionDeclaration;

  if (t.isObjectMethod(prop)) {
    if (!t.isIdentifier(prop.key)) {
      return null;
    }
    functionName = prop.key.name;
    // ObjectMethod is compatible for our purposes
    functionNode = prop as unknown as t.FunctionExpression;
  } else if (t.isObjectProperty(prop) && t.isFunctionExpression(prop.value)) {
    if (!t.isIdentifier(prop.key)) {
      return null;
    }
    functionName = prop.key.name;
    functionNode = prop.value;
  } else {
    return null;
  }

  // Extract parameters
  const parameters: ParameterDefinition[] = functionNode.params.map((param) => {
    if (t.isIdentifier(param)) {
      return {
        name: param.name,
      };
    }
    return { name: 'unknown' };
  });

  // Extract return type (if available from JSDoc or type annotations)
  let returnType: string | undefined;

  // Extract function body as logic string (simplified)
  let logic: string | undefined;
  if (functionNode.body && t.isBlockStatement(functionNode.body)) {
    // Get source code for function body
    try {
      const source = (parentPath as any).hub?.file?.code;
      if (source && functionNode.body.start !== null && functionNode.body.end !== null) {
        logic = source.substring(functionNode.body.start, functionNode.body.end);
      }
    } catch (e) {
      // Ignore if source not available
    }
  }

  return {
    name: functionName,
    parameters,
    returnType,
    logic,
  };
}

/**
 * Extracts standalone function declaration
 */
function extractStandaloneFunction(path: NodePath<t.FunctionDeclaration>): HelperFunctionDefinition | null {
  if (!t.isIdentifier(path.node.id)) {
    return null;
  }

  const functionName = path.node.id.name;
  const parameters: ParameterDefinition[] = path.node.params.map((param) => {
    if (t.isIdentifier(param)) {
      return {
        name: param.name,
      };
    }
    return { name: 'unknown' };
  });

  let logic: string | undefined;
  if (path.node.body && t.isBlockStatement(path.node.body)) {
    try {
      const source = (path as any).hub?.file?.code;
      if (source && path.node.body.start !== null && path.node.body.end !== null) {
        logic = source.substring(path.node.body.start, path.node.body.end);
      }
    } catch (e) {
      // Ignore if source not available
    }
  }

  return {
    name: functionName,
    parameters,
    logic,
  };
}

/**
 * Extracts Apex call definition from $A.enqueueAction() call
 */
function extractApexCall(path: NodePath<t.CallExpression>): ApexCallDefinition | null {
  const args = path.node.arguments;
  if (args.length === 0) {
    return null;
  }

  // $A.enqueueAction() typically takes an action object with className and methodName
  // Pattern: $A.enqueueAction(action)
  // where action = { className: 'MyApexClass', methodName: 'myMethod', params: {...} }
  
  let apexClassName = '';
  let methodName = '';
  const callbacks: string[] = [];

  // Try to extract from action object
  if (t.isObjectExpression(args[0])) {
    args[0].properties.forEach((prop) => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        if (prop.key.name === 'className' && t.isStringLiteral(prop.value)) {
          apexClassName = prop.value.value;
        } else if (prop.key.name === 'methodName' && t.isStringLiteral(prop.value)) {
          methodName = prop.value.value;
        }
      }
    });
  }

  // Look for callbacks (success, error) in the parent chain
  if (t.isCallExpression(path.parent)) {
    // Check if this is part of a promise chain
    const parentCall = path.parent;
    if (t.isMemberExpression(parentCall.callee)) {
      // This might be .then() or .catch()
      if (t.isIdentifier(parentCall.callee.property)) {
        callbacks.push(parentCall.callee.property.name);
      }
    }
  }

  if (apexClassName || methodName) {
    return {
      apexClassName: apexClassName || 'unknown',
      methodName: methodName || 'unknown',
      callbacks: callbacks.length > 0 ? callbacks : undefined,
    };
  }

  return null;
}

