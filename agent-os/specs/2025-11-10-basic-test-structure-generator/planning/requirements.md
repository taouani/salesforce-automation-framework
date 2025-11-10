# Spec Requirements: Basic Test Structure Generator

## Initial Description
Create a test structure generator that sets up the foundational folder structure and base files for Playwright test projects. This includes:

- Create folder structure generator (pages/, tests/, config/, utils/, models/, fixtures/)
- Generate base Playwright configuration files
- Create TypeScript project setup with dependencies
- Generate base utility functions and helpers

This feature will generate the initial project structure that test automation engineers need to start writing Playwright tests for Salesforce solutions.

## Requirements Discussion

### First Round Questions

**Q1:** Should the generator create the folder structure at a user-specified output path, or should it create it in the current directory? I'm assuming it takes an output path as a parameter—is that correct?

**Answer:** yes

**Q2:** Should the generated `playwright.config.ts` include default settings for Salesforce testing (e.g., base URL, viewport sizes, timeouts), or should it be a minimal template that users customize? I'm thinking we should include sensible defaults for Salesforce orgs—is that correct?

**Answer:** yes please

**Q3:** Should the generator create a complete `tsconfig.json` with Playwright-specific settings, or extend from a base configuration? I'm assuming we create a standalone `tsconfig.json` with appropriate compiler options—is that correct?

**Answer:** yes

**Q4:** Should the generator create a `package.json` with all required dependencies (`@playwright/test`, `@faker-js/faker`, TypeScript, etc.), or should users install dependencies separately? I'm thinking we generate a `package.json` with the necessary dependencies—is that correct?

**Answer:** yes

**Q5:** What types of utility functions should be included? I'm thinking:
   - Salesforce login helpers
   - Common element wait utilities
   - Test data helpers
   - Screenshot/recording utilities
   Is this the right scope, or should we include more/less?

**Answer:** it is the minimum, if you could add additional utility functions it could be awesome

**Q6:** Should we generate base/abstract Page Object classes that other page objects can extend, or just create empty folder structure? I'm assuming we create a base `BasePage` class with common Salesforce page interactions—is that correct?

**Answer:** yes

**Q7:** Besides `playwright.config.ts`, should we generate any other config files (e.g., `.env.example` for Salesforce org credentials, `.gitignore` for test artifacts)? I'm thinking we should include these—is that correct?

**Answer:** it is correct

**Q8:** If the output directory already exists and contains files, should the generator overwrite them, skip existing files, or prompt the user? I'm assuming we should prompt or have a `--force` flag—is that correct?

**Answer:** have a --force flag

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

No follow-up questions needed.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements
- Generate folder structure at user-specified output path
  - Create folders: pages/, tests/, config/, utils/, models/, fixtures/
- Generate base Playwright configuration file (`playwright.config.ts`)
  - Include default settings for Salesforce testing (base URL, viewport sizes, timeouts)
  - Include sensible defaults for Salesforce orgs
- Generate TypeScript project setup
  - Create standalone `tsconfig.json` with Playwright-specific settings and appropriate compiler options
- Generate `package.json` with required dependencies
  - Include: `@playwright/test`, `@faker-js/faker`, TypeScript, and other necessary dependencies
- Generate base utility functions and helpers (minimum set)
  - Salesforce login helpers
  - Common element wait utilities
  - Test data helpers
  - Screenshot/recording utilities
  - Additional utility functions beyond the minimum (to be awesome)
- Generate base Page Object Model class
  - Create base `BasePage` class with common Salesforce page interactions
  - Other page objects can extend this base class
- Generate additional configuration files
  - `.env.example` for Salesforce org credentials
  - `.gitignore` for test artifacts
- Support `--force` flag for overwriting existing files/directories
  - When output directory exists and contains files, use `--force` flag to overwrite

### Reusability Opportunities
No similar existing features identified in the codebase.

### Scope Boundaries
**In Scope:**
- Folder structure generation (pages/, tests/, config/, utils/, models/, fixtures/)
- Playwright configuration file generation with Salesforce defaults
- TypeScript configuration file generation
- Package.json generation with dependencies
- Base utility functions (login helpers, wait utilities, test data helpers, screenshot/recording utilities, plus additional utilities)
- Base Page Object Model class generation
- Additional config files (.env.example, .gitignore)
- Force flag for overwriting existing files

**Out of Scope:**
- Generating actual test files (that's for later phases)
- Generating page objects for specific Salesforce objects (that's for later phases)
- Custom template system (basic templates only)
- Interactive prompts (CLI flags only)

### Technical Considerations
- Use Node.js `fs/promises` for file system operations
- Use template engine (handlebars or ejs) for generating code files from templates
- Use `prettier` to format generated code
- Follow existing CLI patterns using `commander`
- Output path should be configurable via CLI argument
- Support `--force` flag to overwrite existing files
- Generated code should follow TypeScript best practices
- Generated Playwright config should include sensible defaults for Salesforce testing
- Generated utilities should be reusable and follow best practices
- Base Page Object class should provide common Salesforce page interaction patterns

