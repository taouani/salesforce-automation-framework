# Specification: Test Specification Generator

## Goal
Create a code generator that automatically produces Playwright test specification files for Salesforce objects, validation rules, record types, field validations, relationships, components, flows, and permissions. The generator will create TypeScript test files that use generated page objects and Salesforce APIs for test data setup, following Playwright best practices with proper test structure, fixtures, and assertions.

## User Stories
- As a test automation engineer, I want test specifications automatically generated from Salesforce metadata so that I can quickly create comprehensive test coverage without manually writing repetitive test code
- As a QA lead, I want consistent test patterns across all generated tests so that test suites are maintainable and follow Playwright best practices
- As a test automation engineer, I want tests that use Salesforce APIs for fast test data setup so that my tests run efficiently without slow UI-based data creation

## Specific Requirements

**Test File Organization**
- Generate separate test files per Salesforce object (e.g., `account.spec.ts`, `contact.spec.ts`)
- Organize test cases within each file by test type (CRUD, validation rules, record types, field validations, relationships)
- Place generated test files in `tests/` directory of the generated test project
- Use descriptive test file names based on object API names

**CRUD Operation Tests**
- Generate Create, Read, Update, and Delete test cases for each object
- Focus on single-record operations (exclude bulk operations)
- Use generated page objects for UI interactions
- Use Salesforce REST API for test data setup (create records via API before UI tests)
- Include proper assertions using Playwright's expect API
- Test both successful operations and error scenarios

**Validation Rule Tests**
- Generate positive test cases (verify validation rules don't block valid data)
- Generate negative test cases (verify validation rules trigger correctly with invalid data)
- Test each validation rule defined in the object metadata
- Use Salesforce APIs to create test records that should pass/fail validation
- Verify error messages are displayed correctly when validation rules trigger

**Record Type Tests**
- Generate tests for record creation with each record type
- Test record type-specific field visibility and requirements
- Validate record type picklist values (ensure only valid values for record type)
- Test record type assignment logic (changing record types on existing records)
- Verify record type selection during record creation workflow

**Field-Level Validation Tests**
- Generate tests for required fields (verify error when required field is missing)
- Test field format validations (email, phone, URL, etc.)
- Test field length constraints (max length, min length)
- Test picklist value restrictions (valid vs invalid values)
- Use Salesforce APIs to create test data that violates field constraints

**Relationship Tests**
- Generate tests for lookup relationships (verify relationship field population)
- Generate tests for master-detail relationships (verify cascade delete behavior)
- Test relationship field updates (changing related records)
- Test relationship record navigation (navigating to related records via UI)
- Verify relationship field population from both sides of the relationship

**Component Testing (LWC/Aura)**
- Generate component-level tests for custom LWC components
- Generate component-level tests for Aura components
- Test component properties and events
- Test component interactions using generated component page objects
- Verify component rendering and behavior

**Flow Execution Testing**
- Generate tests for Flow execution paths
- Test Flow screen navigation using generated Flow screen page objects
- Test Flow input/output handling
- Verify Flow decision paths and branching logic
- Test Flow error handling scenarios

**Permission-Based Testing**
- Generate tests for profile-based access control
- Generate tests for permission set scenarios
- Test field-level security (read/write permissions)
- Test object-level permissions (create, read, edit, delete)
- Use different user profiles/permission sets to verify access restrictions

**Test Data Generation**
- Generate test data factories/helpers that use Salesforce REST API directly
- Use Tooling API when needed for specific scenarios (metadata operations)
- Support two authentication approaches:
  1. Generated authentication helpers (default approach)
  2. Configured Salesforce org connection (if possible, provide both options)
- Generate factory functions for each object type
- Generate helper functions for creating related records (respecting relationships)
- Include cleanup functions for test data teardown

**Test Structure and Playwright Best Practices**
- Use `test.describe()` blocks for grouping related tests by test type
- Use `test.beforeEach()` for setup (navigation, login if needed)
- Include test fixtures for common test setup/teardown
- Use clear, descriptive test descriptions
- Use proper assertions with Playwright's expect API
- Include proper error handling and timeout configurations
- Generate tests that are independent and can run in parallel

**Code Generation Approach**
- Use Handlebars templates (reuse template engine from Page Object Model Generator)
- Generate TypeScript test files with proper type definitions
- Format generated code with Prettier
- Validate TypeScript compilation of generated tests
- Follow similar generation engine pattern as Page Object Model Generator (load metadata, convert to definitions, render templates, write files)

## Existing Code to Leverage

**Template Engine (`src/generator/template-engine.ts`)**
- Reuse Handlebars template rendering system
- Use existing template compilation and rendering functions
- Follow same error handling patterns for template rendering

**File Generator (`src/generator/file-generator.ts`)**
- Reuse file writing utilities with Prettier formatting
- Use existing directory creation functions
- Follow same error handling for file operations

**Generation Engine Pattern (`src/generator/page-object/generation-engine.ts`)**
- Follow similar orchestration pattern: load metadata, convert to definitions, render templates, write files
- Reuse logging and progress reporting infrastructure
- Follow same error collection and reporting patterns

**Type Definitions Pattern**
- Create TypeScript interfaces for test structures (similar to page object type definitions)
- Define test definition types (TestDefinition, CRUDTestDefinition, ValidationTestDefinition, etc.)
- Follow existing type definition patterns in `src/types/`

**CLI Integration**
- Follow similar CLI command patterns from existing generators
- Add `generate-tests` command to CLI
- Use same argument/option parsing patterns
- Follow same output and logging patterns

## Out of Scope
- Bulk operation tests (explicitly excluded - single-record operations only)
- Test execution (tests are generated, not executed by the framework)
- Test reporting and coverage analysis (handled by Playwright test runner)
- Custom test data generation using faker-js (using Salesforce APIs instead)
- Test maintenance and update logic (users re-run generator when metadata changes)
- Test debugging tools or utilities (handled by Playwright)
- Integration with CI/CD pipelines (users configure separately)
- Test result storage or analytics (handled by external tools)
- Custom test framework extensions (use standard Playwright features only)
- Test parallelization configuration (handled by Playwright config)

