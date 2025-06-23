import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/environment';
import { logger } from '../logging/logger';

// Database types
export interface Thread {
  thread_id: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  title?: string;
  metadata?: Record<string, any>;
}

export interface Message {
  message_id: string;
  thread_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  agent_id: string;
  account_id: string;
  name: string;
  description?: string;
  system_prompt: string;
  configured_mcps: Record<string, any>[];
  custom_mcps?: Record<string, any>[];
  agentpress_tools: Record<string, any>;
  is_default: boolean;
  is_public?: boolean;
  marketplace_published_at?: string;
  download_count?: number;
  tags?: string[];
  avatar?: string;
  avatar_color?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentRun {
  agent_run_id: string;
  thread_id: string;
  account_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  model_name: string;
  enable_thinking: boolean;
  reasoning_effort: string;
  stream: boolean;
  enable_context_manager: boolean;
  agent_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

// Database connection class
export class DatabaseConnection {
  private client: SupabaseClient;
  private isInitialized = false;

  constructor() {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Test connection
      const { error } = await this.client.from('threads').select('count').limit(1);
      if (error) throw error;
      
      this.isInitialized = true;
      logger.info('Database connection initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database connection', error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // Supabase client doesn't need explicit disconnection
    this.isInitialized = false;
    logger.info('Database connection closed');
  }

  // Thread operations
  async createThread(accountId: string, title?: string, metadata?: Record<string, any>): Promise<Thread> {
    const { data, error } = await this.client
      .from('threads')
      .insert({
        account_id: accountId,
        title,
        metadata,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create thread', error);
      throw new Error(`Failed to create thread: ${error.message}`);
    }

    logger.debug('Created thread', { threadId: data.thread_id, accountId });
    return data;
  }

  async getThread(threadId: string): Promise<Thread | null> {
    const { data, error } = await this.client
      .from('threads')
      .select('*')
      .eq('thread_id', threadId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error('Failed to get thread', error);
      throw new Error(`Failed to get thread: ${error.message}`);
    }

    return data;
  }

  async updateThread(threadId: string, updates: Partial<Thread>): Promise<Thread> {
    const { data, error } = await this.client
      .from('threads')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('thread_id', threadId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update thread', error);
      throw new Error(`Failed to update thread: ${error.message}`);
    }

    return data;
  }

  async deleteThread(threadId: string): Promise<void> {
    const { error } = await this.client
      .from('threads')
      .delete()
      .eq('thread_id', threadId);

    if (error) {
      logger.error('Failed to delete thread', error);
      throw new Error(`Failed to delete thread: ${error.message}`);
    }

    logger.debug('Deleted thread', { threadId });
  }

  // Message operations
  async addMessage(
    threadId: string,
    role: Message['role'],
    content: string,
    metadata?: Record<string, any>
  ): Promise<Message> {
    const { data, error } = await this.client
      .from('messages')
      .insert({
        thread_id: threadId,
        role,
        content,
        metadata,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to add message', error);
      throw new Error(`Failed to add message: ${error.message}`);
    }

    logger.debug('Added message', { messageId: data.message_id, threadId, role });
    return data;
  }

  async getMessages(threadId: string, limit?: number): Promise<Message[]> {
    let query = this.client
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to get messages', error);
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    return data || [];
  }

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<Message> {
    const { data, error } = await this.client
      .from('messages')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('message_id', messageId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update message', error);
      throw new Error(`Failed to update message: ${error.message}`);
    }

    return data;
  }

  // Agent operations
  async createAgent(agent: Omit<Agent, 'agent_id' | 'created_at' | 'updated_at'>): Promise<Agent> {
    const { data, error } = await this.client
      .from('agents')
      .insert(agent)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create agent', error);
      throw new Error(`Failed to create agent: ${error.message}`);
    }

    logger.debug('Created agent', { agentId: data.agent_id, name: data.name });
    return data;
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    const { data, error } = await this.client
      .from('agents')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error('Failed to get agent', error);
      throw new Error(`Failed to get agent: ${error.message}`);
    }

    return data;
  }

  async getAgentsByAccount(accountId: string): Promise<Agent[]> {
    const { data, error } = await this.client
      .from('agents')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to get agents by account', error);
      throw new Error(`Failed to get agents: ${error.message}`);
    }

    return data || [];
  }

  // Agent run operations
  async createAgentRun(agentRun: Omit<AgentRun, 'agent_run_id' | 'created_at' | 'updated_at'>): Promise<AgentRun> {
    const { data, error } = await this.client
      .from('agent_runs')
      .insert(agentRun)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create agent run', error);
      throw new Error(`Failed to create agent run: ${error.message}`);
    }

    logger.debug('Created agent run', { agentRunId: data.agent_run_id, threadId: data.thread_id });
    return data;
  }

  async updateAgentRun(agentRunId: string, updates: Partial<AgentRun>): Promise<AgentRun> {
    const { data, error } = await this.client
      .from('agent_runs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('agent_run_id', agentRunId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update agent run', error);
      throw new Error(`Failed to update agent run: ${error.message}`);
    }

    return data;
  }

  // Raw client access for complex queries
  get raw(): SupabaseClient {
    return this.client;
  }
}

// Singleton instance
export const db = new DatabaseConnection();
