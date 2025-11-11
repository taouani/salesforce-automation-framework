# Spec Requirements: Test Specification Generator

## Initial Description

Test Specification Generator - A feature that generates automated test specifications (Playwright test files) based on parsed Salesforce metadata. This feature will:

- Generate test files for object CRUD operations
- Create tests for validation rules
- Generate tests for record types
- Create tests for field-level validations
- Generate tests for object relationships

## Requirements Discussion

### First Round Questions

**Q1:** I assume we'll generate separate test files per object (e.g., `account.spec.ts`, `contact.spec.ts`) with multiple test cases inside, organized by test type (CRUD, validation rules, record types). Is that correct, or should we organize differently (e.g., one file per test type across all objects)?

**Answer:** Exactly, generate separate test files per object.

**Q2:** For object CRUD operations, I'm thinking we should generate tests for Create, Read, Update, and Delete operations, using the generated page objects and faker-js for test data. Should we also include bulk operations (creating/updating multiple records) or focus on single-record operations?

**Answer:** Focus on single-record operations.

**Q3:** For validation rules, I assume we'll generate tests that:
   - Verify validation rules trigger correctly when invalid data is provided
   - Verify validation rules don't block valid data
   - Test both positive and negative scenarios
   Is that correct, or should we include additional validation rule test scenarios?

**Answer:** It is correct.

**Q4:** For record types, I'm thinking we should generate tests that:
   - Verify record creation with each record type
   - Test record type-specific field visibility/requirements
   - Validate record type picklist values
   Should we also test record type assignment logic or focus on basic record type functionality?

**Answer:** Also test record type assignment logic.

**Q5:** For field-level validations, I assume we'll test:
   - Required fields
   - Field format validations (email, phone, URL, etc.)
   - Field length constraints
   - Picklist value restrictions
   Is that correct, or should we include additional field validation scenarios?

**Answer:** It is correct.

**Q6:** For object relationships, I'm thinking we should generate tests that:
   - Verify lookup/master-detail relationships work correctly
   - Test cascade delete behavior for master-detail relationships
   - Validate relationship field population
   Should we also test relationship field updates and relationship record navigation?

**Answer:** Yes please.

**Q7:** I assume we'll use the generated page objects for interactions and faker-js for generating test data that respects field types and validation rules. Should we also generate test data factories/helpers, or rely on inline data generation within each test?

**Answer:** For test data generation please use salesforce apis. it is faster to setup test data for each test. yes, please generate test data factories/helpers.

**Q8:** I'm thinking generated tests should follow Playwright best practices with:
   - `test.describe()` blocks for grouping related tests
   - `test.beforeEach()` for setup (navigation, login if needed)
   - Clear test descriptions
   - Proper assertions using Playwright's expect API
   Should we also include test fixtures, or keep the structure simpler initially?

**Answer:** Please include test fixtures.

**Q9:** Are there any specific test scenarios or Salesforce features we should exclude from this initial implementation? For example, should we skip testing for:
   - Custom UI components (LWC/Aura) - these might be handled separately?
   - Flow execution - might be a separate feature?
   - Permission-based testing - might be handled in Phase 4?

**Answer:** No, include the mentioned features into the scope.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Page Object Model Generator - Path: `src/generator/page-object/`
- Components to potentially reuse:
  - Template engine (`src/generator/template-engine.ts`) - Uses Handlebars for code generation
  - File generator (`src/generator/file-generator.ts`) - Handles file writing with formatting
  - Generation engine pattern (`src/generator/page-object/generation-engine.ts`) - Orchestrates generation process
  - Template system - Handlebars templates in `src/generator/templates/`
  - Code formatting - Prettier integration for generated code
  - Type definitions pattern - TypeScript interfaces for generated structures
- Backend logic to reference:
  - Similar code generation patterns (load metadata, convert to definitions, render templates, write files)
  - Error handling patterns
  - Logging and progress reporting
  - CLI integration patterns

### Follow-up Questions

