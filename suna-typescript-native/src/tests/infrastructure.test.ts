import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { env } from '../lib/config/environment';
import { logger } from '../lib/logging/logger';
import { toolRegistry } from '../lib/tools/tool-registry';
import { ShellTool } from '../lib/tools/sandbox/shell-tool';

describe('Infrastructure Tests', () => {
  beforeAll(async () => {
    // Register tools for testing
    await toolRegistry.registerTool(ShellTool);
  });

  afterAll(async () => {
    // Cleanup
    await toolRegistry.clearAll();
  });

  describe('Environment Configuration', () => {
    it('should load environment variables', () => {
      expect(env.NODE_ENV).toBeDefined();
      expect(env.DEFAULT_MODEL).toBe('gpt-4o');
      expect(env.SUPABASE_URL).toBeDefined();
      expect(env.REDIS_PORT).toBe(6379);
    });

    it('should validate model aliases', () => {
      expect(env.DEFAULT_MODEL).toBe('gpt-4o');
    });

    it('should handle test environment', () => {
      expect(env.NODE_ENV).toBe('test');
    });
  });

  describe('Logger', () => {
    it('should log messages', () => {
      expect(() => {
        logger.info('Test message');
        logger.debug('Debug message');
        logger.warn('Warning message');
      }).not.toThrow();
    });
  });

  describe('Tool Registry', () => {
    it('should register tools', () => {
      const stats = toolRegistry.getStats();
      expect(stats.totalTools).toBeGreaterThan(0);
      expect(stats.openApiFunctions).toBeGreaterThan(0);
    });

    it('should have shell tool registered', () => {
      expect(toolRegistry.hasOpenAPIFunction('execute')).toBe(true);
      expect(toolRegistry.hasXMLTag('shell_execute')).toBe(true);
    });

    it('should get OpenAPI schemas', () => {
      const schemas = toolRegistry.getOpenAPISchemas();
      expect(schemas.length).toBeGreaterThan(0);
      expect(schemas[0]).toHaveProperty('type', 'function');
    });
  });

  describe('Shell Tool', () => {
    it('should execute safe commands', async () => {
      const result = await toolRegistry.executeOpenAPIFunction(
        'execute',
        { command: 'echo "Hello World"' }
      );
      
      expect(result.success).toBe(true);
      expect(result.data?.stdout).toContain('Hello World');
    });

    it('should reject dangerous commands', async () => {
      const result = await toolRegistry.executeOpenAPIFunction(
        'execute',
        { command: 'rm -rf /' }
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('dangerous pattern');
    });

    it('should reject unauthorized commands', async () => {
      const result = await toolRegistry.executeOpenAPIFunction(
        'execute',
        { command: 'unauthorized_command' }
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not in the allowed commands list');
    });
  });
});
