# Specification: Page Object Model Generator

## Goal
Create a code generator that automatically produces Page Object Model classes for Salesforce test automation using Playwright. The generator will create TypeScript classes that abstract Salesforce UI elements, provide methods for interacting with Salesforce pages, components, and objects, and follow Playwright best practices for maintainable test automation.

## User Stories
- As a test automation engineer, I want page objects automatically generated from Salesforce metadata so that I can write tests without manually creating locators and interaction methods
- As a QA lead, I want consistent page object patterns across all generated code so that test suites are maintainable and follow best practices
- As a test automation engineer, I want page objects that handle Salesforce-specific UI patterns (modals, toasts, spinners) so that my tests are resilient to Salesforce UI changes
- As a test automation engineer, I want page objects that understand Salesforce object relationships so that I can easily navigate and interact with related records
- As a test automation engineer, I want page objects for Lightning pages, LWC components, and Aura components so that I can test custom Salesforce UI implementations

## Specific Requirements

### Page Object Types and Generation Strategy

**Generate All Types Together**
- Generate page objects for all types simultaneously: Salesforce objects, Lightning pages, custom LWC components, and Aura components
- Handle dependencies between page object types (e.g., a Lightning page that uses LWC components)
- Generate separate page objects only for Lightning pages and Record pages (not for other UI contexts)
- Support dependencies between Salesforce objects, Lightning pages, custom LWC components, and Aura components

**Page Object Type Coverage**
- Salesforce Objects (standard and custom): Generate page objects for all parsed Salesforce objects
- Lightning Pages: Generate page objects for Lightning Experience pages, Record pages, Home pages, and App pages
- Custom LWC Components: Generate page objects for all parsed Lightning Web Components
- Aura Components: Generate page objects for all parsed Aura components and applications

### Salesforce Object Page Objects

**Field Locators**
- Generate locators for all object fields (standard and custom fields)
- Generate locators based on field API names and labels
- Support field-level security considerations (conditional locators based on profiles/permission sets)
- Generate locators for related list fields
- Generate locators for lookup and master-detail relationship fields

**Common Operations**
- Generate methods for CRUD operations:
  - `create(recordData)` - Create new records
  - `read(recordId)` - Read record details
  - `update(recordId, updates)` - Update existing records
  - `delete(recordId)` - Delete records
- Generate methods for navigating to record detail pages
- Generate methods for interacting with list views
- Generate methods for navigating to related lists

**Advanced Operations**
- Generate methods for bulk operations (when possible):
  - Mass actions on list views
  - Bulk record creation/update/deletion
- Generate methods for related record operations:
  - Creating related records
  - Navigating relationships (lookup, master-detail)
  - Accessing related list records
- Generate methods for record type selection:
  - Selecting record types during record creation
  - Switching record types for existing records
- Generate methods for other object-specific interactions:
  - Custom buttons and actions (from parsed Apex classes)
  - Quick actions
  - Record sharing

### Lightning Page Objects

**Page Template Support**
- Generate page objects for specific Lightning page templates:
  - Record Page page objects
  - Home Page page objects
  - App Page page objects
- Handle flexipages and their component layouts:
  - Parse flexipage metadata to understand component placement
  - Generate locators for components based on flexipage layout
  - Support dynamic component loading

**Component Interaction**
- Generate locators for Lightning components on the page
- Generate methods for interacting with Lightning components:
  - Buttons (lightning-button)
  - Inputs (lightning-input, lightning-input-field)
  - Data tables (lightning-datatable)
  - Forms (lightning-record-form, lightning-record-edit-form)
  - Other standard Lightning components
- Handle dynamic component loading:
  - Wait methods for component initialization
  - Methods for detecting component state changes

**App Builder Support**
- Support App Builder custom pages:
  - Parse flexipage metadata for custom pages
  - Generate page objects that reflect custom page layouts
  - Handle dynamic layouts and component positioning

**Deprioritized**
- Salesforce Mobile patterns (not in initial scope)

### LWC Component Page Objects

**Component Structure**
- Generate locators based on parsed LWC component structure:
  - HTML template elements and attributes
  - Component properties and public methods
  - Component events and event handlers
- Generate methods for setting component properties
- Generate methods for triggering component events
- Handle component nesting and parent-child relationships:
  - Generate page objects for parent components that include child components
  - Support component composition patterns

**Standard Lightning Components**
- Generate page objects for standard Lightning components:
  - lightning-button, lightning-input, lightning-input-field
  - lightning-datatable, lightning-card, lightning-formatted-*
  - Other commonly used standard components
- Generate reusable component page objects that can be used across different contexts

**Component Variants and Design Attributes**
- Handle component variants (if parsed from component metadata)
- Handle design attributes (if parsed from component metadata)
- Generate methods that account for component configuration variations

**Testing Contexts**
- Support component testing in isolation:
  - Generate page objects for standalone component testing
