import {
  createSandbox,
  runCodeInSandbox,
  type Sandbox,
} from "./daytona";
import { browse } from "./browser";
import { getFirecrawlClient } from "./research";
import { CoreMessage, streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const SYSTEM_PROMPT = `You are Suna, an AI agent with the following tools:
1. Web Browser (browse any URL and read content)
2. Code Executor (run code in Python/JS and get output)

When you need to use a tool, output an Action: followed by the tool name and details.
Otherwise, if you have enough information, directly provide the final answer.`;

export class AgentManager {
  private conversationHistory: CoreMessage[];
  private sandbox: Sandbox | undefined;

  constructor() {
    this.conversationHistory = [{ role: 'system', content: SYSTEM_PROMPT }];
  }

  private async getSandbox() {
    if (!this.sandbox) {
      this.sandbox = await createSandbox();
    }
    return this.sandbox;
  }

  async processUserMessage(userMessage: string) {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    while (true) {
      const result = await streamText({
        model: openai('gpt-4'),
        messages: this.conversationHistory,
        tools: {
          BrowseWeb: tool({
            description: 'Browse a a web page and extract content',
            parameters: z.object({
              url: z.string(),
              prompt: z.string().describe('A prompt for what to extract from the page'),
            }),
            execute: async ({ url, prompt }) => browse(url, prompt),
          }),
          ExecuteCode: tool({
            description: 'Execute code in a sandbox',
            parameters: z.object({
              language: z.enum(['python', 'javascript']),
              code: z.string(),
            }),
            execute: async ({ language, code }) => {
              const sandbox = await this.getSandbox();
              return runCodeInSandbox(sandbox, code, language);
            },
          }),
          DeepResearch: tool({
            description: 'Perform deep research on a topic',
            parameters: z.object({
              topic: z.string().describe('The topic or question to research'),
            }),
            execute: async ({ topic }) => {
              const firecrawl = getFirecrawlClient();
              const result = await firecrawl.search(topic);
              if (result.success) {
                const urls = result.data
                  .slice(0, 3)
                  .map((r) => r.url)
                  .filter((url): url is string => !!url);
                const extractions = await firecrawl.extract(urls, {
                  prompt: `Extract key information about ${topic}. Focus on facts, data, and expert opinions. Analysis should be full of details and very comprehensive.`,
                });
                return extractions;
              }
              return result;
            },
          }),
        },
      });

      return result.toDataStreamResponse();
    }
  }
}
