import { BaseTool, ToolMetadata, ToolRegistrationOptions, ToolSchema, SchemaType, executeToolSafely, ToolResult, ToolContext } from './base-tool';
import { logger } from '../logging/logger';

// Registry for managing and accessing tools
export class ToolRegistry {
  private tools: Map<string, ToolMetadata> = new Map();
  private openApiTools: Map<string, ToolMetadata> = new Map();
  private xmlTools: Map<string, ToolMetadata> = new Map();

  constructor() {
    logger.debug('Initialized new ToolRegistry instance');
  }

  // Register a tool with optional function filtering
  async registerTool(
    toolClass: new () => BaseTool,
    options: ToolRegistrationOptions = {}
  ): Promise<void> {
    const {
      functionNames,
      enableXML = true,
      enableOpenAPI = true,
      metadata = {},
    } = options;

    try {
      // Create tool instance
      const toolInstance = new toolClass();
      await toolInstance.init();

      // Get schemas
      const schemas = toolInstance.getSchemas();
      
      let registeredOpenAPI = 0;
      let registeredXML = 0;

      // Register schemas
      for (const [funcName, schemaList] of Object.entries(schemas)) {
        // Skip if function not in allowed list
        if (functionNames && !functionNames.includes(funcName)) {
          continue;
        }

        for (const schema of schemaList) {
          if (schema.schema_type === SchemaType.OPENAPI && enableOpenAPI) {
            this.openApiTools.set(funcName, {
              name: toolInstance.name,
              description: toolInstance.description,
              version: toolInstance.version,
              instance: toolInstance,
              schemas: { [funcName]: [schema] },
              registeredAt: new Date(),
            });
            registeredOpenAPI++;
            logger.debug(`Registered OpenAPI function ${funcName} from ${toolInstance.name}`);
          }

          if (schema.schema_type === SchemaType.XML && schema.xml_schema && enableXML) {
            const tagName = schema.xml_schema.tag_name;
            this.xmlTools.set(tagName, {
              name: toolInstance.name,
              description: toolInstance.description,
              version: toolInstance.version,
              instance: toolInstance,
              schemas: { [funcName]: [schema] },
              registeredAt: new Date(),
            });
            registeredXML++;
            logger.debug(`Registered XML tag ${tagName} -> ${funcName} from ${toolInstance.name}`);
          }
        }
      }

      // Store main tool metadata
      const toolMetadata: ToolMetadata = {
        name: toolInstance.name,
        description: toolInstance.description,
        version: toolInstance.version,
        instance: toolInstance,
        schemas,
        registeredAt: new Date(),
      };

      this.tools.set(toolInstance.name, toolMetadata);

      logger.info(`Registered tool ${toolInstance.name}`, {
        version: toolInstance.version,
        openapi_functions: registeredOpenAPI,
        xml_functions: registeredXML,
        total_functions: Object.keys(schemas).length,
        metadata,
      });
    } catch (error) {
      logger.error(`Failed to register tool ${toolClass.name}`, error as Error);
      throw error;
    }
  }

  // Unregister a tool
  async unregisterTool(toolName: string): Promise<boolean> {
    const toolMetadata = this.tools.get(toolName);
    if (!toolMetadata) {
      logger.warn(`Tool ${toolName} not found for unregistration`);
      return false;
    }

    try {
      // Cleanup tool instance
      await toolMetadata.instance.cleanup();

      // Remove from all registries
      this.tools.delete(toolName);

      // Remove from OpenAPI registry
      for (const [funcName, metadata] of this.openApiTools.entries()) {
        if (metadata.name === toolName) {
          this.openApiTools.delete(funcName);
        }
      }

      // Remove from XML registry
      for (const [tagName, metadata] of this.xmlTools.entries()) {
        if (metadata.name === toolName) {
          this.xmlTools.delete(tagName);
        }
      }

      logger.info(`Unregistered tool ${toolName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to unregister tool ${toolName}`, error as Error);
      return false;
    }
  }

  // Get a specific tool by name
  getTool(toolName: string): ToolMetadata | null {
    return this.tools.get(toolName) || null;
  }

  // Get tool by OpenAPI function name
  getOpenAPITool(functionName: string): ToolMetadata | null {
    return this.openApiTools.get(functionName) || null;
  }