- Support component testing in-page context:
  - Generate page objects that account for component usage within Lightning pages

### Aura Component Page Objects

**Component Structure**
- Generate locators based on parsed Aura component structure:
  - .cmp markup elements and attributes
  - Component attributes (aura:attribute)
  - Component handlers (aura:handler)
- Generate methods for setting component attributes
- Generate methods for triggering component events
- Handle Aura component nesting:
  - Generate page objects for parent components that include child Aura components
  - Support Aura component composition patterns

**Standard Aura Components**
- Generate page objects for standard Aura components (when encountered)
- Generate reusable component page objects

**Aura Applications**
- Handle Aura application page objects:
  - Generate page objects for Aura applications (.app files)
  - Support application-level interactions

**Testing Contexts**
- Support Aura component testing in different contexts:
  - Standalone component testing
  - Component usage within Lightning pages
  - Component usage within Visualforce pages

### Element Locator Generation Strategy

**Single Best-Practice Approach**
- Use a single, best-practice locator strategy (not multiple fallback strategies)
- Prioritize Playwright's recommended locator strategies:
  1. **Primary Strategy**: Use Playwright's `getByRole()` and `getByLabel()` for accessible elements
  2. **Secondary Strategy**: Use `getByTestId()` for elements with data-testid attributes
  3. **Tertiary Strategy**: Use `getByText()` for text-based identification
  4. **Fallback Strategy**: Use CSS selectors with semantic class names or IDs

**Locator Generation Rules**
- For Salesforce fields: Prefer `getByLabel()` using field labels
- For Salesforce buttons: Prefer `getByRole('button')` with accessible names
- For Lightning components: Use component-specific locator strategies
- For custom components: Use data-testid attributes when available, otherwise use semantic selectors
- Avoid XPath unless absolutely necessary
- Generate locators that are resilient to Salesforce UI changes

**Locator Naming and Organization**
- Generate descriptive locator property names (e.g., `accountNameField`, `saveButton`)
- Organize locators logically within page object classes
- Use TypeScript readonly properties for locators

### Page Object Structure and Organization

**Directory Structure**
- Generate page objects in the `pages/` directory (as per roadmap)
- Organize by object/component type:
  - `pages/objects/` - Salesforce object page objects
  - `pages/lightning/` - Lightning page objects
  - `pages/lwc/` - LWC component page objects
  - `pages/aura/` - Aura component page objects
  - `pages/flows/` - Flow screen page objects
  - `pages/base/` - Base page object classes

**Inheritance and Base Classes**
- Generate base classes for common Salesforce UI patterns:
  - `BaseObjectPage` - Base class for Salesforce object page objects
  - `BaseLightningPage` - Base class for Lightning page objects
  - `BaseComponentPage` - Base class for component page objects
  - `BaseFlowScreen` - Base class for Flow screen page objects
- Create page object hierarchies:
  - `BaseObjectPage` → `AccountPage`, `ContactPage`, etc.
  - `BaseLightningPage` → `RecordPage`, `HomePage`, `AppPage`
  - `BaseComponentPage` → `LWCComponentPage`, `AuraComponentPage`

**Composition**
- Support composition (page objects using other page objects):
  - Lightning pages that use LWC component page objects
  - Record pages that use related object page objects
  - Components that use other component page objects

**Type Safety**
- Generate page object interfaces/types for type safety:
  - Interface definitions for page object contracts
  - Type definitions for method parameters and return values
  - Generic types for reusable page object patterns

**Factories and Builders**
- Support page object factories or builders:
  - Factory methods for creating page object instances
  - Builder patterns for complex page object initialization
  - Page object registry for managing page object instances

### Page Object Methods

**Navigation Methods**
- `goto(url)` - Navigate to a specific URL
- `gotoRecord(recordId)` - Navigate to a record detail page
- `gotoList()` - Navigate to object list view
- `waitForLoad()` - Wait for page/component to load
- `waitForNavigation()` - Wait for navigation to complete

**Field Interaction Methods**
- `fill(fieldName, value)` - Fill a field with a value
- `get(fieldName)` - Get field value
- `set(fieldName, value)` - Set field value
- `clear(fieldName)` - Clear field value
- `isFieldVisible(fieldName)` - Check if field is visible
- `isFieldEnabled(fieldName)` - Check if field is enabled
- `isFieldRequired(fieldName)` - Check if field is required

**Button/Action Methods**
- `click(buttonName)` - Click a button
- `clickButton(buttonName)` - Click a specific button
- `submit()` - Submit a form
- `cancel()` - Cancel an action
- `save()` - Save a record
- `delete()` - Delete a record

**Validation Methods**
- `isVisible(selector)` - Check if element is visible
- `isEnabled(selector)` - Check if element is enabled
- `getValue(selector)` - Get element value
- `getText(selector)` - Get element text
- `hasClass(selector, className)` - Check if element has class

