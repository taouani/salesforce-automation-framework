# Specification: Basic Test Structure Generator

## Goal
Create a test structure generator that sets up the foundational folder structure and base files for Playwright test projects, enabling test automation engineers to quickly bootstrap a well-organized test project with best practices and reusable utilities.

## User Stories
- As a test automation engineer, I want to generate a complete Playwright test project structure so that I can start writing tests immediately without manual setup
- As a QA lead, I want to ensure consistent test project structure across teams so that tests are maintainable and follow best practices

## Specific Requirements

**Folder Structure Generation**
- Generate folder structure at user-specified output path
- Create required directories: pages/, tests/, config/, utils/, models/, fixtures/
- Support `--force` flag to overwrite existing directories and files
- Validate output path and create parent directories if needed

**Playwright Configuration Generation**
- Generate `playwright.config.ts` with Salesforce-specific defaults
- Include base URL configuration placeholder for Salesforce orgs
- Set appropriate viewport sizes for Salesforce Lightning (desktop and mobile)
- Configure timeouts suitable for Salesforce page loads
- Include test execution settings (workers, retries, reporter configuration)
- Add Playwright browser configuration (Chromium, Firefox, WebKit)

**TypeScript Project Setup**
- Generate standalone `tsconfig.json` with Playwright-specific compiler options
- Configure module resolution for Node.js and Playwright
- Set strict type checking options
- Include path mappings for generated folder structure
- Configure output directory for compiled JavaScript

**Package Dependencies**
- Generate `package.json` with required runtime dependencies
- Include `@playwright/test` with appropriate version
- Include `@faker-js/faker` for test data generation
- Include TypeScript and type definitions
- Add npm scripts for test execution (test, test:ui, test:debug)
- Include development dependencies (prettier, eslint if applicable)

**Base Utility Functions**
- Generate Salesforce login helper utilities (authenticate, navigate to org)
- Create common element wait utilities (wait for Salesforce components, wait for Lightning elements)
- Generate test data helper functions (generate Salesforce-compatible data)
- Create screenshot and recording utilities for test artifacts
- Add additional utilities: date formatting, string manipulation, Salesforce-specific helpers
- Include error handling and retry logic utilities

**Base Page Object Model**
- Generate abstract `BasePage` class with common Salesforce page interactions
- Include methods for Salesforce Lightning component interactions
- Add navigation helpers (go to object, go to record, go to app)
- Include common element locator strategies for Salesforce
- Provide base methods for form interactions and data entry
- Make class extensible for specific page objects

**Configuration Files**
- Generate `.env.example` with Salesforce org credential placeholders (username, password, org URL)
- Create `.gitignore` for test artifacts (screenshots, videos, test-results/, playwright-report/)
- Include `.gitignore` entries for node_modules, dist, and generated files
- Add README.md with basic project setup instructions

**CLI Integration**
- Add `generate` command to existing CLI framework
- Accept output path as required argument
- Support `--force` flag to overwrite existing files
- Use existing logger for progress reporting
- Follow existing CLI patterns and error handling

**Code Generation Approach**
- Use template engine (handlebars or ejs) for generating code files from templates
- Format generated code using prettier for consistency
- Ensure generated code follows TypeScript best practices
- Include JSDoc comments in generated utilities and base classes
- Generate code that is ready to use without modification

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**CLI framework (src/cli/index.ts)**
- Reuse existing commander setup and command structure
- Follow existing CLI argument parsing patterns
- Use existing logger instance for structured logging
- Reuse existing error handling patterns

**File system utilities (src/scanner/file-scanner.ts)**
- Reuse file system operations patterns
- Use existing path validation utilities if applicable
- Follow existing directory creation patterns

**Logger utilities (src/utils/logger.ts)**
- Use existing logger instance for progress reporting
- Follow existing log level patterns (info, warn, error)
- Maintain consistent logging format

**Error handling utilities (src/utils/errors.ts)**
- Reuse existing error types and error handling patterns
- Create new generator-specific error types following same pattern
- Use ErrorCollection pattern if needed for aggregating errors

**Type definitions patterns**
- Follow existing TypeScript interface patterns from codebase
- Use consistent naming conventions
- Maintain type safety throughout generation process

## Out of Scope
- Generating actual test files (that's for later phases)
- Generating page objects for specific Salesforce objects (that's for later phases)
- Custom template system with user-defined templates (basic templates only)
- Interactive prompts or wizard-style setup (CLI flags only)
- Integration with Salesforce orgs to fetch configuration (local generation only)
- Generating test data factories for specific objects (basic helpers only)
- Custom Playwright configuration customization UI (template-based only)
- Support for multiple test frameworks (Playwright only)
- Generating CI/CD pipeline files (out of scope for this phase)

