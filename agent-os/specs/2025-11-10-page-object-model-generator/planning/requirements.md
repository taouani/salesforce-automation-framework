# Page Object Model Generator - Requirements Gathering

**Status**: In Progress  
**Date**: November 10, 2025

## Feature Description

Generate Page Object Model classes for Salesforce test automation using Playwright. The generator will create TypeScript classes that abstract Salesforce UI elements and provide methods for interacting with Salesforce pages, components, and objects.

## Clarifying Questions

Please provide answers to the following questions to help shape the specification:

### First Round Questions

**Q1:** The roadmap mentions generating page objects for:
- Salesforce objects (standard and custom)
- Lightning pages and record pages
- Custom LWC components
- Aura components

Should we generate all of these types together, or prioritize certain types first? Also, should we generate separate page objects for different Salesforce UI contexts (Classic vs Lightning, App Builder pages vs Record pages, etc.)?

**Q2:** For Salesforce object page objects, I assume we should generate:
- Field locators for all object fields (standard and custom)
- Methods for common operations (create, read, update, delete)
- Methods for navigating to related lists
- Methods for interacting with record detail pages
- Methods for list views

Should we also generate methods for:
- Bulk operations (mass actions, list view operations)
- Related record operations (creating related records, navigating relationships)
- Record type selection
- Any other object-specific interactions?

**Q3:** For Lightning page objects, I assume we should:
- Generate locators for Lightning components on the page
- Generate methods for interacting with Lightning components (buttons, inputs, data tables, etc.)
- Handle dynamic component loading
- Support App Builder custom pages

Should we also:
- Generate page objects for specific Lightning page templates (Record Page, Home Page, App Page)?
- Handle flexipages and their component layouts?
- Support Lightning Experience vs Salesforce Mobile?

**Q4:** For LWC component page objects, I assume we should:
- Generate locators based on parsed LWC component structure (HTML templates, properties)
- Generate methods for setting component properties
- Generate methods for triggering component events
- Handle component nesting and parent-child relationships

Should we also:
- Generate page objects for standard Lightning components (lightning-button, lightning-input, etc.)?
- Handle component variants and design attributes?
- Support component testing in isolation vs in-page context?

**Q5:** For Aura component page objects, I assume we should:
- Generate locators based on parsed Aura component structure (.cmp markup, attributes)
- Generate methods for setting component attributes
- Generate methods for triggering component events
- Handle Aura component nesting

Should we also:
- Generate page objects for standard Aura components?
- Handle Aura application page objects?
- Support Aura component testing in different contexts?

**Q6:** For element locator generation strategies, I assume we should support:
- Data attributes (data-testid, data-id, etc.)
- ARIA attributes (aria-label, aria-labelledby, etc.)
- CSS selectors (class names, IDs)
- XPath (as fallback)
- Text-based locators (getByText, getByRole)

What should be the priority/fallback order? Should we generate multiple locator strategies for resilience, or prefer a single best-practice approach?

**Q7:** For page object structure and organization, I assume we should:
- Generate page objects in the `pages/` directory (as per the roadmap)
- Organize by object/component type
- Support inheritance (base page object classes)
- Support composition (page objects using other page objects)

Should we also:
- Generate base classes for common Salesforce UI patterns?
- Create page object hierarchies (e.g., BaseObjectPage → AccountPage)?
- Generate page object interfaces/types for type safety?
- Support page object factories or builders?

**Q8:** For page object methods, I assume we should generate:
- Navigation methods (goto, waitForLoad)
- Field interaction methods (fill, get, set)
- Button/action methods (click, submit)
- Validation methods (isVisible, isEnabled, getValue)
- Wait methods (waitForElement, waitForLoad)

Should we also generate:
- Assertion methods (shouldBeVisible, shouldHaveValue)?
- Helper methods for common Salesforce patterns (save, cancel, search)?
- Methods for handling Salesforce-specific UI elements (modals, toasts, spinners)?
- Error handling methods?