**Wait Methods**
- `waitForElement(selector)` - Wait for element to appear
- `waitForLoad()` - Wait for page/component load
- `waitForNavigation()` - Wait for navigation
- `waitForSpinner()` - Wait for Salesforce spinner to disappear
- `waitForToast()` - Wait for toast message

**Assertion Methods**
- `shouldBeVisible(selector)` - Assert element is visible
- `shouldHaveValue(selector, value)` - Assert element has value
- `shouldHaveText(selector, text)` - Assert element has text
- `shouldBeEnabled(selector)` - Assert element is enabled
- `shouldBeDisabled(selector)` - Assert element is disabled

**Helper Methods for Salesforce Patterns**
- `save()` - Save record (handles save button, validation, success/error)
- `cancel()` - Cancel action (handles cancel button, confirmation dialogs)
- `search(query)` - Search functionality
- `selectRecordType(recordTypeName)` - Select record type
- `navigateToRelatedList(relatedListName)` - Navigate to related list
- `createRelatedRecord(relatedObjectName, data)` - Create related record

**Salesforce-Specific UI Elements**
- Methods for handling Salesforce modals:
  - `waitForModal()`, `closeModal()`, `confirmModal()`
- Methods for handling Salesforce toasts:
  - `waitForToast()`, `getToastMessage()`, `dismissToast()`
- Methods for handling Salesforce spinners:
  - `waitForSpinner()`, `isSpinnerVisible()`
- Methods for handling Salesforce navigation:
  - `navigateToTab(tabName)`, `navigateToApp(appName)`

**Error Handling Methods**
- `handleError(error)` - Handle errors gracefully
- `retry(action, maxRetries)` - Retry actions with error handling
- `waitForError()` - Wait for error messages
- `getErrorMessage()` - Get error message text

### Integration with Parsed Metadata

**Object Definitions**
- Use parsed object definitions to generate field locators:
  - Field API names and labels
  - Field types and properties
  - Required vs optional fields
  - Field-level security information
- Use parsed object relationships to generate related record navigation methods:
  - Lookup relationships
  - Master-detail relationships
  - Related list navigation

**LWC/Aura Component Definitions**
- Use parsed LWC component definitions to generate component page objects:
  - Component properties and methods
  - Component events
  - Component HTML structure
- Use parsed Aura component definitions to generate Aura component page objects:
  - Component attributes
  - Component handlers
  - Component markup structure

**Flow Definitions**
- Use parsed Flow definitions to generate page objects for Flow screens:
  - Flow screen elements (inputs, outputs, buttons)
  - Flow navigation methods
  - Flow decision paths

**Validation Rules**
- Use parsed validation rules to generate validation methods:
  - Field validation methods
  - Record validation methods
  - Error message handling

**Profiles and Permission Sets**
- Cross-reference with profiles/permission sets to generate conditional methods:
  - Field-level security checks
  - Object-level permission checks
  - Conditional method generation based on user permissions

**Apex Classes**
- Use parsed Apex classes to understand custom actions/buttons:
  - Custom button page object methods
  - Apex action methods
  - Custom business logic interactions

**Record Types**
- Use parsed record types to generate record type-specific methods:
  - Record type selection methods
  - Record type-specific field visibility
  - Record type-specific page layouts

**Relationships**
- Use parsed relationships to generate related record navigation methods:
  - Related list navigation
  - Related record creation
  - Relationship field interactions

### Code Generation Approach

**Template Engine**
- Use Handlebars template engine (as per tech stack)
- Create reusable templates for different page object types
- Support template customization and extension

**TypeScript Generation**
- Generate TypeScript classes with proper typing:
  - Strong typing for all methods and properties
  - Interface definitions for type safety
  - Generic types where appropriate
- Format generated code with Prettier
- Include JSDoc comments for all generated methods:
  - Method descriptions
  - Parameter documentation
  - Return value documentation
  - Usage examples where helpful

**Additional Artifacts**
- Generate unit tests for page objects:
  - Basic functionality tests
  - Locator validation tests
  - Method interaction tests
- Generate page object documentation:
  - README files for page object directories
  - API documentation for generated methods
  - Usage examples and patterns
- Support custom templates or template customization:
  - Allow users to provide custom templates
  - Support template variables and configuration
- Generate page object configuration files:
  - Configuration for page object factories
  - Configuration for locator strategies
  - Configuration for method generation preferences

### Salesforce UI Patterns

**Lightning Design System (SLDS)**
- Handle SLDS component patterns:
  - SLDS class names and structures
  - SLDS component locators
  - SLDS responsive patterns

**Salesforce Loading States**
- Handle Salesforce loading states and spinners:
  - Wait methods for spinners
  - Loading state detection
  - Progress indicator handling

