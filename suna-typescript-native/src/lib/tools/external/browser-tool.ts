import { z } from 'zod';
import { BaseTool, ToolSchema, SchemaType, ToolResult, ToolContext } from '../base-tool';
import { logger } from '../../logging/logger';
import { env } from '../../config/environment';

// Browser operation schemas
const navigateSchema = z.object({
  url: z.string().url().describe('URL to navigate to'),
  waitFor: z.enum(['load', 'domcontentloaded', 'networkidle']).optional().default('load').describe('Wait condition'),
  timeout: z.number().optional().default(30000).describe('Timeout in milliseconds'),
});

const extractContentSchema = z.object({
  url: z.string().url().describe('URL to extract content from'),
  selector: z.string().optional().describe('CSS selector to extract specific content'),
  extractText: z.boolean().optional().default(true).describe('Extract text content'),
  extractLinks: z.boolean().optional().default(false).describe('Extract links'),
  extractImages: z.boolean().optional().default(false).describe('Extract images'),
  maxLength: z.number().optional().default(50000).describe('Maximum content length'),
});

const clickElementSchema = z.object({
  selector: z.string().describe('CSS selector of element to click'),
  waitFor: z.string().optional().describe('CSS selector to wait for after click'),
  timeout: z.number().optional().default(5000).describe('Timeout in milliseconds'),
});

const fillFormSchema = z.object({
  selector: z.string().describe('CSS selector of form input'),
  value: z.string().describe('Value to fill'),
  submit: z.boolean().optional().default(false).describe('Submit form after filling'),
});

const takeScreenshotSchema = z.object({
  fullPage: z.boolean().optional().default(false).describe('Take full page screenshot'),
  selector: z.string().optional().describe('CSS selector to screenshot specific element'),
  format: z.enum(['png', 'jpeg']).optional().default('png').describe('Image format'),
});

const waitForElementSchema = z.object({
  selector: z.string().describe('CSS selector to wait for'),
  timeout: z.number().optional().default(10000).describe('Timeout in milliseconds'),
  visible: z.boolean().optional().default(true).describe('Wait for element to be visible'),
});

// Browser automation tool using Browserbase
export class BrowserTool extends BaseTool {
  name = 'browser_automation';
  description = 'Automate web browser interactions including navigation, content extraction, and form filling';
  version = '1.0.0';

  private browserbaseApiKey?: string;
  private sessionId?: string;
  private currentUrl?: string;

  async init(): Promise<void> {
    await super.init();
    this.browserbaseApiKey = env.BROWSERBASE_API_KEY;
    
    if (!this.browserbaseApiKey) {
      logger.warn('Browserbase API key not configured, browser automation will be limited');
    } else {
      logger.info('Browser tool initialized with Browserbase');
    }
  }

