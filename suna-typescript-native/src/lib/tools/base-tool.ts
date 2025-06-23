import { z } from 'zod';
import { logger } from '../logging/logger';

// Schema types for tool definitions
export enum SchemaType {
  OPENAPI = 'openapi',
  XML = 'xml',
}

// XML schema definition
export interface XMLSchema {
  tag_name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    description: string;
    required?: boolean;
  }>;
  examples?: string[];
}

// Tool schema definition
export interface ToolSchema {
  schema_type: SchemaType;
  openapi_schema?: any; // OpenAPI function schema
  xml_schema?: XMLSchema;
}

// Tool execution context
export interface ToolContext {
  userId?: string;
  threadId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

// Tool execution result
export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

// Base tool interface
export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract version: string;

  // Initialize the tool (called once when registering)
  async init(): Promise<void> {
    logger.debug(`Initializing tool: ${this.name}`);
  }

  // Get tool schemas for different execution modes
  abstract getSchemas(): Record<string, ToolSchema[]>;

  // Execute a tool function
  abstract execute(
    functionName: string,
    parameters: Record<string, any>,
    context?: ToolContext
  ): Promise<ToolResult>;

  // Validate parameters against schema
  protected validateParameters(
    functionName: string,
    parameters: Record<string, any>,
    schema: z.ZodSchema
  ): ToolResult<any> {
    try {
      const validated = schema.parse(parameters);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map(e => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        return {
          success: false,
          error: `Parameter validation failed for ${functionName}: ${errorMessage}`,
        };
      }
      return {
        success: false,
        error: `Unexpected validation error for ${functionName}: ${error}`,
      };
    }
  }

  // Helper to create OpenAPI schema from Zod schema
  protected createOpenAPISchema(
    functionName: string,
    description: string,
    parametersSchema: z.ZodSchema,
    examples?: any[]
  ): ToolSchema {
    return {
      schema_type: SchemaType.OPENAPI,
      openapi_schema: {
        type: 'function',
        function: {
          name: functionName,
          description,
          parameters: this.zodToJsonSchema(parametersSchema),
          examples,
        },
      },
    };
  }

  // Helper to create XML schema
  protected createXMLSchema(
    tagName: string,
    description: string,
    parameters: XMLSchema['parameters'],
    examples?: string[]
  ): ToolSchema {
    return {
      schema_type: SchemaType.XML,
      xml_schema: {
        tag_name: tagName,
        description,
        parameters,
        examples,
      },
    };
  }

  // Convert Zod schema to JSON Schema (simplified)
  private zodToJsonSchema(schema: z.ZodSchema): any {
    // This is a simplified conversion - in production, use a library like zod-to-json-schema
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        if (value instanceof z.ZodString) {
          properties[key] = { type: 'string' };
          if (value.description) properties[key].description = value.description;
        } else if (value instanceof z.ZodNumber) {
          properties[key] = { type: 'number' };
          if (value.description) properties[key].description = value.description;
        } else if (value instanceof z.ZodBoolean) {
          properties[key] = { type: 'boolean' };
          if (value.description) properties[key].description = value.description;
        } else if (value instanceof z.ZodArray) {
          properties[key] = { type: 'array' };
          if (value.description) properties[key].description = value.description;
        } else if (value instanceof z.ZodEnum) {
          properties[key] = { 
            type: 'string',
            enum: value.options,
          };
          if (value.description) properties[key].description = value.description;
        }

        // Check if field is required (not optional)
        if (!value.isOptional()) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        required,
      };
    }

    return { type: 'object' };
  }

  // Cleanup resources (called when tool is unregistered)
  async cleanup(): Promise<void> {
    logger.debug(`Cleaning up tool: ${this.name}`);
  }
}

// Tool execution wrapper with error handling and logging
export async function executeToolSafely<T = any>(
  tool: BaseTool,
  functionName: string,
  parameters: Record<string, any>,
  context?: ToolContext
): Promise<ToolResult<T>> {
  const startTime = performance.now();
  
  try {
    logger.debug(`Executing tool function`, {
      tool: tool.name,
      function: functionName,
      parameters: Object.keys(parameters),
      context,
    });

    const result = await tool.execute(functionName, parameters, context);
    const duration = performance.now() - startTime;

    logger.info(`Tool execution completed`, {
      tool: tool.name,
      function: functionName,
      success: result.success,
      duration_ms: Math.round(duration),
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    logger.error(`Tool execution failed`, error as Error, {
      tool: tool.name,
      function: functionName,
      duration_ms: Math.round(duration),
    });

    return {
      success: false,
      error: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Tool metadata for registry
export interface ToolMetadata {
  name: string;
  description: string;
  version: string;
  instance: BaseTool;
  schemas: Record<string, ToolSchema[]>;
  registeredAt: Date;
}

// Tool registration options
export interface ToolRegistrationOptions {
  functionNames?: string[]; // Only register specific functions
  enableXML?: boolean; // Enable XML schema generation
  enableOpenAPI?: boolean; // Enable OpenAPI schema generation
  metadata?: Record<string, any>; // Additional metadata
}
