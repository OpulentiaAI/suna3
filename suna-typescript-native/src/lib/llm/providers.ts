import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createGroq } from '@ai-sdk/groq';
import { env, getModelName, validateProviderKeys } from '../config/environment';
import { logger } from '../logging/logger';

// Supported LLM providers
export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GROQ = 'groq',
}

// Model configuration
export interface ModelConfig {
  provider: LLMProvider;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

// Provider-specific model mappings
export const PROVIDER_MODELS: Record<LLMProvider, Record<string, string>> = {
  [LLMProvider.OPENAI]: {
    'gpt-4o': 'gpt-4o',
    'gpt-4o-mini': 'gpt-4o-mini',
    'gpt-4-turbo': 'gpt-4-turbo',
    'gpt-4': 'gpt-4',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
    'o1-preview': 'o1-preview',
    'o1-mini': 'o1-mini',
  },
  [LLMProvider.ANTHROPIC]: {
    'claude-3-5-sonnet-20241022': 'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022': 'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229': 'claude-3-opus-20240229',
    'claude-3-sonnet-20240229': 'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307': 'claude-3-haiku-20240307',
  },
  [LLMProvider.GROQ]: {
    'llama-3.1-405b-reasoning': 'llama-3.1-405b-reasoning',
    'llama-3.1-70b-versatile': 'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant': 'llama-3.1-8b-instant',
    'mixtral-8x7b-32768': 'mixtral-8x7b-32768',
    'gemma-7b-it': 'gemma-7b-it',
  },
};

// Model capabilities
export interface ModelCapabilities {
  supportsTools: boolean;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsThinking: boolean;
  maxContextLength: number;
  maxOutputTokens: number;
}

// Model capabilities database
export const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  // OpenAI models
  'gpt-4o': {
    supportsTools: true,
    supportsStreaming: true,
    supportsVision: true,
    supportsThinking: false,
    maxContextLength: 128000,
    maxOutputTokens: 16384,
  },
  'gpt-4o-mini': {
    supportsTools: true,
    supportsStreaming: true,
    supportsVision: true,
    supportsThinking: false,
    maxContextLength: 128000,
    maxOutputTokens: 16384,
  },
  'o1-preview': {
    supportsTools: false,
    supportsStreaming: false,
    supportsVision: false,
    supportsThinking: true,
    maxContextLength: 128000,
    maxOutputTokens: 32768,
  },
  'o1-mini': {
    supportsTools: false,
    supportsStreaming: false,
    supportsVision: false,
    supportsThinking: true,
    maxContextLength: 128000,
    maxOutputTokens: 65536,
  },
  // Anthropic models
  'claude-3-5-sonnet-20241022': {
    supportsTools: true,
    supportsStreaming: true,
    supportsVision: true,
    supportsThinking: false,
    maxContextLength: 200000,
    maxOutputTokens: 8192,
  },
  'claude-3-5-haiku-20241022': {
    supportsTools: true,
    supportsStreaming: true,
    supportsVision: true,
    supportsThinking: false,
    maxContextLength: 200000,
    maxOutputTokens: 8192,
  },
  // Groq models
  'llama-3.1-405b-reasoning': {
    supportsTools: true,
    supportsStreaming: true,
    supportsVision: false,
    supportsThinking: false,
    maxContextLength: 131072,
    maxOutputTokens: 8192,
  },
  'llama-3.1-70b-versatile': {
    supportsTools: true,
    supportsStreaming: true,
    supportsVision: false,
    supportsThinking: false,
    maxContextLength: 131072,
    maxOutputTokens: 8192,
  },
};

