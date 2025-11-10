/**
 * Controller JavaScript parser for Aura components using Babel
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
  ControllerDefinition,
  ActionMethodDefinition,
  EventParameterDefinition,
  AttributeAccessDefinition,
  EventFiringDefinition,
  ParameterDefinition,
  ApexCallDefinition,
} from '../types/aura-parsed.js';

/**
 * Babel parser options for Aura Controller JavaScript files
 */
const parserOptions: Parameters<typeof parse>[1] = {
  sourceType: 'script', // Aura controllers use script mode, not module
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
 * Parses a Controller JavaScript file and extracts action methods
 */
export async function parseControllerJavaScriptFile(filePath: string): Promise<ControllerDefinition> {
  try {
    logger.debug({ filePath }, 'Parsing Aura Controller JavaScript file');
    const code = await readFile(filePath, 'utf-8');
    const ast = parse(code, parserOptions);

    const result: ControllerDefinition = {
      actionMethods: [],
    };

    traverse(ast, {
      // Look for object expression (the controller object literal)
      ObjectExpression(path: NodePath<t.ObjectExpression>) {
        // Extract methods from object properties
        path.node.properties.forEach((prop) => {
          if (t.isObjectMethod(prop) || (t.isObjectProperty(prop) && t.isFunctionExpression(prop.value))) {
            const method = extractActionMethod(prop, path);
            if (method) {
              result.actionMethods.push(method);
            }
          }
        });
      },
    });

    logger.debug({ filePath, actionMethods: result.actionMethods.length }, 'Aura Controller JavaScript file parsed successfully');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn({ filePath, error: errorMessage }, 'Failed to parse Aura Controller JavaScript file');
    throw new AuraJavaScriptParseError(filePath, error instanceof Error ? error : undefined);
  }
}

/**
 * Extracts action method definition from object property
 */
function extractActionMethod(
  prop: t.ObjectMethod | t.ObjectProperty,
  parentPath: NodePath<t.ObjectExpression>
): ActionMethodDefinition | null {
  let methodName: string;
  let functionNode: t.FunctionExpression | t.FunctionDeclaration;

  if (t.isObjectMethod(prop)) {
    if (!t.isIdentifier(prop.key)) {
      return null;
    }
    methodName = prop.key.name;
    functionNode = (prop as unknown as t.FunctionExpression);
  } else if (t.isObjectProperty(prop) && t.isFunctionExpression(prop.value)) {
    if (!t.isIdentifier(prop.key)) {
      return null;
    }
    methodName = prop.key.name;
    functionNode = prop.value;
  } else {
    return null;
  }

  // Extract parameters (component, event, helper)
  const parameters: ParameterDefinition[] = functionNode.params.map((param) => {
    if (t.isIdentifier(param)) {
      return {
        name: param.name,
      };
    }
    return { name: 'unknown' };
  });

  // Extract event parameters, attribute access, helper calls, event firing from function body
  const eventParameters: EventParameterDefinition[] = [];
  const attributeAccess: AttributeAccessDefinition[] = [];
  const helperCalls: string[] = [];
  const eventFiring: EventFiringDefinition[] = [];
  const apexCalls: ApexCallDefinition[] = [];

  // Traverse function body to extract details
  if (functionNode.body && t.isBlockStatement(functionNode.body)) {
    traverse(functionNode.body, {
      // Extract event.getParam() calls
      CallExpression(path: NodePath<t.CallExpression>) {
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object) &&
          path.node.callee.object.name === 'event' &&
          t.isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'getParam'
        ) {
          const args = path.node.arguments;
          if (args.length > 0 && t.isStringLiteral(args[0])) {
            const paramName = args[0].value;
            eventParameters.push({
              parameterName: paramName,
              extractionMethod: `event.getParam('${paramName}')`,
            });
          }
        }

        // Extract component.get() calls
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object) &&
          path.node.callee.object.name === 'component' &&
          t.isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'get'
        ) {
          const args = path.node.arguments;
          if (args.length > 0 && t.isStringLiteral(args[0])) {
            const attrPath = args[0].value;
            attributeAccess.push({
              attributePath: attrPath,
              accessMethod: 'get',
            });
          }
        }

        // Extract component.set() calls
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object) &&
          path.node.callee.object.name === 'component' &&
          t.isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'set'
        ) {
          const args = path.node.arguments;
          if (args.length >= 2 && t.isStringLiteral(args[0])) {
            const attrPath = args[0].value;
            attributeAccess.push({
              attributePath: attrPath,
              accessMethod: 'set',
            });
          }
        }

        // Extract helper.methodName() calls
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object) &&
          path.node.callee.object.name === 'helper' &&
          t.isIdentifier(path.node.callee.property)
        ) {
          const helperMethodName = path.node.callee.property.name;
          if (!helperCalls.includes(helperMethodName)) {
            helperCalls.push(helperMethodName);
          }
        }

        // Extract component.getEvent() calls
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object) &&
          path.node.callee.object.name === 'component' &&
          t.isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'getEvent'
        ) {
          const args = path.node.arguments;
          if (args.length > 0 && t.isStringLiteral(args[0])) {
            eventFiring.push({
              eventName: args[0].value,
            });
          }
        }

        // Extract event.fire() calls
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object) &&
          path.node.callee.object.name === 'event' &&
          t.isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'fire'
        ) {
          // Event is fired, but we need to track which event (would need to look at previous getEvent call)
          eventFiring.push({
            eventName: 'unknown', // Would need more sophisticated tracking
          });
        }
      },
    }, parentPath.scope);
  }

  return {
    name: methodName,
    parameters,
    eventParameters: eventParameters.length > 0 ? eventParameters : undefined,
    attributeAccess: attributeAccess.length > 0 ? attributeAccess : undefined,
    helperCalls: helperCalls.length > 0 ? helperCalls : undefined,
    eventFiring: eventFiring.length > 0 ? eventFiring : undefined,
    apexCalls: apexCalls.length > 0 ? apexCalls : undefined,
  };
}

