import { streamText, generateText, CoreMessage, ToolInvocation, StreamTextResult } from 'ai';
import { getModel, getModelCapabilities, ModelConfig, validateModelConfig } from './providers';
import { logger, Timer } from '../logging/logger';
import { env } from '../config/environment';

// Streaming configuration
export interface StreamingConfig {
  model: string;
  messages: CoreMessage[];
  tools?: Record<string, any>;
  toolChoice?: 'auto' | 'required' | 'none';
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  enableThinking?: boolean;
  reasoningEffort?: 'low' | 'medium' | 'high';
  onFinish?: (result: any) => Promise<void>;
  onToolCall?: (toolCall: ToolInvocation) => Promise<any>;
}

// Usage tracking
export interface UsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
  duration: number;
  model: string;
  provider: string;
}

// Response metadata
export interface ResponseMetadata {
  model: string;
  provider: string;
  usage: UsageMetrics;
  finishReason: string;
  toolCalls: number;
  requestId: string;
  timestamp: string;
}

// Streaming LLM service
export class StreamingLLMService {
  private requestId: string;

  constructor(requestId?: string) {
    this.requestId = requestId || crypto.randomUUID();
  }

  // Stream text with tools
  async streamText(config: StreamingConfig): Promise<StreamTextResult<any>> {
    const timer = new Timer('llm_stream_text');
    
    try {
      // Validate configuration
      const validation = validateModelConfig(config.model, {
        provider: config.model.startsWith('gpt-') ? 'openai' : 'anthropic',
        model: config.model,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      } as ModelConfig);

      if (!validation.valid) {
        throw new Error(`Invalid model configuration: ${validation.errors.join(', ')}`);
      }

      // Log warnings
      validation.warnings.forEach(warning => {
        logger.warn('Model configuration warning', { warning, model: config.model });
      });

      // Get model capabilities
      const capabilities = getModelCapabilities(config.model);
      
      // Check if tools are supported
      if (config.tools && !capabilities.supportsTools) {
        logger.warn('Model does not support tools, removing tool configuration', {
          model: config.model,
          toolCount: Object.keys(config.tools).length,
        });
        config.tools = undefined;
        config.toolChoice = undefined;
      }

      // Check if streaming is supported
      if (!capabilities.supportsStreaming) {
        logger.warn('Model does not support streaming, falling back to generate', {
          model: config.model,
        });
        return this.generateTextAsStream(config);
      }

      // Get model instance
      const model = getModel(config.model, {
        maxTokens: config.maxTokens || env.MAX_TOKENS,
        temperature: config.temperature ?? env.TEMPERATURE,
        topP: config.topP,
        frequencyPenalty: config.frequencyPenalty,
        presencePenalty: config.presencePenalty,
        stopSequences: config.stopSequences,
      });

      logger.info('Starting LLM stream', {
        model: config.model,
        messageCount: config.messages.length,
        hasTools: !!config.tools,
        toolCount: config.tools ? Object.keys(config.tools).length : 0,
        requestId: this.requestId,
      });

      // Configure streaming parameters
      const streamConfig: any = {
        model,
        messages: config.messages,
        maxTokens: config.maxTokens || env.MAX_TOKENS,
        temperature: config.temperature ?? env.TEMPERATURE,
      };

      // Add tools if supported and provided
      if (config.tools && capabilities.supportsTools) {
        streamConfig.tools = config.tools;
        if (config.toolChoice) {
          streamConfig.toolChoice = config.toolChoice;
        }
      }

      // Add thinking mode for O1 models
      if (config.enableThinking && capabilities.supportsThinking) {
        streamConfig.experimental_reasoning = {
          enabled: true,
          effort: config.reasoningEffort || 'medium',
        };
      }

      // Add finish callback
      if (config.onFinish) {
        streamConfig.onFinish = async (result: any) => {
          const duration = timer.end({
            model: config.model,
            usage: result.usage,
            finishReason: result.finishReason,
            toolCalls: result.toolCalls?.length || 0,
          });

          // Track usage metrics
          const metrics: UsageMetrics = {
            promptTokens: result.usage?.promptTokens || 0,
            completionTokens: result.usage?.completionTokens || 0,
            totalTokens: result.usage?.totalTokens || 0,
            duration,
            model: config.model,
            provider: config.model.startsWith('gpt-') ? 'openai' : 'anthropic',
          };

          logger.info('LLM stream completed', {
            requestId: this.requestId,
            metrics,
            finishReason: result.finishReason,
          });

          await config.onFinish!(result);
        };
      }

      // Add tool call handler
      if (config.onToolCall) {
        streamConfig.onToolCall = config.onToolCall;
      }

      // Start streaming
      const result = streamText(streamConfig);
      
      return result;

    } catch (error) {
      timer.end({ success: false });
      logger.error('LLM streaming failed', error as Error, {
        model: config.model,
        requestId: this.requestId,
      });
      throw error;
    }
  }

