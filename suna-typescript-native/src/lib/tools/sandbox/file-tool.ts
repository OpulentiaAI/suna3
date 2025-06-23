import { z } from 'zod';
import { BaseTool, ToolSchema, SchemaType, ToolResult, ToolContext } from '../base-tool';
import { logger } from '../../logging/logger';
import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

// File operation schemas
const readFileSchema = z.object({
  path: z.string().describe('Path to the file to read'),
  encoding: z.enum(['utf8', 'base64', 'binary']).optional().default('utf8').describe('File encoding'),
  maxSize: z.number().optional().default(1024 * 1024).describe('Maximum file size in bytes'),
});

const writeFileSchema = z.object({
  path: z.string().describe('Path to the file to write'),
  content: z.string().describe('Content to write to the file'),
  encoding: z.enum(['utf8', 'base64', 'binary']).optional().default('utf8').describe('File encoding'),
  createDirs: z.boolean().optional().default(true).describe('Create parent directories if they don\'t exist'),
});

const listFilesSchema = z.object({
  path: z.string().describe('Directory path to list'),
  recursive: z.boolean().optional().default(false).describe('List files recursively'),
  includeHidden: z.boolean().optional().default(false).describe('Include hidden files'),
  pattern: z.string().optional().describe('Glob pattern to filter files'),
});

const deleteFileSchema = z.object({
  path: z.string().describe('Path to the file or directory to delete'),
  recursive: z.boolean().optional().default(false).describe('Delete directories recursively'),
});

const moveFileSchema = z.object({
  source: z.string().describe('Source file path'),
  destination: z.string().describe('Destination file path'),
  overwrite: z.boolean().optional().default(false).describe('Overwrite destination if it exists'),
});

const getFileInfoSchema = z.object({
  path: z.string().describe('Path to the file or directory'),
  includeHash: z.boolean().optional().default(false).describe('Include file hash in response'),
});

// File tool for file system operations
export class FileTool extends BaseTool {
  name = 'file_operations';
  description = 'Perform file system operations like read, write, list, delete, and move files';
  version = '1.0.0';

  private maxFileSize = 10 * 1024 * 1024; // 10MB max file size
  private allowedExtensions = new Set([
    '.txt', '.md', '.json', '.yaml', '.yml', '.xml', '.csv', '.log',
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
    '.html', '.css', '.scss', '.sass', '.less', '.sql', '.sh', '.bat',
    '.dockerfile', '.gitignore', '.env', '.config', '.ini', '.toml',
  ]);
  private sandboxPath = '/tmp/suna-sandbox'; // Sandbox directory

  async init(): Promise<void> {
    await super.init();
    
    // Ensure sandbox directory exists
    try {
      await fs.mkdir(this.sandboxPath, { recursive: true });
      logger.info('File tool initialized', { 
        sandboxPath: this.sandboxPath,
        allowedExtensions: this.allowedExtensions.size 
      });
    } catch (error) {
      logger.error('Failed to create sandbox directory', error as Error);
      throw error;
    }
  }

