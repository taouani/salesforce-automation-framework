# Salesforce Test Automation Framework

A test automation framework for Salesforce solutions that generates Playwright test suites from Salesforce metadata repositories.

## Overview

This framework automatically parses Salesforce metadata repositories and generates comprehensive Playwright test suites with TypeScript, following Page Object Model patterns and including realistic test data generation.

### Features

- **Metadata Parsing**: Parse Salesforce XML, Apex, LWC, Aura, and Flow metadata
- **Page Object Generation**: Generate TypeScript Page Object Model classes for Salesforce UI elements
- **Test Specification Generation**: Generate comprehensive Playwright test suites including:
  - CRUD operation tests
  - Validation rule tests
  - Record type tests
  - Field validation tests
  - Relationship tests
  - Component tests (LWC/Aura)
  - Flow execution tests
  - Permission-based tests
- **Test Data Factories**: Generate test data factories using Salesforce REST API
- **Test Fixtures**: Generate Playwright test fixtures for authentication and test data

## Project Structure

```
salesforce-automation-framework/
├── src/
│   ├── scanner/      # File system traversal and metadata discovery
│   ├── registry/     # Metadata registry and persistence
│   ├── classifier/   # Metadata classification system
│   ├── reporter/     # Report generation (console, JSON, Markdown)
│   ├── types/        # TypeScript type definitions
│   └── cli/          # Command-line interface
├── tests/            # Test files
└── dist/             # Compiled output
```

## Development

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Type Checking

```bash
npm run type-check
```

## Usage

### Parse Salesforce Metadata

```bash
# Parse XML metadata (objects, profiles, permission sets)
# Note: Use -- to separate npm arguments from CLI arguments
npm run dev -- parse ./salesforce-metadata -o ./parsed-results

# Parse specific metadata types
npm run dev -- parse-apex ./salesforce-metadata -o ./parsed-results
npm run dev -- parse-lwc ./salesforce-metadata -o ./parsed-results
npm run dev -- parse-aura ./salesforce-metadata -o ./parsed-results
npm run dev -- parse-flow ./salesforce-metadata -o ./parsed-results

# Or use the built version after building (no -- needed)
npm run build
node dist/cli/index.js parse ./salesforce-metadata -o ./parsed-results
```

### Generate Page Objects

```bash
# Generate page objects from parsed metadata
# Note: Use -- to separate npm arguments from CLI arguments
npm run dev -- generate-page-objects --input ./parsed-results --output ./my-test-project

# Or use short options
npm run dev -- generate-page-objects -i ./parsed-results -o ./my-test-project

# Or use the built version
node dist/cli/index.js generate-page-objects -i ./parsed-results -o ./my-test-project
```

### Generate Test Specifications

```bash
# Generate test specifications from parsed metadata
# Note: Use -- to separate npm arguments from CLI arguments
npm run dev -- generate-tests ./parsed-results ./my-test-project

# Or use options
npm run dev -- generate-tests --input ./parsed-results --output ./my-test-project

# With additional options
npm run dev -- generate-tests ./parsed-results ./my-test-project --auth-approach helpers --no-fixtures

# Or use the built version
node dist/cli/index.js generate-tests ./parsed-results ./my-test-project
```

#### Test Generation Options

- `-i, --input <path>`: Path to parsed metadata results directory (default: `./parsed-results`)
- `-o, --output <path>`: Output directory for generated tests (default: `./generated-tests`)
- `--auth-approach <approach>`: Authentication approach: `helpers`, `configuredConnection`, or `both` (default: `both`)
- `--no-fixtures`: Skip generating test fixtures
- `--no-test-data`: Skip generating test data factories

### Run Generated Tests

```bash
cd my-test-project
npm install
npx playwright test
```

For more information on running tests, see the generated `docs/test-execution-guide.md` in your test project.

## License

MIT