// Detect provider from model name
export function detectProvider(modelName: string): LLMProvider {
  const resolvedModel = getModelName(modelName);
  
  for (const [provider, models] of Object.entries(PROVIDER_MODELS)) {
    if (Object.values(models).includes(resolvedModel)) {
      return provider as LLMProvider;
    }
  }
  
  // Default fallback
  if (resolvedModel.startsWith('gpt-') || resolvedModel.startsWith('o1-')) {
    return LLMProvider.OPENAI;
  }
  if (resolvedModel.startsWith('claude-')) {
    return LLMProvider.ANTHROPIC;
  }
  if (resolvedModel.includes('llama') || resolvedModel.includes('mixtral') || resolvedModel.includes('gemma')) {
    return LLMProvider.GROQ;
  }
  
  return LLMProvider.OPENAI; // Default fallback
}

// Get provider client
export function getProviderClient(provider: LLMProvider) {
  switch (provider) {
    case LLMProvider.OPENAI:
      if (!validateProviderKeys('openai')) {
        throw new Error('OpenAI API key not configured');
      }
      return openai({
        apiKey: env.OPENAI_API_KEY,
      });
      
    case LLMProvider.ANTHROPIC:
      if (!validateProviderKeys('anthropic')) {
        throw new Error('Anthropic API key not configured');
      }
      return anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });
      
    case LLMProvider.GROQ:
      if (!validateProviderKeys('groq')) {
        throw new Error('Groq API key not configured');
      }
      return createGroq({
        apiKey: env.GROQ_API_KEY,
      });
      
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// Get model instance
export function getModel(modelName: string, config?: Partial<ModelConfig>) {
  const resolvedModel = getModelName(modelName);
  const provider = detectProvider(resolvedModel);
  const client = getProviderClient(provider);
  
  logger.debug('Getting model instance', {
    originalModel: modelName,
    resolvedModel,
    provider,
  });
  
  // Apply provider-specific model mapping
  const providerModel = PROVIDER_MODELS[provider][resolvedModel] || resolvedModel;
  
  return client(providerModel, {
    // Apply configuration overrides
    ...(config?.maxTokens && { maxTokens: config.maxTokens }),
    ...(config?.temperature !== undefined && { temperature: config.temperature }),
    ...(config?.topP !== undefined && { topP: config.topP }),
    ...(config?.frequencyPenalty !== undefined && { frequencyPenalty: config.frequencyPenalty }),
    ...(config?.presencePenalty !== undefined && { presencePenalty: config.presencePenalty }),
    ...(config?.stopSequences && { stop: config.stopSequences }),
  });
}

// Get model capabilities
export function getModelCapabilities(modelName: string): ModelCapabilities {
  const resolvedModel = getModelName(modelName);
  return MODEL_CAPABILITIES[resolvedModel] || {
    supportsTools: true,
    supportsStreaming: true,
    supportsVision: false,
    supportsThinking: false,
    maxContextLength: 8192,
    maxOutputTokens: 4096,
  };
}

// Validate model configuration
export function validateModelConfig(modelName: string, config: ModelConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const capabilities = getModelCapabilities(modelName);
  
  // Check if provider is available
  const provider = detectProvider(modelName);
  if (!validateProviderKeys(provider)) {
    errors.push(`API key not configured for provider: ${provider}`);
  }
  
  // Check token limits
  if (config.maxTokens && config.maxTokens > capabilities.maxOutputTokens) {
    warnings.push(`Max tokens (${config.maxTokens}) exceeds model limit (${capabilities.maxOutputTokens})`);
  }
  
  // Check temperature range
  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2');
  }
  
  // Check thinking mode compatibility
  if (config.model.startsWith('o1-') && config.temperature !== undefined && config.temperature !== 1) {
    warnings.push('O1 models ignore temperature parameter');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Get available models for a provider
export function getAvailableModels(provider?: LLMProvider): string[] {
  if (provider) {
    return Object.keys(PROVIDER_MODELS[provider]);
  }
  
  // Return all available models
  return Object.values(PROVIDER_MODELS).flatMap(models => Object.keys(models));
}

// Check if model supports feature
export function supportsFeature(modelName: string, feature: keyof ModelCapabilities): boolean {
  const capabilities = getModelCapabilities(modelName);
  return capabilities[feature] as boolean;
}
