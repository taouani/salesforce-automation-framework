/**
 * Tests for logging functionality
 */

import { describe, it, expect } from 'vitest';
import { logger, LogLevel } from '../../src/utils/logger.js';

describe('Logger', () => {
  it('should have logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should support different log levels', () => {
    expect(LogLevel.INFO).toBe('info');
    expect(LogLevel.WARN).toBe('warn');
    expect(LogLevel.ERROR).toBe('error');
    expect(LogLevel.DEBUG).toBe('debug');
    expect(LogLevel.TRACE).toBe('trace');
  });

  it('should log messages without throwing', () => {
    expect(() => {
      logger.info('Test info message');
      logger.warn('Test warning message');
      logger.error('Test error message');
    }).not.toThrow();
  });
});