  // Get tool by XML tag name
  getXMLTool(tagName: string): ToolMetadata | null {
    return this.xmlTools.get(tagName) || null;
  }

  // Get all registered tools
  getAllTools(): ToolMetadata[] {
    return Array.from(this.tools.values());
  }

  // Get OpenAPI schemas for function calling
  getOpenAPISchemas(): any[] {
    const schemas: any[] = [];
    
    for (const metadata of this.openApiTools.values()) {
      for (const schemaList of Object.values(metadata.schemas)) {
        for (const schema of schemaList) {
          if (schema.schema_type === SchemaType.OPENAPI && schema.openapi_schema) {
            schemas.push(schema.openapi_schema);
          }
        }
      }
    }

    return schemas;
  }

  // Get XML examples for prompt inclusion
  getXMLExamples(): string[] {
    const examples: string[] = [];
    
    for (const metadata of this.xmlTools.values()) {
      for (const schemaList of Object.values(metadata.schemas)) {
        for (const schema of schemaList) {
          if (schema.schema_type === SchemaType.XML && schema.xml_schema?.examples) {
            examples.push(...schema.xml_schema.examples);
          }
        }
      }
    }

    return examples;
  }

  // Execute an OpenAPI function
  async executeOpenAPIFunction(
    functionName: string,
    parameters: Record<string, any>,
    context?: ToolContext
  ): Promise<ToolResult> {
    const toolMetadata = this.getOpenAPITool(functionName);
    if (!toolMetadata) {
      return {
        success: false,
        error: `Function ${functionName} not found in registry`,
      };
    }

    return executeToolSafely(
      toolMetadata.instance,
      functionName,
      parameters,
      context
    );
  }

  // Execute an XML function
  async executeXMLFunction(
    tagName: string,
    parameters: Record<string, any>,
    context?: ToolContext
  ): Promise<ToolResult> {
    const toolMetadata = this.getXMLTool(tagName);
    if (!toolMetadata) {
      return {
        success: false,
        error: `XML tag ${tagName} not found in registry`,
      };
    }

    // Find the function name for this XML tag
    let functionName: string | null = null;
    for (const [funcName, schemaList] of Object.entries(toolMetadata.schemas)) {
      for (const schema of schemaList) {
        if (schema.schema_type === SchemaType.XML && schema.xml_schema?.tag_name === tagName) {
          functionName = funcName;
          break;
        }
      }
      if (functionName) break;
    }

    if (!functionName) {
      return {
        success: false,
        error: `No function found for XML tag ${tagName}`,
      };
    }

    return executeToolSafely(
      toolMetadata.instance,
      functionName,
      parameters,
      context
    );
  }

  // Get registry statistics
  getStats(): {
    totalTools: number;
    openApiFunctions: number;
    xmlFunctions: number;
    toolsByName: Record<string, { version: string; registeredAt: string }>;
  } {
    const toolsByName: Record<string, { version: string; registeredAt: string }> = {};
    
    for (const [name, metadata] of this.tools.entries()) {
      toolsByName[name] = {
        version: metadata.version,
        registeredAt: metadata.registeredAt.toISOString(),
      };
    }

    return {
      totalTools: this.tools.size,
      openApiFunctions: this.openApiTools.size,
      xmlFunctions: this.xmlTools.size,
      toolsByName,
    };
  }

  // Clear all tools
  async clearAll(): Promise<void> {
    logger.info('Clearing all tools from registry');
    
    // Cleanup all tool instances
    for (const metadata of this.tools.values()) {
      try {
        await metadata.instance.cleanup();
      } catch (error) {
        logger.error(`Failed to cleanup tool ${metadata.name}`, error as Error);
      }
    }

    this.tools.clear();
    this.openApiTools.clear();
    this.xmlTools.clear();
    
    logger.info('All tools cleared from registry');
  }

  // Check if a function is available
  hasOpenAPIFunction(functionName: string): boolean {
    return this.openApiTools.has(functionName);
  }

  // Check if an XML tag is available
  hasXMLTag(tagName: string): boolean {
    return this.xmlTools.has(tagName);
  }

  // Get available function names
  getAvailableFunctions(): string[] {
    return Array.from(this.openApiTools.keys());
  }

  // Get available XML tags
  getAvailableXMLTags(): string[] {
    return Array.from(this.xmlTools.keys());
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();
