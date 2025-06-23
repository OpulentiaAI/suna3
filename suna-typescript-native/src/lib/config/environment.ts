import { z } from 'zod';

// Check if we're in test environment
const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

// Environment validation schema
const envSchema = z.object({
  // Database - optional in test environment
  SUPABASE_URL: isTest
    ? z.string().url().optional().default('https://test.supabase.co')
    : z.string().url(),
  SUPABASE_ANON_KEY: isTest
    ? z.string().optional().default('test-anon-key')
    : z.string(),
  SUPABASE_SERVICE_ROLE_KEY: isTest
    ? z.string().optional().default('test-service-key')
    : z.string(),

  // Cache/Queue
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // LLM Providers
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),

  // External Services
  TAVILY_API_KEY: z.string().optional(),
  FIRECRAWL_API_KEY: z.string().optional(),
  DAYTONA_API_KEY: z.string().optional(),
  BROWSERBASE_API_KEY: z.string().optional(),

  // Application
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  NEXT_PUBLIC_ENV_MODE: z.enum(['LOCAL', 'staging', 'production']).default('LOCAL'),
  NEXT_PUBLIC_BACKEND_URL: z.string().url().default('http://localhost:3000'),

  // Feature Flags
  ENABLE_CUSTOM_AGENTS: z.coerce.boolean().default(false),
  ENABLE_THINKING_MODE: z.coerce.boolean().default(false),

  // Model Configuration
  DEFAULT_MODEL: z.string().default('gpt-4o'),
  MAX_TOKENS: z.coerce.number().default(4096),
  TEMPERATURE: z.coerce.number().default(0),
});

// Parse and validate environment variables
function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Environment validation failed');
  }
}

export const env = parseEnv();

// Type-safe environment access
export type Environment = z.infer<typeof envSchema>;

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isStaging = env.NODE_ENV === 'staging';

// Model aliases for backward compatibility
export const MODEL_ALIASES: Record<string, string> = {
  'gpt-4': 'gpt-4o',
  'gpt-4-turbo': 'gpt-4o',
  'claude-3': 'claude-3-5-sonnet-20241022',
  'claude-3-sonnet': 'claude-3-5-sonnet-20241022',
  'claude-3-haiku': 'claude-3-5-haiku-20241022',
};

// Get resolved model name
export function getModelName(modelAlias?: string): string {
  if (!modelAlias) return env.DEFAULT_MODEL;
  return MODEL_ALIASES[modelAlias] || modelAlias;
}

// Validate required API keys for specific providers
export function validateProviderKeys(provider: 'openai' | 'anthropic' | 'groq'): boolean {
  switch (provider) {
    case 'openai':
      return !!env.OPENAI_API_KEY;
    case 'anthropic':
      return !!env.ANTHROPIC_API_KEY;
    case 'groq':
      return !!env.GROQ_API_KEY;
    default:
      return false;
  }
}
