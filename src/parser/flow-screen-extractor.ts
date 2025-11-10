/**
 * Flow screen extraction for Playwright test generation
 */

import type {
  FlowScreenDefinition,
  FlowScreenFieldDefinition,
  FlowScreenNavigationDefinition,
} from '../types/flow-parsed.js';
import type { RawFlowElement } from './flow-element-extractor.js';

/**
 * Normalizes array or single item to array
 */
function normalizeArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/**
 * Extracts screen fields from screen element
 */
function extractScreenFields(screenElement: RawFlowElement): FlowScreenFieldDefinition[] {
  const fields: FlowScreenFieldDefinition[] = [];

  if (screenElement.fields) {
    const rawFields = normalizeArray(screenElement.fields as any);
    rawFields.forEach((field: any) => {
      fields.push({
        name: field.name || field.apiName || '',
        label: field.label,
        type: field.type || field.dataType || 'text',
        required: field.required === true || field.required === 'true',
        defaultValue: field.defaultValue,
        validationRules: field.validationRules ? normalizeArray(field.validationRules) : undefined,
        helpText: field.helpText || field.description,
      });
    });
  }

  return fields;
}

/**
 * Extracts screen navigation from screen element
 */
function extractScreenNavigation(screenElement: RawFlowElement): FlowScreenNavigationDefinition | undefined {
  if (!screenElement.navigation) {
    return undefined;
  }

  const navigation = screenElement.navigation as any;
  return {
    nextButton: {
      label: navigation.nextButton?.label,
      targetElement: navigation.nextButton?.targetReference,
      conditions: navigation.nextButton?.conditions,
    },
    previousButton: {
      label: navigation.previousButton?.label,
      targetElement: navigation.previousButton?.targetReference,
    },
    navigationConditions: navigation.conditions,
  };
}

/**
 * Extracts screens from Flow elements
 */
export function extractFlowScreens(elements: RawFlowElement[]): FlowScreenDefinition[] {
  const screens: FlowScreenDefinition[] = [];

  elements.forEach((element) => {
    if (element.type === 'Screen' || element.fields) {
      const fields = extractScreenFields(element);
      const navigation = extractScreenNavigation(element);

      screens.push({
        screenElement: element.name || '',
        fields,
        navigation,
        validation: {
          validationRules: element.validationRules ? (normalizeArray(element.validationRules) as string[]) : undefined,
        },
      });
    }
  });

  return screens;
}

