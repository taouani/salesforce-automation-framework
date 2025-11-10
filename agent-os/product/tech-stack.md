# Product Tech Stack

This document defines the technical stack used for the Salesforce Test Automation Framework - a tool that parses Salesforce metadata and generates Playwright test suites.

## Framework & Runtime

- **Application Framework:** Node.js CLI application
- **Language/Runtime:** TypeScript / Node.js (v18+)
- **Package Manager:** npm or yarn

## Core Parsing Libraries

### XML Parsing
- **Library:** `fast-xml-parser` or `xml2js`
  - **Purpose:** Parse Salesforce metadata XML files (object definitions, profiles, permission sets, flows, etc.)
  - **Rationale:** Fast, reliable XML parsing with good TypeScript support. Handles Salesforce's XML metadata format effectively.

### JavaScript/TypeScript Parsing
- **Library:** `@babel/parser` with `@babel/traverse` and `@babel/types`
  - **Purpose:** Parse Lightning Web Component JavaScript files, extract component structure, methods, properties
  - **Rationale:** Industry-standard JavaScript parser with excellent AST manipulation capabilities. Supports modern JS/TS syntax.

### HTML Parsing
- **Library:** `cheerio` or `jsdom`
  - **Purpose:** Parse HTML templates from LWC components and Visualforce pages
  - **Rationale:** jQuery-like API for server-side HTML manipulation. Efficient for extracting elements and attributes.

### CSS Parsing
- **Library:** `postcss` with `postcss-value-parser` or `css-tree`
  - **Purpose:** Parse CSS files from LWC and Aura components
  - **Rationale:** Robust CSS parsing with AST support. Can extract selectors, properties, and values.

### Apex Code Parsing
- **Library:** Custom parser using `antlr4` with Apex grammar OR `@salesforce/apex-parser`
  - **Purpose:** Parse Apex classes and triggers to understand business logic
  - **Rationale:** Apex is Java-like but has Salesforce-specific syntax. ANTLR provides grammar-based parsing, or use Salesforce's official parser if available.

### Flow Parsing
- **Library:** `fast-xml-parser` (XML-based)
  - **Purpose:** Parse Salesforce Flow definition XML files
  - **Rationale:** Flows are defined in XML format, can reuse XML parsing infrastructure.

## File System & Utilities

- **File System:** Node.js `fs/promises` and `path`
- **Glob Patterns:** `glob` or `fast-glob`
  - **Purpose:** Traverse Salesforce metadata directory structure
- **File Watching:** `chokidar` (optional, for future metadata change detection)

## Code Generation

### Template Engine
- **Library:** `handlebars` or `ejs` or custom string templating
  - **Purpose:** Generate Playwright test code from templates
  - **Rationale:** Template engines provide clean separation between logic and output format. Handlebars offers good TypeScript support.

### Code Formatting
- **Library:** `prettier` with TypeScript plugin
  - **Purpose:** Format generated test code for consistency
  - **Rationale:** Industry-standard code formatter ensures generated code follows best practices.

## Test Data Generation

- **Library:** `@faker-js/faker`
  - **Purpose:** Generate realistic test data for Salesforce fields
  - **Rationale:** Comprehensive fake data generator with good TypeScript support. Can generate names, emails, dates, numbers, etc.

## Type Definitions & Models

- **TypeScript:** Native TypeScript for type safety
- **Models:** Custom TypeScript interfaces for:
  - Salesforce metadata structures
  - Generated test structures
  - Configuration objects

## Testing & Quality

- **Test Framework:** `jest` or `vitest`
  - **Purpose:** Test the framework itself
- **Linting:** `eslint` with TypeScript plugin
- **Type Checking:** TypeScript compiler (`tsc`)

## CLI & User Interface

- **CLI Framework:** `commander` or `yargs`
  - **Purpose:** Command-line interface for running the framework
- **Progress Reporting:** `ora` or `cli-progress`
  - **Purpose:** Show progress during metadata parsing and test generation
- **Logging:** `winston` or `pino`
  - **Purpose:** Structured logging for debugging and user feedback

## Output Format

### Generated Test Structure
- **Test Framework:** Playwright with TypeScript
- **Test Runner:** Playwright Test Runner
- **Assertions:** Playwright's built-in assertions + `@playwright/test`

### Generated Code Dependencies
The framework will generate tests that require:
- `@playwright/test`
- `@faker-js/faker`
- TypeScript (for type definitions)

## Development Dependencies

- **Build Tool:** `tsx` or `ts-node` for development, `tsc` for production builds
- **Development Server:** Not applicable (CLI tool)
- **Package Management:** npm or yarn workspaces (if splitting into multiple packages)

## Deployment & Distribution

- **Distribution:** npm package (published to npm registry or private registry)
- **Installation:** `npm install -g` for global CLI or `npm install` for project dependency
- **CI/CD:** GitHub Actions or similar for automated testing and publishing

## Third-Party Services

- **Not Applicable:** This is a CLI tool that operates on local files, no external services required

## Architecture Notes

### Modular Design
The framework should be structured as:
- **Parser Modules:** Separate parsers for each metadata type (XML, JS, Apex, etc.)
- **Generator Modules:** Separate generators for different test types
- **Core Engine:** Orchestrates parsing and generation
- **CLI Interface:** User-facing command-line interface

### Extensibility
- Plugin system for custom parsers
- Template customization support
- Configuration file for generation preferences