  // Generate text (non-streaming fallback)
  async generateText(config: Omit<StreamingConfig, 'onFinish' | 'onToolCall'>): Promise<{
    text: string;
    usage: UsageMetrics;
    finishReason: string;
    toolCalls: ToolInvocation[];
  }> {
    const timer = new Timer('llm_generate_text');
    
    try {
      const model = getModel(config.model, {
        maxTokens: config.maxTokens || env.MAX_TOKENS,
        temperature: config.temperature ?? env.TEMPERATURE,
      });

      logger.info('Starting LLM generation', {
        model: config.model,
        messageCount: config.messages.length,
        requestId: this.requestId,
      });

      const result = await generateText({
        model,
        messages: config.messages,
        tools: config.tools,
        toolChoice: config.toolChoice,
        maxTokens: config.maxTokens || env.MAX_TOKENS,
        temperature: config.temperature ?? env.TEMPERATURE,
      });

      const duration = timer.end({
        model: config.model,
        usage: result.usage,
        finishReason: result.finishReason,
      });

      const metrics: UsageMetrics = {
        promptTokens: result.usage?.promptTokens || 0,
        completionTokens: result.usage?.completionTokens || 0,
        totalTokens: result.usage?.totalTokens || 0,
        duration,
        model: config.model,
        provider: config.model.startsWith('gpt-') ? 'openai' : 'anthropic',
      };

      logger.info('LLM generation completed', {
        requestId: this.requestId,
        metrics,
        finishReason: result.finishReason,
      });

      return {
        text: result.text,
        usage: metrics,
        finishReason: result.finishReason,
        toolCalls: result.toolCalls || [],
      };

    } catch (error) {
      timer.end({ success: false });
      logger.error('LLM generation failed', error as Error, {
        model: config.model,
        requestId: this.requestId,
      });
      throw error;
    }
  }

  // Convert generate to stream-like interface
  private async generateTextAsStream(config: StreamingConfig): Promise<StreamTextResult<any>> {
    const result = await this.generateText(config);
    
    // Create a mock stream result
    return {
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      toolCalls: result.toolCalls,
      toDataStreamResponse: () => {
        return new Response(
          JSON.stringify({
            text: result.text,
            usage: result.usage,
            finishReason: result.finishReason,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      },
    } as StreamTextResult<any>;
  }

  // Get request ID
  getRequestId(): string {
    return this.requestId;
  }
}

// Factory function for creating streaming service
export function createStreamingService(requestId?: string): StreamingLLMService {
  return new StreamingLLMService(requestId);
}

// Helper function for quick streaming
export async function quickStream(
  model: string,
  messages: CoreMessage[],
  tools?: Record<string, any>,
  options?: Partial<StreamingConfig>
): Promise<StreamTextResult<any>> {
  const service = createStreamingService();
  return service.streamText({
    model,
    messages,
    tools,
    ...options,
  });
}

// Helper function for quick generation
export async function quickGenerate(
  model: string,
  messages: CoreMessage[],
  tools?: Record<string, any>,
  options?: Partial<StreamingConfig>
): Promise<{
  text: string;
  usage: UsageMetrics;
  finishReason: string;
  toolCalls: ToolInvocation[];
}> {
  const service = createStreamingService();
  return service.generateText({
    model,
    messages,
    tools,
    ...options,
  });
}
