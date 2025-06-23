import { z } from 'zod';
import { BaseTool, ToolSchema, SchemaType, ToolResult, ToolContext } from '../base-tool';
import { logger } from '../../logging/logger';
import { env } from '../../config/environment';

// Search operation schemas
const searchSchema = z.object({
  query: z.string().describe('Search query'),
  maxResults: z.number().optional().default(10).describe('Maximum number of results'),
  includeImages: z.boolean().optional().default(false).describe('Include image results'),
  includeAnswer: z.boolean().optional().default(true).describe('Include AI-generated answer'),
  searchDepth: z.enum(['basic', 'advanced']).optional().default('basic').describe('Search depth'),
  domains: z.array(z.string()).optional().describe('Specific domains to search'),
  excludeDomains: z.array(z.string()).optional().describe('Domains to exclude'),
});

const newsSearchSchema = z.object({
  query: z.string().describe('News search query'),
  maxResults: z.number().optional().default(10).describe('Maximum number of results'),
  days: z.number().optional().default(7).describe('Number of days to look back'),
  location: z.string().optional().describe('Geographic location for news'),
});

const researchSchema = z.object({
  topic: z.string().describe('Research topic'),
  depth: z.enum(['quick', 'comprehensive']).optional().default('quick').describe('Research depth'),
  maxSources: z.number().optional().default(5).describe('Maximum number of sources'),
  includeAcademic: z.boolean().optional().default(false).describe('Include academic sources'),
});

// Search result interfaces
interface SearchResult {
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
  score?: number;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  answer?: string;
  totalResults: number;
  searchTime: number;
}

// Web search tool using Tavily API
export class WebSearchTool extends BaseTool {
  name = 'web_search';
  description = 'Search the web for information, news, and research topics';
  version = '1.0.0';

  private tavilyApiKey?: string;
  private baseUrl = 'https://api.tavily.com';

  async init(): Promise<void> {
    await super.init();
    this.tavilyApiKey = env.TAVILY_API_KEY;
    
    if (!this.tavilyApiKey) {
      logger.warn('Tavily API key not configured, web search will use fallback methods');
    } else {
      logger.info('Web search tool initialized with Tavily API');
    }
  }

  getSchemas(): Record<string, ToolSchema[]> {
    return {
      search: [
        this.createOpenAPISchema(
          'search',
          'Search the web for information',
          searchSchema,
          [
            { query: 'latest AI developments', maxResults: 5, description: 'Search for AI news' },
            { query: 'TypeScript best practices', includeAnswer: true, description: 'Search with AI answer' },
            { query: 'climate change', domains: ['nasa.gov', 'noaa.gov'], description: 'Search specific domains' },
          ]
        ),
        this.createXMLSchema(
          'web_search',
          'Search the web',
          {
            query: { type: 'string', description: 'Search query', required: true },
            maxResults: { type: 'number', description: 'Maximum results', required: false },
            includeAnswer: { type: 'boolean', description: 'Include AI answer', required: false },
          },
          ['<web_search>\n<query>latest AI developments</query>\n<maxResults>5</maxResults>\n</web_search>']
        ),
      ],
      news_search: [
        this.createOpenAPISchema(
          'news_search',
          'Search for recent news',
          newsSearchSchema,
          [
            { query: 'technology news', days: 3, maxResults: 10, description: 'Recent tech news' },
            { query: 'climate change', location: 'United States', description: 'Location-specific news' },
          ]
        ),
        this.createXMLSchema(
          'news_search',
          'Search for news',
          {
            query: { type: 'string', description: 'News query', required: true },
            days: { type: 'number', description: 'Days to look back', required: false },
            maxResults: { type: 'number', description: 'Maximum results', required: false },
          },
          ['<news_search>\n<query>technology news</query>\n<days>3</days>\n</news_search>']
        ),
      ],
      research: [
        this.createOpenAPISchema(
          'research',
          'Conduct comprehensive research on a topic',
          researchSchema,
          [
            { topic: 'renewable energy trends', depth: 'comprehensive', maxSources: 8, description: 'Deep research' },
            { topic: 'machine learning algorithms', includeAcademic: true, description: 'Academic research' },
          ]
        ),
        this.createXMLSchema(
          'research_topic',
          'Research a topic',
          {
            topic: { type: 'string', description: 'Research topic', required: true },
            depth: { type: 'string', description: 'Research depth', required: false },
            maxSources: { type: 'number', description: 'Maximum sources', required: false },
          },
          ['<research_topic>\n<topic>renewable energy trends</topic>\n<depth>comprehensive</depth>\n</research_topic>']
        ),
      ],
    };
  }

