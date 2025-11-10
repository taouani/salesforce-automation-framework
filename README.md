# Salesforce Test Automation Framework

A test automation framework for Salesforce solutions that generates Playwright test suites from Salesforce metadata repositories.

## Overview

This framework automatically parses Salesforce metadata repositories and generates comprehensive Playwright test suites with TypeScript, following Page Object Model patterns and including realistic test data generation.

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

## License

MIT

