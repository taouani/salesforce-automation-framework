/**
 * Locator generation for Page Object Model
 * Implements single best-practice locator strategy
 */

import type {
  LocatorDefinition,
  FieldLocatorDefinition,
  ComponentLocatorDefinition,
} from '../types/page-object.js';
import { LocatorStrategy } from '../types/page-object.js';
import { LocatorGenerationError } from '../utils/page-object-errors.js';

/**
 * Generates a locator for a Salesforce field
 * Uses getByLabel() as the primary strategy for fields
 */
export function generateFieldLocator(
  fieldName: string,
  fieldLabel: string,
  fieldType: string,
  options?: {
    isRequired?: boolean;
    isReadOnly?: boolean;
  }
): FieldLocatorDefinition {
  try {
    // Use getByLabel() as primary strategy for Salesforce fields
    const camelCaseName = fieldName.charAt(0).toLowerCase() + fieldName.slice(1) + 'Field';

    return {
      name: camelCaseName,
      strategy: LocatorStrategy.GET_BY_LABEL,
      selector: fieldLabel,
      fieldName,
      fieldLabel,
      fieldType,
      isRequired: options?.isRequired,
      isReadOnly: options?.isReadOnly,
    };
  } catch (error) {
    throw new LocatorGenerationError(
      `Failed to generate locator for field: ${fieldName}`,
      fieldName,
      LocatorStrategy.GET_BY_LABEL,
      undefined,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Generates a locator for a Salesforce button
 * Uses getByRole('button') as the primary strategy
 */
export function generateButtonLocator(
  buttonLabel: string,
  buttonName?: string
): LocatorDefinition {
  try {
    const locatorName = buttonName || buttonLabel.replace(/\s+/g, '').charAt(0).toLowerCase() + buttonLabel.replace(/\s+/g, '').slice(1);

    return {
      name: locatorName,
      strategy: LocatorStrategy.GET_BY_ROLE,
      selector: `button[name="${buttonLabel}"]`,
      description: `Button: ${buttonLabel}`,
    };
  } catch (error) {
    throw new LocatorGenerationError(
      `Failed to generate locator for button: ${buttonLabel}`,
      buttonLabel,
      LocatorStrategy.GET_BY_ROLE,
      undefined,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Generates a locator for a Lightning component
 * Uses component-specific locator strategies
 */
export function generateLightningComponentLocator(
  componentName: string,
  componentType: 'LWC' | 'Aura' | 'Standard',
  options?: {
    attributes?: Record<string, string>;
    dataTestId?: string;
  }
): ComponentLocatorDefinition {
  try {
    const locatorName = componentName.charAt(0).toLowerCase() + componentName.slice(1);

    // Prefer data-testid if available
    if (options?.dataTestId) {
      return {
        name: locatorName,
        strategy: LocatorStrategy.GET_BY_TEST_ID,
        selector: options.dataTestId,
        componentName,
        componentType,
        attributes: options.attributes,
      };
    }

    // For standard Lightning components, use CSS selector with component name
    if (componentType === 'Standard') {
      return {
        name: locatorName,
        strategy: LocatorStrategy.CSS,
        selector: `lightning-${componentName.toLowerCase()}`,
        componentName,
        componentType,
        attributes: options?.attributes,
      };
    }

    // For custom LWC components, use CSS selector with kebab-case
    if (componentType === 'LWC') {
      const kebabCase = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
      return {
        name: locatorName,
        strategy: LocatorStrategy.CSS,
        selector: `c-${kebabCase}`,
        componentName,
        componentType,
        attributes: options?.attributes,
      };
    }

    // For Aura components, use CSS selector
    const kebabCase = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    return {
      name: locatorName,
      strategy: LocatorStrategy.CSS,
      selector: `.c${kebabCase}`,
      componentName,
      componentType,
      attributes: options?.attributes,
    };
  } catch (error) {
    throw new LocatorGenerationError(
      `Failed to generate locator for component: ${componentName}`,
      componentName,
      LocatorStrategy.CSS,
      undefined,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Generates a locator using text-based strategy
 * Uses getByText() for text-based identification
 */
export function generateTextLocator(
  text: string,
  locatorName?: string
): LocatorDefinition {
  try {
    const name = locatorName || text.replace(/\s+/g, '').charAt(0).toLowerCase() + text.replace(/\s+/g, '').slice(1);

    return {
      name,
      strategy: LocatorStrategy.GET_BY_TEXT,
      selector: text,
      description: `Text: ${text}`,
    };
  } catch (error) {
    throw new LocatorGenerationError(
      `Failed to generate text locator: ${text}`,
      text,
      LocatorStrategy.GET_BY_TEXT,
      undefined,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Generates a locator using CSS selector strategy
 * Uses CSS selector as fallback
 */
export function generateCSSLocator(
  selector: string,
  locatorName: string,
  description?: string
): LocatorDefinition {
  try {
    return {
      name: locatorName,
      strategy: LocatorStrategy.CSS,
      selector,
      description: description || `CSS selector: ${selector}`,
    };
  } catch (error) {
    throw new LocatorGenerationError(
      `Failed to generate CSS locator: ${selector}`,
      locatorName,
      LocatorStrategy.CSS,
      undefined,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Generates locator name from field/component name
 * Converts to camelCase for TypeScript property names
 */
export function generateLocatorName(input: string): string {
  // Remove special characters and convert to camelCase
  const cleaned = input.replace(/[^a-zA-Z0-9]/g, ' ');
  const words = cleaned.split(/\s+/).filter(Boolean);
  
  if (words.length === 0) {
    return 'locator';
  }

  const firstWord = words[0].charAt(0).toLowerCase() + words[0].slice(1).toLowerCase();
  const restWords = words.slice(1).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  return firstWord + restWords.join('');
}