**Q9:** For integration with parsed metadata, I assume we should:
- Use parsed object definitions to generate field locators
- Use parsed LWC/Aura component definitions to generate component page objects
- Use parsed Flow definitions to generate page objects for Flow screens
- Use parsed validation rules to generate validation methods

Should we also:
- Cross-reference with profiles/permission sets to generate conditional methods (based on field-level security)?
- Use parsed Apex classes to understand custom actions/buttons?
- Use parsed record types to generate record type-specific methods?
- Use parsed relationships to generate related record navigation methods?

**Q10:** For code generation approach, I assume we should:
- Use template engine (handlebars as per tech stack)
- Generate TypeScript classes with proper typing
- Format generated code with Prettier
- Include JSDoc comments for generated methods

Should we also:
- Generate unit tests for page objects?
- Generate page object documentation?
- Support custom templates or template customization?
- Generate page object configuration files?

**Q11:** For Salesforce UI patterns and best practices, I assume we should handle:
- Lightning Design System (SLDS) component patterns
- Salesforce loading states and spinners
- Salesforce error messages and toasts
- Salesforce modals and dialogs
- Salesforce navigation (tabs, apps, objects)

Should we also handle:
- Salesforce Classic UI patterns (for orgs still using Classic)?
- Salesforce Mobile patterns?
- Salesforce App Builder dynamic layouts?
- Salesforce Flow screen patterns?

**Q12:** Are there any existing page object patterns, libraries, or frameworks for Salesforce Playwright testing that we should align with or reference? Or should we establish our own patterns based on Playwright best practices?
**Answer:** No existing patterns to align with - establish our own patterns based on Playwright best practices

---

## Requirements Summary

### Q1: Page Object Types and Contexts
**Answer:** Generate all types together (Salesforce objects, Lightning pages, custom LWC components, Aura components). Keep in mind dependencies between these types. Generate separate page objects only for Lightning and Record pages.

### Q2: Salesforce Object Page Object Methods
**Answer:** Generate methods for bulk operations, related record operations, record type selection, and other object-specific interactions when possible.

### Q3: Lightning Page Objects
**Answer:** Yes - generate page objects for specific Lightning page templates (Record Page, Home Page, App Page), handle flexipages and their component layouts. Deprioritize Salesforce Mobile support.

### Q4: LWC Component Page Objects
**Answer:** Yes - generate page objects for standard Lightning components, handle component variants and design attributes, support component testing in isolation vs in-page context.

### Q5: Aura Component Page Objects
**Answer:** Yes - generate page objects for standard Aura components, handle Aura application page objects, support Aura component testing in different contexts.

### Q6: Element Locator Generation Strategy
**Answer:** Use a single best-practice approach (not multiple fallback strategies).

### Q7: Page Object Structure and Organization
**Answer:** Yes - generate base classes for common Salesforce UI patterns, create page object hierarchies, generate page object interfaces/types for type safety, support page object factories or builders.

### Q8: Page Object Methods
**Answer:** Yes - generate assertion methods, helper methods for common Salesforce patterns, methods for handling Salesforce-specific UI elements (modals, toasts, spinners), error handling methods.

### Q9: Integration with Parsed Metadata
**Answer:** Yes - cross-reference with profiles/permission sets to generate conditional methods, use parsed Apex classes to understand custom actions/buttons, use parsed record types to generate record type-specific methods, use parsed relationships to generate related record navigation methods.

### Q10: Code Generation Approach
**Answer:** Yes - generate unit tests for page objects, generate page object documentation, support custom templates or template customization, generate page object configuration files.

### Q11: Salesforce UI Patterns
**Answer:** Handle only Salesforce App Builder dynamic layouts and Salesforce Flow screen patterns (not Classic UI or Mobile patterns).

### Q12: Existing Patterns/Libraries
**Answer:** No existing patterns to align with - establish our own patterns based on Playwright best practices.

### Visual Assets
**Answer:** No visual references, diagrams, or examples provided.