  async execute(
    functionName: string,
    parameters: Record<string, any>,
    context?: ToolContext
  ): Promise<ToolResult> {
    try {
      switch (functionName) {
        case 'search':
          return await this.search(parameters, context);
        case 'news_search':
          return await this.newsSearch(parameters, context);
        case 'research':
          return await this.research(parameters, context);
        default:
          return {
            success: false,
            error: `Unknown function: ${functionName}`,
          };
      }
    } catch (error) {
      logger.error(`Web search operation failed: ${functionName}`, error as Error, {
        parameters,
        userId: context?.userId,
      });
      return {
        success: false,
        error: `Web search failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async search(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    const validation = this.validateParameters('search', parameters, searchSchema);
    if (!validation.success) return validation;

    const { 
      query, 
      maxResults, 
      includeImages, 
      includeAnswer, 
      searchDepth, 
      domains, 
      excludeDomains 
    } = validation.data;

    const startTime = performance.now();

    try {
      logger.info('Performing web search', { 
        query, 
        maxResults, 
        searchDepth,
        userId: context?.userId 
      });

      let searchResponse: SearchResponse;

      if (this.tavilyApiKey) {
        searchResponse = await this.searchWithTavily(query, {
          maxResults,
          includeImages,
          includeAnswer,
          searchDepth,
          domains,
          excludeDomains,
        });
      } else {
        searchResponse = await this.searchWithFallback(query, maxResults);
      }

      const searchTime = performance.now() - startTime;

      return {
        success: true,
        data: {
          ...searchResponse,
          searchTime: Math.round(searchTime),
        },
        metadata: {
          searchedAt: new Date().toISOString(),
          provider: this.tavilyApiKey ? 'tavily' : 'fallback',
          parameters: {
            query,
            maxResults,
            includeAnswer,
            searchDepth,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Search failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async searchWithTavily(
    query: string, 
    options: {
      maxResults: number;
      includeImages: boolean;
      includeAnswer: boolean;
      searchDepth: string;
      domains?: string[];
      excludeDomains?: string[];
    }
  ): Promise<SearchResponse> {
    const requestBody = {
      api_key: this.tavilyApiKey,
      query,
      search_depth: options.searchDepth,
      include_answer: options.includeAnswer,
      include_images: options.includeImages,
      max_results: options.maxResults,
      ...(options.domains && { include_domains: options.domains }),
      ...(options.excludeDomains && { exclude_domains: options.excludeDomains }),
    };

    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      query,
      results: data.results?.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        publishedDate: result.published_date,
        score: result.score,
      })) || [],
      answer: data.answer,
      totalResults: data.results?.length || 0,
      searchTime: 0, // Will be set by caller
    };
  }

  private async searchWithFallback(query: string, maxResults: number): Promise<SearchResponse> {
    // Fallback search using DuckDuckGo Instant Answer API
    logger.info('Using fallback search method', { query });

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`
      );

      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.status}`);
      }

      const data = await response.json();

      const results: SearchResult[] = [];

      // Add abstract if available
      if (data.Abstract) {
        results.push({
          title: data.Heading || 'Summary',
          url: data.AbstractURL || '#',
          content: data.Abstract,
        });
      }

      // Add related topics
      if (data.RelatedTopics) {
        data.RelatedTopics.slice(0, maxResults - 1).forEach((topic: any) => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || 'Related Topic',
              url: topic.FirstURL,
              content: topic.Text,
            });
          }
        });
      }

      return {
        query,
        results,
        answer: data.Abstract || undefined,
        totalResults: results.length,
        searchTime: 0,
      };
    } catch (error) {
      logger.warn('Fallback search failed, returning empty results', { error });
      return {
        query,
        results: [],
        totalResults: 0,
        searchTime: 0,
      };
    }
  }

  private async newsSearch(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    const validation = this.validateParameters('news_search', parameters, newsSearchSchema);
    if (!validation.success) return validation;

    const { query, maxResults, days, location } = validation.data;

    try {
      logger.info('Performing news search', { query, days, location, userId: context?.userId });

      // For news search, we'll use the regular search with news-specific parameters
      const newsQuery = `${query} news ${location ? `in ${location}` : ''}`;
      
      const searchResult = await this.search({
        query: newsQuery,
        maxResults,
        includeAnswer: false,
        searchDepth: 'basic',
      }, context);

      if (!searchResult.success) {
        return searchResult;
      }

      // Filter results to focus on recent news
      const newsResults = searchResult.data.results.filter((result: SearchResult) => {
        // Simple heuristic: check if URL contains news-related domains
        const newsPatterns = [
          'news', 'reuters', 'ap.org', 'bbc', 'cnn', 'npr', 'guardian',
          'nytimes', 'washingtonpost', 'wsj', 'bloomberg', 'techcrunch'
        ];
        return newsPatterns.some(pattern => result.url.includes(pattern));
      });

      return {
        success: true,
        data: {
          query,
          results: newsResults.slice(0, maxResults),
          totalResults: newsResults.length,
          searchTime: searchResult.data.searchTime,
        },
        metadata: {
          searchedAt: new Date().toISOString(),
          type: 'news',
          parameters: { query, days, location, maxResults },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `News search failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async research(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    const validation = this.validateParameters('research', parameters, researchSchema);
    if (!validation.success) return validation;

    const { topic, depth, maxSources, includeAcademic } = validation.data;

    try {
      logger.info('Conducting research', { topic, depth, maxSources, includeAcademic, userId: context?.userId });

      const searches: Promise<ToolResult>[] = [];

      // Primary search
      searches.push(this.search({
        query: topic,
        maxResults: Math.ceil(maxSources / 2),
        includeAnswer: true,
        searchDepth: depth === 'comprehensive' ? 'advanced' : 'basic',
      }, context));

      // Academic search if requested
      if (includeAcademic) {
        searches.push(this.search({
          query: `${topic} academic research`,
          maxResults: Math.floor(maxSources / 3),
          domains: ['scholar.google.com', 'arxiv.org', 'pubmed.ncbi.nlm.nih.gov'],
          searchDepth: 'advanced',
        }, context));
      }

      // Recent developments search
      if (depth === 'comprehensive') {
        searches.push(this.search({
          query: `${topic} recent developments 2024`,
          maxResults: Math.floor(maxSources / 3),
          includeAnswer: false,
        }, context));
      }

      const results = await Promise.all(searches);
      const successfulResults = results.filter(r => r.success);

      if (successfulResults.length === 0) {
        return {
          success: false,
          error: 'All research searches failed',
        };
      }

      // Combine all results
      const allResults: SearchResult[] = [];
      let combinedAnswer = '';

      successfulResults.forEach(result => {
        if (result.data?.results) {
          allResults.push(...result.data.results);
        }
        if (result.data?.answer) {
          combinedAnswer += result.data.answer + '\n\n';
        }
      });

      // Remove duplicates based on URL
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.url === result.url)
      );

      return {
        success: true,
        data: {
          topic,
          results: uniqueResults.slice(0, maxSources),
          summary: combinedAnswer.trim(),
          totalSources: uniqueResults.length,
          researchDepth: depth,
        },
        metadata: {
          researchedAt: new Date().toISOString(),
          parameters: { topic, depth, maxSources, includeAcademic },
          searchCount: successfulResults.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Research failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async cleanup(): Promise<void> {
    await super.cleanup();
    logger.info('Web search tool cleaned up');
  }
}