  getSchemas(): Record<string, ToolSchema[]> {
    return {
      navigate: [
        this.createOpenAPISchema(
          'navigate',
          'Navigate to a URL',
          navigateSchema,
          [
            { url: 'https://example.com', description: 'Navigate to a website' },
            { url: 'https://news.ycombinator.com', waitFor: 'networkidle', description: 'Navigate and wait for network idle' },
          ]
        ),
        this.createXMLSchema(
          'browser_navigate',
          'Navigate to URL',
          {
            url: { type: 'string', description: 'URL to navigate to', required: true },
            waitFor: { type: 'string', description: 'Wait condition', required: false },
          },
          ['<browser_navigate>\n<url>https://example.com</url>\n</browser_navigate>']
        ),
      ],
      extract_content: [
        this.createOpenAPISchema(
          'extract_content',
          'Extract content from a webpage',
          extractContentSchema,
          [
            { url: 'https://example.com', extractText: true, extractLinks: true, description: 'Extract text and links' },
            { url: 'https://news.ycombinator.com', selector: '.storylink', description: 'Extract specific elements' },
          ]
        ),
        this.createXMLSchema(
          'browser_extract',
          'Extract webpage content',
          {
            url: { type: 'string', description: 'URL to extract from', required: true },
            selector: { type: 'string', description: 'CSS selector', required: false },
            extractText: { type: 'boolean', description: 'Extract text', required: false },
          },
          ['<browser_extract>\n<url>https://example.com</url>\n<extractText>true</extractText>\n</browser_extract>']
        ),
      ],
      click_element: [
        this.createOpenAPISchema(
          'click_element',
          'Click an element on the page',
          clickElementSchema,
          [
            { selector: 'button.submit', description: 'Click a submit button' },
            { selector: 'a[href="/login"]', waitFor: 'form', description: 'Click link and wait for form' },
          ]
        ),
      ],
      fill_form: [
        this.createOpenAPISchema(
          'fill_form',
          'Fill a form input',
          fillFormSchema,
          [
            { selector: 'input[name="email"]', value: 'user@example.com', description: 'Fill email field' },
            { selector: 'textarea', value: 'Hello world', submit: true, description: 'Fill and submit form' },
          ]
        ),
      ],
      take_screenshot: [
        this.createOpenAPISchema(
          'take_screenshot',
          'Take a screenshot of the page',
          takeScreenshotSchema,
          [
            { fullPage: true, format: 'png', description: 'Full page screenshot' },
            { selector: '.main-content', description: 'Screenshot specific element' },
          ]
        ),
      ],
      wait_for_element: [
        this.createOpenAPISchema(
          'wait_for_element',
          'Wait for an element to appear',
          waitForElementSchema,
          [
            { selector: '.loading', visible: false, description: 'Wait for loading to disappear' },
            { selector: '.content', timeout: 15000, description: 'Wait for content with custom timeout' },
          ]
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
        case 'navigate':
          return await this.navigate(parameters, context);
        case 'extract_content':
          return await this.extractContent(parameters, context);
        case 'click_element':
          return await this.clickElement(parameters, context);
        case 'fill_form':
          return await this.fillForm(parameters, context);
        case 'take_screenshot':
          return await this.takeScreenshot(parameters, context);
        case 'wait_for_element':
          return await this.waitForElement(parameters, context);
        default:
          return {
            success: false,
            error: `Unknown function: ${functionName}`,
          };
      }
    } catch (error) {
      logger.error(`Browser operation failed: ${functionName}`, error as Error, {
        parameters,
        userId: context?.userId,
      });
      return {
        success: false,
        error: `Browser operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async navigate(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    const validation = this.validateParameters('navigate', parameters, navigateSchema);
    if (!validation.success) return validation;

    const { url, waitFor, timeout } = validation.data;

    try {
      // For now, we'll use a simple fetch-based approach for content extraction
      // In production, this would use Browserbase or Playwright
      logger.info('Navigating to URL', { url, waitFor, timeout, userId: context?.userId });

      // Simulate navigation
      this.currentUrl = url;
      
      // Basic URL validation
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          success: false,
          error: 'Only HTTP and HTTPS URLs are supported',
        };
      }

      return {
        success: true,
        data: {
          url,
          title: `Page at ${urlObj.hostname}`,
          status: 'navigated',
          currentUrl: url,
        },
        metadata: {
          waitFor,
          timeout,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Navigation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async extractContent(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    const validation = this.validateParameters('extract_content', parameters, extractContentSchema);
    if (!validation.success) return validation;

    const { url, selector, extractText, extractLinks, extractImages, maxLength } = validation.data;

    try {
      logger.info('Extracting content from URL', { 
        url, 
        selector, 
        extractText, 
        extractLinks, 
        extractImages,
        userId: context?.userId 
      });

      // Simple fetch-based content extraction
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Suna-Agent/1.0)',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const html = await response.text();
      
      // Basic HTML parsing (in production, use a proper HTML parser)
      let content = html;
      
      // Extract text content (remove HTML tags)
      if (extractText) {
        content = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      // Truncate if too long
      if (content.length > maxLength) {
        content = content.substring(0, maxLength) + '...';
      }

      const links: string[] = [];
      const images: string[] = [];

      // Extract links
      if (extractLinks) {
        const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi);
        if (linkMatches) {
          linkMatches.forEach(match => {
            const hrefMatch = match.match(/href=["']([^"']+)["']/i);
            if (hrefMatch) {
              try {
                const linkUrl = new URL(hrefMatch[1], url);
                links.push(linkUrl.href);
              } catch {
                // Invalid URL, skip
              }
            }
          });
        }
      }

      // Extract images
      if (extractImages) {
        const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
        if (imgMatches) {
          imgMatches.forEach(match => {
            const srcMatch = match.match(/src=["']([^"']+)["']/i);
            if (srcMatch) {
              try {
                const imgUrl = new URL(srcMatch[1], url);
                images.push(imgUrl.href);
              } catch {
                // Invalid URL, skip
              }
            }
          });
        }
      }

      return {
        success: true,
        data: {
          url,
          content,
          contentLength: content.length,
          ...(extractLinks && { links }),
          ...(extractImages && { images }),
        },
        metadata: {
          extractedAt: new Date().toISOString(),
          selector,
          extractText,
          extractLinks,
          extractImages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Content extraction failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  // Placeholder implementations for other methods
  private async clickElement(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    return {
      success: false,
      error: 'Click element requires active browser session (Browserbase integration needed)',
    };
  }

  private async fillForm(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    return {
      success: false,
      error: 'Fill form requires active browser session (Browserbase integration needed)',
    };
  }

  private async takeScreenshot(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    return {
      success: false,
      error: 'Screenshot requires active browser session (Browserbase integration needed)',
    };
  }

  private async waitForElement(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    return {
      success: false,
      error: 'Wait for element requires active browser session (Browserbase integration needed)',
    };
  }

  async cleanup(): Promise<void> {
    await super.cleanup();
    if (this.sessionId) {
      // Clean up browser session
      logger.info('Cleaning up browser session', { sessionId: this.sessionId });
      this.sessionId = undefined;
    }
    logger.info('Browser tool cleaned up');
  }
}