  getSchemas(): Record<string, ToolSchema[]> {
    return {
      read_file: [
        this.createOpenAPISchema(
          'read_file',
          'Read the contents of a file',
          readFileSchema,
          [
            { path: 'example.txt', description: 'Read a text file' },
            { path: 'data.json', encoding: 'utf8', description: 'Read a JSON file' },
          ]
        ),
        this.createXMLSchema(
          'read_file',
          'Read file contents',
          {
            path: { type: 'string', description: 'File path', required: true },
            encoding: { type: 'string', description: 'File encoding (utf8, base64, binary)', required: false },
          },
          ['<read_file>\n<path>example.txt</path>\n</read_file>']
        ),
      ],
      write_file: [
        this.createOpenAPISchema(
          'write_file',
          'Write content to a file',
          writeFileSchema,
          [
            { path: 'output.txt', content: 'Hello World', description: 'Write text to file' },
          ]
        ),
        this.createXMLSchema(
          'write_file',
          'Write content to file',
          {
            path: { type: 'string', description: 'File path', required: true },
            content: { type: 'string', description: 'File content', required: true },
            encoding: { type: 'string', description: 'File encoding', required: false },
          },
          ['<write_file>\n<path>output.txt</path>\n<content>Hello World</content>\n</write_file>']
        ),
      ],
      list_files: [
        this.createOpenAPISchema(
          'list_files',
          'List files and directories',
          listFilesSchema,
          [
            { path: '.', description: 'List current directory' },
            { path: './src', recursive: true, description: 'List src directory recursively' },
          ]
        ),
      ],
      delete_file: [
        this.createOpenAPISchema(
          'delete_file',
          'Delete a file or directory',
          deleteFileSchema,
          [
            { path: 'temp.txt', description: 'Delete a file' },
          ]
        ),
      ],
      move_file: [
        this.createOpenAPISchema(
          'move_file',
          'Move or rename a file',
          moveFileSchema,
          [
            { source: 'old.txt', destination: 'new.txt', description: 'Rename a file' },
          ]
        ),
      ],
      get_file_info: [
        this.createOpenAPISchema(
          'get_file_info',
          'Get file or directory information',
          getFileInfoSchema,
          [
            { path: 'example.txt', includeHash: true, description: 'Get file info with hash' },
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
        case 'read_file':
          return await this.readFile(parameters, context);
        case 'write_file':
          return await this.writeFile(parameters, context);
        case 'list_files':
          return await this.listFiles(parameters, context);
        case 'delete_file':
          return await this.deleteFile(parameters, context);
        case 'move_file':
          return await this.moveFile(parameters, context);
        case 'get_file_info':
          return await this.getFileInfo(parameters, context);
        default:
          return {
            success: false,
            error: `Unknown function: ${functionName}`,
          };
      }
    } catch (error) {
      logger.error(`File operation failed: ${functionName}`, error as Error, {
        parameters,
        userId: context?.userId,
      });
      return {
        success: false,
        error: `File operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async readFile(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    const validation = this.validateParameters('read_file', parameters, readFileSchema);
    if (!validation.success) return validation;

    const { path: filePath, encoding, maxSize } = validation.data;
    const safePath = this.getSafePath(filePath);

    // Security checks
    const securityCheck = this.validatePath(safePath, 'read');
    if (!securityCheck.success) return securityCheck;

    try {
      // Check file size
      const stats = await fs.stat(safePath);
      if (stats.size > Math.min(maxSize, this.maxFileSize)) {
        return {
          success: false,
          error: `File too large: ${stats.size} bytes (max: ${Math.min(maxSize, this.maxFileSize)})`,
        };
      }

      const content = await fs.readFile(safePath, encoding as BufferEncoding);
      
      logger.debug('File read successfully', {
        path: filePath,
        size: stats.size,
        encoding,
        userId: context?.userId,
      });

      return {
        success: true,
        data: {
          content,
          size: stats.size,
          encoding,
          path: filePath,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async writeFile(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    const validation = this.validateParameters('write_file', parameters, writeFileSchema);
    if (!validation.success) return validation;

    const { path: filePath, content, encoding, createDirs } = validation.data;
    const safePath = this.getSafePath(filePath);

    // Security checks
    const securityCheck = this.validatePath(safePath, 'write');
    if (!securityCheck.success) return securityCheck;

    try {
      // Create parent directories if needed
      if (createDirs) {
        const dir = path.dirname(safePath);
        await fs.mkdir(dir, { recursive: true });
      }

      await fs.writeFile(safePath, content, encoding as BufferEncoding);
      
      const stats = await fs.stat(safePath);
      
      logger.debug('File written successfully', {
        path: filePath,
        size: stats.size,
        encoding,
        userId: context?.userId,
      });

      return {
        success: true,
        data: {
          path: filePath,
          size: stats.size,
          encoding,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write file: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async listFiles(parameters: Record<string, any>, context?: ToolContext): Promise<ToolResult> {
    const validation = this.validateParameters('list_files', parameters, listFilesSchema);
    if (!validation.success) return validation;

    const { path: dirPath, recursive, includeHidden, pattern } = validation.data;
    const safePath = this.getSafePath(dirPath);

    // Security checks
    const securityCheck = this.validatePath(safePath, 'read');
    if (!securityCheck.success) return securityCheck;

    try {
      const files = await this.listDirectory(safePath, recursive, includeHidden, pattern);
      
      logger.debug('Directory listed successfully', {
        path: dirPath,
        fileCount: files.length,
        recursive,
        userId: context?.userId,
      });

      return {
        success: true,
        data: {
          path: dirPath,
          files,
          count: files.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to list directory: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async listDirectory(
    dirPath: string,
    recursive: boolean,
    includeHidden: boolean,
    pattern?: string
  ): Promise<Array<{ name: string; path: string; type: 'file' | 'directory'; size: number; modified: string }>> {
    const files: Array<{ name: string; path: string; type: 'file' | 'directory'; size: number; modified: string }> = [];
    
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!includeHidden && entry.name.startsWith('.')) continue;
      if (pattern && !entry.name.match(new RegExp(pattern))) continue;
      
      const fullPath = path.join(dirPath, entry.name);
      const stats = await fs.stat(fullPath);
      
      files.push({
        name: entry.name,
        path: path.relative(this.sandboxPath, fullPath),
        type: entry.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime.toISOString(),
      });
      
      if (recursive && entry.isDirectory()) {
        const subFiles = await this.listDirectory(fullPath, recursive, includeHidden, pattern);
        files.push(...subFiles);
      }
    }
    
    return files;
  }

  // Additional methods for delete, move, and get_file_info would go here...
  // Truncated for space, but following the same pattern

  private getSafePath(filePath: string): string {
    // Resolve path relative to sandbox
    const resolved = path.resolve(this.sandboxPath, filePath);
    
    // Ensure path is within sandbox
    if (!resolved.startsWith(this.sandboxPath)) {
      throw new Error('Path outside sandbox not allowed');
    }
    
    return resolved;
  }

  private validatePath(filePath: string, operation: 'read' | 'write'): ToolResult {
    // Check file extension for write operations
    if (operation === 'write') {
      const ext = path.extname(filePath).toLowerCase();
      if (ext && !this.allowedExtensions.has(ext)) {
        return {
          success: false,
          error: `File extension '${ext}' not allowed`,
        };
      }
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /\.\./,  // Directory traversal
      /\/proc\//,  // System files
      /\/sys\//,   // System files
      /\/dev\//,   // Device files
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(filePath)) {
        return {
          success: false,
          error: `Path contains dangerous pattern: ${pattern.source}`,
        };
      }
    }

    return { success: true };
  }

  async cleanup(): Promise<void> {
    await super.cleanup();
    logger.info('File tool cleaned up');
  }
}
