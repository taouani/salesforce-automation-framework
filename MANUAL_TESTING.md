# Manual Testing Guide for Test Structure Generator

## Prerequisites

1. Build the project:
```bash
npm run build
```

2. Copy templates to dist directory:
```bash
cp -r src/generator/templates dist/generator/
```

## Testing the Generator

### Option 1: Using the CLI Command (Recommended)

The easiest way to test the generator is using the CLI command:

```bash
# Basic usage - generate test structure in a directory
npm run dev generate ./my-test-project

# With custom project name (use -- to separate npm args from script args)
npm run dev generate ./my-test-project -- --project-name "my-salesforce-tests"

# With force flag to overwrite existing directory
npm run dev generate ./my-test-project -- --force

# Or using the compiled version (no -- needed)
node dist/cli/index.js generate ./my-test-project --project-name "my-salesforce-tests"
```

### Option 2: Using Node.js Directly

You can also test the generator programmatically:

```bash
node -e "
import('./dist/generator/index.js').then(m => 
  m.generateTestStructure({
    outputPath: './test-output',
    force: false,
    projectName: 'my-test-project'
  }).then(() => console.log('✅ Test structure generated successfully!'))
    .catch(e => console.error('❌ Error:', e.message))
)
"
```

### Option 3: Interactive Testing

Create a test script file `test-generator.js`:

```javascript
import { generateTestStructure } from './dist/generator/index.js';

async function test() {
  try {
    await generateTestStructure({
      outputPath: './test-output',
      force: false,
      projectName: 'salesforce-test-project'
    });
    console.log('✅ Test structure generated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();
```

Then run:
```bash
node test-generator.js
```

## What Gets Generated

After running the generator, you should see the following structure:

```
my-test-project/
├── pages/
│   └── base-page.ts          # Base Page Object Model class
├── tests/                     # Test specification files (empty initially)
├── config/                    # Configuration files (empty initially)
├── utils/                     # Utility functions
│   ├── login-helpers.ts       # Salesforce login utilities
│   ├── wait-utilities.ts      # Element wait utilities
│   ├── test-data-helpers.ts   # Test data generation helpers
│   ├── screenshot-utilities.ts # Screenshot utilities
│   └── additional-utilities.ts # Additional helper utilities
├── models/                    # Data models (empty initially)
├── fixtures/                 # Custom Playwright fixtures (empty initially)
├── playwright.config.ts       # Playwright configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Package dependencies
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore file
└── README.md                  # Project README
```

## Verification Steps

1. **Check folder structure:**
```bash
ls -la my-test-project/
ls -la my-test-project/utils/
ls -la my-test-project/pages/
```

2. **Verify generated files:**
```bash
# Check Playwright config
head -20 my-test-project/playwright.config.ts

# Check TypeScript config
cat my-test-project/tsconfig.json

# Check package.json
cat my-test-project/package.json

# Check BasePage class
head -30 my-test-project/pages/base-page.ts

# Check utility files
head -20 my-test-project/utils/login-helpers.ts
```

3. **Verify code formatting:**
All generated TypeScript files should be properly formatted with Prettier.

4. **Test with force flag:**
```bash
# Generate first time
npm run dev generate ./test-force-demo

# Generate again with force flag (should overwrite)
npm run dev generate ./test-force-demo --force
```

## Expected Output

When running the generator, you should see log messages like:

```
[INFO] Starting test structure generation
[INFO] Generating folder structure
[INFO] Folder structure generated successfully
[INFO] Playwright config generated
[INFO] TypeScript config generated
[INFO] package.json generated
[INFO] Login helpers generated
[INFO] Wait utilities generated
[INFO] Test data helpers generated
[INFO] Screenshot utilities generated
[INFO] Additional utilities generated
[INFO] BasePage class generated
[INFO] Test structure generation completed successfully
```

## Troubleshooting

### Issue: Templates not found
**Solution:** Make sure templates are copied to dist:
```bash
cp -r src/generator/templates dist/generator/
```

### Issue: Directory already exists
**Solution:** Use the `--force` flag:
```bash
npm run dev generate ./my-project --force
```

### Issue: Permission denied
**Solution:** Check directory permissions and ensure you have write access.

## Next Steps

After generating the test structure:

1. Navigate to the generated directory:
```bash
cd my-test-project
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Salesforce org credentials
```

5. Start writing tests in the `tests/` directory!

