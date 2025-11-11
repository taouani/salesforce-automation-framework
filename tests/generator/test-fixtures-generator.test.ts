/**
 * Tests for test fixtures generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import {
  generateAuthenticationFixture,
  generatePageObjectFixture,
  generateTestDataFactoryFixture,
  generateAllTestFixtures,
  generateTestFixturesFile,
} from '../../src/generator/test-fixtures/test-fixtures-generator.js';

describe('Test Fixtures Generator', () => {
  const testOutputDir = join(process.cwd(), 'test-output-fixtures');

  beforeEach(async () => {
    // Clean up before each test
    await rm(testOutputDir, { recursive: true, force: true });
    await mkdir(join(testOutputDir, 'fixtures'), { recursive: true });
  });

  afterEach(async () => {
    // Clean up after each test
    await rm(testOutputDir, { recursive: true, force: true });
  });

  it('should generate authentication fixture', () => {
    const fixture = generateAuthenticationFixture();
    expect(fixture.fixtureName).toBe('authenticatedPage');
    expect(fixture.fixtureType).toBe('authentication');
  });

  it('should generate page object fixture', () => {
    const fixture = generatePageObjectFixture();
    expect(fixture.fixtureName).toBe('pageObjects');
    expect(fixture.fixtureType).toBe('pageObject');
  });

  it('should generate test data factory fixture', () => {
    const fixture = generateTestDataFactoryFixture();
    expect(fixture.fixtureName).toBe('testData');
    expect(fixture.fixtureType).toBe('testData');
  });

  it('should generate all test fixtures', () => {
    const fixtures = generateAllTestFixtures();
    expect(fixtures).toHaveLength(3);
    expect(fixtures.some(f => f.fixtureName === 'authenticatedPage')).toBe(true);
    expect(fixtures.some(f => f.fixtureName === 'pageObjects')).toBe(true);
    expect(fixtures.some(f => f.fixtureName === 'testData')).toBe(true);
  });

  it('should generate test fixtures file', async () => {
    const filePath = await generateTestFixturesFile(testOutputDir);
    expect(filePath).toContain('test-fixtures.ts');
    expect(filePath).toContain('fixtures');
  });
});