**Follow-up 1:** You mentioned using Salesforce APIs for test data generation. Could you clarify:
   - Which Salesforce APIs should we use? (REST API, SOAP API, Tooling API, or a combination?)
   - How should authentication be handled? (Should tests use a configured Salesforce org connection, or should the framework generate authentication helpers?)
   - Should the test data factories/helpers use Salesforce APIs directly, or should they use a wrapper/utility layer?

**Answer:** 
   - Please use REST API and Tooling API if needed for some scenarios
   - The framework should generate authentication helpers. But if it is possible to handle the authentication via a configured Salesforce org connection (have the two possibilities) it will be awesome
   - Use Salesforce APIs directly

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements
- Generate separate test files per Salesforce object (e.g., `account.spec.ts`, `contact.spec.ts`)
- Generate CRUD operation tests (Create, Read, Update, Delete) - single-record operations only
- Generate validation rule tests (positive and negative scenarios)
- Generate record type tests (creation, field visibility, picklist values, assignment logic)
- Generate field-level validation tests (required fields, format validations, length constraints, picklist restrictions)
- Generate relationship tests (lookup/master-detail relationships, cascade delete, field population, updates, navigation)
- Include custom UI component testing (LWC/Aura) in scope
- Include Flow execution testing in scope
- Include permission-based testing in scope
- Use Salesforce APIs for test data generation (faster setup)
- Generate test data factories/helpers
- Include test fixtures in generated tests
- Follow Playwright best practices:
  - `test.describe()` blocks for grouping
  - `test.beforeEach()` for setup
  - Clear test descriptions
  - Proper assertions using Playwright's expect API
  - Test fixtures

### Reusability Opportunities
- **Template Engine**: Reuse Handlebars template system from Page Object Model Generator
- **File Generator**: Reuse file writing and formatting utilities
- **Generation Engine Pattern**: Follow similar orchestration pattern (load metadata, convert to definitions, render templates, write files)
- **Type Definitions**: Create TypeScript interfaces for test structures (similar to page object types)
- **Error Handling**: Follow existing error handling patterns
- **Logging**: Use existing logging infrastructure
- **CLI Integration**: Follow similar CLI command patterns

### Scope Boundaries
**In Scope:**
- Test file generation per object
- CRUD operation tests (single-record)
- Validation rule tests
- Record type tests (including assignment logic)
- Field-level validation tests
- Relationship tests (including updates and navigation)
- Custom UI component testing (LWC/Aura)
- Flow execution testing
- Permission-based testing
- Test data generation using Salesforce APIs
- Test data factories/helpers
- Test fixtures
- Playwright best practices compliance

**Out of Scope:**
- Bulk operation tests (explicitly excluded - single-record only)
- Test execution (tests are generated, not executed by the framework)

### Technical Considerations
- **Input Data Sources**: 
  - Parsed XML metadata (objects, fields, validation rules, record types, relationships)
  - Generated page objects (from Page Object Model Generator)
  - Parsed Apex code (for business logic understanding)
  - Parsed Flow definitions (for flow testing)
  - Parsed LWC/Aura components (for component testing)
  - Parsed profiles/permission sets (for permission testing)
- **Code Generation**: 
  - Use Handlebars templates (similar to Page Object Model Generator)
  - Generate TypeScript test files
  - Format with Prettier
  - Validate TypeScript compilation
- **Test Data Generation**:
  - Use Salesforce REST API (primary)
  - Use Tooling API when needed for specific scenarios
  - Generate test data factories/helpers that use Salesforce APIs directly
  - Faster setup using APIs vs. UI interactions
  - Support two authentication approaches:
    1. Generated authentication helpers (default)
    2. Configured Salesforce org connection (if possible)
- **Test Structure**:
  - Separate test files per object
  - Playwright test structure with describe blocks
  - Test fixtures included
  - beforeEach setup hooks
  - Proper assertions
- **Integration Points**:
  - Leverage generated page objects for UI interactions
  - Use parsed metadata for test scenario generation
  - Salesforce REST API and Tooling API integration for test data setup
  - Authentication: Support both generated helpers and configured org connection
- **Similar Code Patterns to Follow**:
  - Page Object Model Generator's generation engine pattern
  - Template-based code generation approach
  - File writing and formatting utilities
  - Type definition patterns