**Salesforce Error Messages**
- Handle Salesforce error messages and toasts:
  - Error message detection
  - Toast message handling
  - Validation error handling

**Salesforce Modals and Dialogs**
- Handle Salesforce modals and dialogs:
  - Modal detection and interaction
  - Confirmation dialog handling
  - Modal close/cancel methods

**Salesforce Navigation**
- Handle Salesforce navigation (tabs, apps, objects):
  - Tab navigation methods
  - App navigation methods
  - Object navigation methods

**App Builder Dynamic Layouts**
- Handle Salesforce App Builder dynamic layouts:
  - Parse flexipage metadata for layout information
  - Generate locators based on dynamic component placement
  - Support responsive layout changes

**Flow Screen Patterns**
- Handle Salesforce Flow screen patterns:
  - Flow screen element locators
  - Flow navigation methods
  - Flow input/output handling

**Deprioritized**
- Salesforce Classic UI patterns (not in initial scope)
- Salesforce Mobile patterns (not in initial scope)

### Technical Implementation

**Input Data Sources**
- Read parsed metadata from previous parsing phases:
  - XML metadata parser results (objects, fields, validation rules)
  - LWC parser results (component definitions)
  - Aura parser results (component definitions)
  - Flow parser results (flow definitions)
  - Apex parser results (class definitions, custom actions)
  - Profile/permission set parser results (field-level security)

**Code Generation Process**
1. Load parsed metadata results
2. Analyze dependencies between page object types
3. Generate base page object classes
4. Generate specific page object classes for each type
5. Generate page object interfaces/types
6. Generate page object factories/builders
7. Generate unit tests for page objects
8. Generate documentation
9. Format generated code with Prettier
10. Validate generated code (TypeScript compilation)

**Output Structure**
```
generated-test-project/
├── pages/
│   ├── base/
│   │   ├── BaseObjectPage.ts
│   │   ├── BaseLightningPage.ts
│   │   ├── BaseComponentPage.ts
│   │   └── BaseFlowScreen.ts
│   ├── objects/
│   │   ├── AccountPage.ts
│   │   ├── ContactPage.ts
│   │   └── ...
│   ├── lightning/
│   │   ├── RecordPage.ts
│   │   ├── HomePage.ts
│   │   └── AppPage.ts
│   ├── lwc/
│   │   ├── CustomComponentPage.ts
│   │   └── ...
│   ├── aura/
│   │   ├── AuraComponentPage.ts
│   │   └── ...
│   └── flows/
│       ├── FlowScreenPage.ts
│       └── ...
├── types/
│   └── page-objects.ts (interfaces and types)
├── factories/
│   └── PageObjectFactory.ts
└── docs/
    └── page-objects.md
```

**Dependencies**
- Generated page objects will depend on:
  - `@playwright/test` - Playwright testing framework
  - TypeScript - For type safety
  - Generated types and interfaces - For type safety

**Error Handling**
- Handle missing metadata gracefully
- Skip page object generation for incomplete metadata
- Log warnings for skipped page objects
- Continue generation even if some page objects fail

**Performance Considerations**
- Generate page objects in parallel where possible
- Cache template compilation
- Optimize code generation for large metadata sets

### Validation and Quality

**Generated Code Validation**
- Validate TypeScript compilation of generated code
- Validate Playwright locator syntax
- Validate method signatures and types
- Check for duplicate locators or methods

**Code Quality**
- Follow Playwright best practices
- Follow TypeScript best practices
- Ensure generated code is maintainable
- Ensure generated code is readable and well-documented

### Configuration

**Generation Configuration**
- Support configuration for:
  - Locator strategy preferences
  - Method generation preferences
  - Template customization
  - Output directory structure
  - Code formatting preferences

**CLI Integration**
- Add `generate-page-objects` command to CLI
- Support command-line options for:
  - Input metadata path
  - Output directory
  - Configuration file
  - Template directory
  - Generation options

## Success Criteria

1. **Completeness**: Generate page objects for all parsed Salesforce objects, Lightning pages, LWC components, and Aura components
2. **Correctness**: Generated page objects use correct locators and methods that work with actual Salesforce UI
3. **Maintainability**: Generated code follows best practices and is maintainable
4. **Type Safety**: Generated code is fully typed with TypeScript
5. **Documentation**: Generated code is well-documented with JSDoc comments
6. **Testability**: Generated page objects include unit tests
7. **Integration**: Page objects integrate correctly with parsed metadata from all previous parsing phases
8. **Performance**: Code generation completes in reasonable time for large metadata sets

## Out of Scope

- Salesforce Classic UI patterns (deprioritized)
- Salesforce Mobile patterns (deprioritized)
- Visual regression testing page objects
- Performance testing page objects
- Accessibility testing page objects (beyond basic ARIA support)
- Multi-language Salesforce org support (beyond English)

