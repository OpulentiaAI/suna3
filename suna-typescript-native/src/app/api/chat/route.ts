import { NextRequest } from 'next/server';
import { tool } from 'ai';
import { z } from 'zod';
import { ThreadManager } from '@/lib/agent/thread-manager';
import { toolRegistry } from '@/lib/tools/tool-registry';
import { ShellTool } from '@/lib/tools/sandbox/shell-tool';
import { FileTool } from '@/lib/tools/sandbox/file-tool';
import { BrowserTool } from '@/lib/tools/external/browser-tool';
import { WebSearchTool } from '@/lib/tools/external/web-search-tool';
import { createStreamingService } from '@/lib/llm/streaming-service';
import { logger, createRequestLogger } from '@/lib/logging/logger';
import { db } from '@/lib/database/supabase';
import { redis } from '@/lib/cache/redis';
import { env, getModelName } from '@/lib/config/environment';

// Initialize infrastructure
let isInitialized = false;

async function initializeInfrastructure() {
  if (isInitialized) return;

  try {
    // Initialize database
    await db.initialize();

    // Initialize Redis
    await redis.initialize();

    // Register all tools
    await toolRegistry.registerTool(ShellTool);
    await toolRegistry.registerTool(FileTool);
    await toolRegistry.registerTool(BrowserTool);
    await toolRegistry.registerTool(WebSearchTool);

    isInitialized = true;
    logger.info('Infrastructure initialized successfully', {
      toolsRegistered: toolRegistry.getStats().totalTools,
    });
  } catch (error) {
    logger.error('Failed to initialize infrastructure', error as Error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId);

  try {
    // Initialize infrastructure on first request
    await initializeInfrastructure();

    const body = await req.json();
    const { messages, threadId, userId = 'anonymous' } = body;

    requestLogger.info('Chat request received', {
      messageCount: messages?.length,
      threadId,
      userId,
    });

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    const threadManager = new ThreadManager();
    let currentThreadId = threadId;

    // Create thread if not provided
    if (!currentThreadId) {
      const thread = await threadManager.createThread({
        userId,
        title: 'New Conversation',
      });
      currentThreadId = thread.thread_id;
      requestLogger.info('Created new thread', { threadId: currentThreadId });
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1];
    if (!userMessage || userMessage.role !== 'user') {
      return new Response('No user message found', { status: 400 });
    }

    // Add user message to thread
    await threadManager.addMessage(
      currentThreadId,
      'user',
      userMessage.content as string
    );

    // Get conversation history
    const conversationHistory = await threadManager.getMessagesForAI(currentThreadId);

    // Create tool context
    const toolContext = threadManager.getThreadContext(currentThreadId, userId, requestId);

    // Create streaming service
    const streamingService = createStreamingService(requestId);

    // Define tools for the AI
    const tools = {
      executeShell: tool({
        description: 'Execute shell commands in a secure sandbox environment',
        parameters: z.object({
          command: z.string().describe('The shell command to execute'),
          timeout: z.number().optional().default(30).describe('Timeout in seconds'),
        }),
        execute: async ({ command, timeout }) => {
          requestLogger.debug('Executing shell command', { command });
          return await toolRegistry.executeOpenAPIFunction(
            'execute',
            { command, timeout },
            toolContext
          );
        },
      }),
      readFile: tool({
        description: 'Read the contents of a file',
        parameters: z.object({
          path: z.string().describe('Path to the file to read'),
          encoding: z.enum(['utf8', 'base64', 'binary']).optional().default('utf8'),
        }),
        execute: async ({ path, encoding }) => {
          return await toolRegistry.executeOpenAPIFunction(
            'read_file',
            { path, encoding },
            toolContext
          );
        },
      }),
      writeFile: tool({
        description: 'Write content to a file',
        parameters: z.object({
          path: z.string().describe('Path to the file to write'),
          content: z.string().describe('Content to write to the file'),
          encoding: z.enum(['utf8', 'base64', 'binary']).optional().default('utf8'),
        }),
        execute: async ({ path, content, encoding }) => {
          return await toolRegistry.executeOpenAPIFunction(
            'write_file',
            { path, content, encoding },
            toolContext
          );
        },
      }),
      searchWeb: tool({
        description: 'Search the web for information',
        parameters: z.object({
          query: z.string().describe('Search query'),
          maxResults: z.number().optional().default(5).describe('Maximum number of results'),
          includeAnswer: z.boolean().optional().default(true).describe('Include AI-generated answer'),
        }),
        execute: async ({ query, maxResults, includeAnswer }) => {
          return await toolRegistry.executeOpenAPIFunction(
            'search',
            { query, maxResults, includeAnswer },
            toolContext
          );
        },
      }),
      extractWebContent: tool({
        description: 'Extract content from a webpage',
        parameters: z.object({
          url: z.string().url().describe('URL to extract content from'),
          extractText: z.boolean().optional().default(true).describe('Extract text content'),
          extractLinks: z.boolean().optional().default(false).describe('Extract links'),
        }),
        execute: async ({ url, extractText, extractLinks }) => {
          return await toolRegistry.executeOpenAPIFunction(
            'extract_content',
            { url, extractText, extractLinks },
            toolContext
          );
        },
      }),
    };

    // Stream response with tools
    const result = await streamingService.streamText({
      model: getModelName(env.DEFAULT_MODEL),
      messages: conversationHistory,
      tools,
      maxTokens: env.MAX_TOKENS,
      temperature: env.TEMPERATURE,
      onFinish: async (result: any) => {
        // Save assistant response to thread
        if (result.text) {
          await threadManager.addMessage(
            currentThreadId,
            'assistant',
            result.text,
            {
              usage: result.usage,
              finishReason: result.finishReason,
              toolCalls: result.toolCalls?.length || 0,
            }
          );
        }

        requestLogger.info('Chat response completed', {
          threadId: currentThreadId,
          usage: result.usage,
          finishReason: result.finishReason,
          toolCalls: result.toolCalls?.length || 0,
        });
      },
    });

    return result.toDataStreamResponse({
      headers: {
        'X-Thread-ID': currentThreadId,
        'X-Request-ID': requestId,
      },
    });

  } catch (error) {
    requestLogger.error('Chat request failed', error as Error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        requestId,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
