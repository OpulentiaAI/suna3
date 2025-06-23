import { CoreMessage } from 'ai';
import { db, Thread, Message } from '../database/supabase';
import { toolRegistry, ToolRegistry } from '../tools/tool-registry';
import { logger, Timer } from '../logging/logger';
import { redis } from '../cache/redis';

// Thread configuration
export interface ThreadConfig {
  userId: string;
  title?: string;
  metadata?: Record<string, any>;
  enableCaching?: boolean;
  maxMessages?: number;
}

// Message types
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ThreadMessage {
  messageId: string;
  threadId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Thread context for tool execution
export interface ThreadContext {
  threadId: string;
  userId: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

// Thread manager for conversation handling
export class ThreadManager {
  private toolRegistry: ToolRegistry;
  private enableCaching: boolean;

  constructor(toolRegistry: ToolRegistry = toolRegistry, enableCaching: boolean = true) {
    this.toolRegistry = toolRegistry;
    this.enableCaching = enableCaching;
  }

  // Create a new conversation thread
  async createThread(config: ThreadConfig): Promise<Thread> {
    const timer = new Timer('create_thread');
    
    try {
      const thread = await db.createThread(
        config.userId,
        config.title,
        config.metadata
      );

      timer.end({ threadId: thread.thread_id });
      return thread;
    } catch (error) {
      timer.end({ success: false });
      logger.error('Failed to create thread', error as Error, { userId: config.userId });
      throw error;
    }
  }

  // Get thread by ID
  async getThread(threadId: string): Promise<Thread | null> {
    try {
      // Try cache first
      if (this.enableCaching) {
        const cached = await redis.get<Thread>(`thread:${threadId}`);
        if (cached) {
          logger.debug('Thread cache hit', { threadId });
          return cached;
        }
      }

      const thread = await db.getThread(threadId);
      
      // Cache for 5 minutes
      if (thread && this.enableCaching) {
        await redis.set(`thread:${threadId}`, thread, 300);
      }

      return thread;
    } catch (error) {
      logger.error('Failed to get thread', error as Error, { threadId });
      throw error;
    }
  }

  // Add message to thread
  async addMessage(
    threadId: string,
    role: MessageRole,
    content: string,
    metadata?: Record<string, any>
  ): Promise<Message> {
    const timer = new Timer('add_message');
    
    try {
      const message = await db.addMessage(threadId, role, content, metadata);
      
      // Invalidate thread cache
      if (this.enableCaching) {
        await redis.del(`thread:${threadId}`);
        await redis.del(`messages:${threadId}`);
      }

      timer.end({ 
        messageId: message.message_id, 
        threadId, 
        role,
        contentLength: content.length 
      });
      
      return message;
    } catch (error) {
      timer.end({ success: false });
      logger.error('Failed to add message', error as Error, { threadId, role });
      throw error;
    }
  }

  // Get messages for a thread
  async getMessages(threadId: string, limit?: number): Promise<Message[]> {
    try {
      const cacheKey = `messages:${threadId}${limit ? `:${limit}` : ''}`;
      
      // Try cache first
      if (this.enableCaching) {
        const cached = await redis.get<Message[]>(cacheKey);
        if (cached) {
          logger.debug('Messages cache hit', { threadId, count: cached.length });
          return cached;
        }
      }

      const messages = await db.getMessages(threadId, limit);
      
      // Cache for 2 minutes
      if (this.enableCaching) {
        await redis.set(cacheKey, messages, 120);
      }

      return messages;
    } catch (error) {
      logger.error('Failed to get messages', error as Error, { threadId });
      throw error;
    }
  }

  // Convert database messages to AI SDK format
  async getMessagesForAI(threadId: string, limit?: number): Promise<CoreMessage[]> {
    const messages = await this.getMessages(threadId, limit);
    
    return messages.map(msg => ({
      role: msg.role as CoreMessage['role'],
      content: msg.content,
      // Include metadata if needed
      ...(msg.metadata && { metadata: msg.metadata }),
    }));
  }

  // Update thread metadata
  async updateThread(
    threadId: string,
    updates: Partial<Pick<Thread, 'title' | 'metadata'>>
  ): Promise<Thread> {
    try {
      const thread = await db.updateThread(threadId, updates);
      
      // Invalidate cache
      if (this.enableCaching) {
        await redis.del(`thread:${threadId}`);
      }

      return thread;
    } catch (error) {
      logger.error('Failed to update thread', error as Error, { threadId });
      throw error;
    }
  }

  // Delete thread and all messages
  async deleteThread(threadId: string): Promise<void> {
    const timer = new Timer('delete_thread');
    
    try {
      await db.deleteThread(threadId);
      
      // Clear cache
      if (this.enableCaching) {
        await redis.del(`thread:${threadId}`);
        await redis.del(`messages:${threadId}`);
        
        // Clear any message cache variations
        const keys = await redis.keys(`messages:${threadId}:*`);
        if (keys.length > 0) {
          await Promise.all(keys.map(key => redis.del(key)));
        }
      }

      timer.end({ threadId });
    } catch (error) {
      timer.end({ success: false });
      logger.error('Failed to delete thread', error as Error, { threadId });
      throw error;
    }
  }

  // Get thread context for tool execution
  getThreadContext(threadId: string, userId: string, requestId?: string): ThreadContext {
    return {
      threadId,
      userId,
      requestId,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Summarize old messages to manage context length
  async summarizeOldMessages(
    threadId: string,
    keepRecentCount: number = 10
  ): Promise<void> {
    const timer = new Timer('summarize_messages');
    
    try {
      const messages = await this.getMessages(threadId);
      
      if (messages.length <= keepRecentCount) {
        logger.debug('No summarization needed', { 
          threadId, 
          messageCount: messages.length,
          keepRecentCount 
        });
        return;
      }

      const oldMessages = messages.slice(0, -keepRecentCount);
      const recentMessages = messages.slice(-keepRecentCount);

      // Create summary of old messages
      const summary = this.createMessageSummary(oldMessages);
      
      // Add summary as a system message
      await this.addMessage(
        threadId,
        'system',
        `Previous conversation summary: ${summary}`,
        { type: 'summary', originalMessageCount: oldMessages.length }
      );

      // TODO: Optionally archive old messages instead of deleting
      // For now, we'll keep them but mark them as summarized
      
      timer.end({ 
        threadId,
        summarizedCount: oldMessages.length,
        keptCount: recentMessages.length 
      });
      
    } catch (error) {
      timer.end({ success: false });
      logger.error('Failed to summarize messages', error as Error, { threadId });
      throw error;
    }
  }

  // Create a text summary of messages
  private createMessageSummary(messages: Message[]): string {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    const topics = userMessages
      .map(m => m.content.substring(0, 100))
      .join('; ');
    
    return `Conversation covered ${userMessages.length} user messages and ${assistantMessages.length} assistant responses. Main topics: ${topics}`;
  }

  // Get conversation statistics
  async getThreadStats(threadId: string): Promise<{
    messageCount: number;
    userMessages: number;
    assistantMessages: number;
    toolMessages: number;
    totalCharacters: number;
    createdAt: string;
    lastActivity: string;
  }> {
    try {
      const [thread, messages] = await Promise.all([
        this.getThread(threadId),
        this.getMessages(threadId),
      ]);

      if (!thread) {
        throw new Error(`Thread ${threadId} not found`);
      }

      const userMessages = messages.filter(m => m.role === 'user').length;
      const assistantMessages = messages.filter(m => m.role === 'assistant').length;
      const toolMessages = messages.filter(m => m.role === 'tool').length;
      const totalCharacters = messages.reduce((sum, m) => sum + m.content.length, 0);
      const lastActivity = messages.length > 0 
        ? messages[messages.length - 1].created_at 
        : thread.created_at;

      return {
        messageCount: messages.length,
        userMessages,
        assistantMessages,
        toolMessages,
        totalCharacters,
        createdAt: thread.created_at,
        lastActivity,
      };
    } catch (error) {
      logger.error('Failed to get thread stats', error as Error, { threadId });
      throw error;
    }
  }

  // Cleanup old threads (utility method)
  async cleanupOldThreads(olderThanDays: number = 30): Promise<number> {
    const timer = new Timer('cleanup_old_threads');
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // This would need to be implemented in the database layer
      // For now, just log the intent
      logger.info('Thread cleanup requested', { 
        olderThanDays, 
        cutoffDate: cutoffDate.toISOString() 
      });

      timer.end({ olderThanDays });
      return 0; // TODO: Implement actual cleanup
    } catch (error) {
      timer.end({ success: false });
      logger.error('Failed to cleanup old threads', error as Error);
      throw error;
    }
  }
}
